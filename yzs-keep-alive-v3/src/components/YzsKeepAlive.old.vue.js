/// <reference types="E:/webspace/keepalive/yzskeepalive/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="E:/webspace/keepalive/yzskeepalive/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch, onMounted, onUnmounted, shallowRef, nextTick, useSlots, getCurrentInstance } from 'vue';
import { createCacheManager } from '../core/cache-manager';
import { getLifecycleManager } from '../core/lifecycle-manager';
import { createInstanceManager } from '../core/instance-manager';
import { createDOMManager } from '../core/dom-manager';
import { generateKey, getComponentName, matches, deepClone } from '../core/utils';
const props = withDefaults(defineProps(), {
    include: undefined,
    exclude: undefined,
    max: 10
});
const emit = defineEmits();
const slots = useSlots();
// 缓存管理器
const cacheManager = createCacheManager({ max: props.max });
// 实例管理器
const instanceManager = createInstanceManager();
// DOM 管理器
const domManager = createDOMManager();
// 当前组件和状态
const currentComponent = shallowRef(null);
const currentProps = shallowRef({});
const currentKey = ref('');
// 当前组件实例
const currentInstance = shallowRef(null);
// 组件引用
const componentRef = ref(null);
// 直接捕获实例的辅助ref
const internalInstanceRef = ref(null);
// 存储容器（用于隐藏DOM元素）
const storageContainer = ref(null);
// 从slot提取组件信息
const extractComponentFromSlot = () => {
    const slotContent = slots.default?.();
    if (!slotContent || slotContent.length === 0) {
        return null;
    }
    const vnode = slotContent[0];
    if (!vnode || !vnode.type) {
        return null;
    }
    return {
        component: vnode.type,
        props: vnode.props || {},
        key: vnode.key || generateKey(vnode.type, vnode.props || {})
    };
};
// 创建存储容器
const createStorageContainer = () => {
    if (!storageContainer.value) {
        const container = document.createElement('div');
        container.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: auto; visibility: hidden;';
        document.body.appendChild(container);
        storageContainer.value = container;
    }
    return storageContainer.value;
};
// 清理存储容器
const cleanupStorageContainer = () => {
    if (storageContainer.value && storageContainer.value.parentNode) {
        storageContainer.value.parentNode.removeChild(storageContainer.value);
        storageContainer.value = null;
    }
};
// 检查组件是否应该被缓存
const shouldCacheComponent = (component) => {
    const name = getComponentName(component);
    if (!name) {
        return false;
    }
    // 检查exclude
    if (props.exclude && matches(props.exclude, name)) {
        return false;
    }
    // 检查include
    if (props.include && !matches(props.include, name)) {
        return false;
    }
    return true;
};
// 更新当前显示的组件
const updateCurrentComponent = () => {
    const extracted = extractComponentFromSlot();
    if (!extracted) {
        // 清空当前组件
        if (currentComponent.value) {
            const prevComponent = currentComponent.value;
            const lifecycleManager = getLifecycleManager();
            lifecycleManager.triggerDeactivated(prevComponent);
            emit('deactivated', prevComponent);
        }
        currentComponent.value = null;
        currentProps.value = {};
        currentKey.value = '';
        currentInstance.value = null;
        return;
    }
    const { component: originalComponent, props: componentProps, key } = extracted;
    const name = getComponentName(originalComponent);
    const cacheKey = key;
    // 包装组件以支持状态收集和生命周期钩子
    const component = instanceManager.wrapComponent(originalComponent);
    console.log('[YzsKeepAlive] Extracted component:', {
        originalComponentName: getComponentName(originalComponent),
        componentProps,
        key: cacheKey,
        name,
        wrappedComponentName: getComponentName(component)
    });
    // 触发当前组件的失活钩子
    if (currentComponent.value && currentKey.value !== cacheKey) {
        const prevComponent = currentComponent.value;
        const lifecycleManager = getLifecycleManager();
        lifecycleManager.triggerDeactivated(prevComponent);
        emit('deactivated', prevComponent);
        // 缓存当前组件（如果需要）
        if (shouldCacheComponent(originalComponent) && currentKey.value) {
            console.log(`[YzsKeepAlive] Caching component: ${name}, key: ${currentKey.value}`);
            // 获取当前组件实例
            const instance = currentInstance.value;
            let componentState = null;
            let domContainer = null;
            if (instance && instance.vnode) {
                console.log(`[YzsKeepAlive] Instance found for caching:`, instance);
                try {
                    // 保存组件状态
                    componentState = instanceManager.saveInstanceState(instance);
                    console.log(`[YzsKeepAlive] Component state saved:`, componentState);
                }
                catch (error) {
                    console.error(`[YzsKeepAlive] Error saving instance state:`, error);
                    componentState = null;
                }
                // 隐藏组件DOM到存储容器
                const storageContainer = createStorageContainer();
                const el = instance.vnode.el;
                if (el && el.parentNode) {
                    console.log(`[YzsKeepAlive] Moving DOM element to storage container`);
                    // 保存DOM元素到存储容器
                    storageContainer.appendChild(el);
                    domContainer = storageContainer;
                }
            }
            else {
                console.log(`[YzsKeepAlive] No instance found for caching`);
            }
            cacheManager.set(currentKey.value, {
                vnode: {},
                component: prevComponent,
                instance: instance,
                props: deepClone(currentProps.value),
                data: componentState,
                key: currentKey.value,
                timestamp: Date.now(),
                container: domContainer
            });
            console.log(`[YzsKeepAlive] Cache set, size: ${cacheManager.size()}`);
        }
    }
    // 检查新组件是否在缓存中
    if (cacheManager.has(cacheKey) && shouldCacheComponent(originalComponent)) {
        console.log(`[YzsKeepAlive] Cache hit for key: ${cacheKey}`);
        // 从缓存恢复
        const cached = cacheManager.get(cacheKey);
        if (cached) {
            console.log(`[YzsKeepAlive] Restoring from cache:`, cached);
            currentComponent.value = cached.component;
            currentProps.value = deepClone(cached.props);
            currentKey.value = cacheKey;
            // 如果有缓存的实例状态，恢复它
            if (cached.instance && cached.data) {
                currentInstance.value = cached.instance;
                instanceManager.restoreInstanceState(cached.instance, cached.data);
                console.log(`[YzsKeepAlive] Instance state restored`);
                // 如果有缓存的DOM容器，恢复DOM位置
                if (cached.container && cached.instance.vnode.el) {
                    const el = cached.instance.vnode.el;
                    if (el.parentNode === cached.container) {
                        // 将DOM元素移回原来的位置
                        const parentEl = getCurrentInstance()?.vnode.el;
                        if (parentEl) {
                            parentEl.appendChild(el);
                        }
                    }
                }
            }
            // 触发激活钩子
            nextTick(() => {
                const lifecycleManager = getLifecycleManager();
                lifecycleManager.triggerActivated(cached.component);
                emit('activated', cached.component);
            });
            return;
        }
    }
    // 新组件或不需要缓存
    currentComponent.value = component;
    currentProps.value = componentProps;
    currentKey.value = cacheKey;
    currentInstance.value = null;
    // 触发激活钩子（如果不是从缓存恢复的）
    if (!cacheManager.has(cacheKey) || !shouldCacheComponent(originalComponent)) {
        nextTick(() => {
            const lifecycleManager = getLifecycleManager();
            lifecycleManager.triggerActivated(component);
            emit('activated', component);
        });
    }
};
// 清空缓存
const clearCache = () => {
    cacheManager.clear();
};
// 删除特定组件的缓存
const pruneCache = (filter) => {
    const keys = cacheManager.keys();
    for (const key of keys) {
        if (!filter || filter(key)) {
            cacheManager.delete(key);
        }
    }
};
// 提供给父组件调用的方法
const __VLS_exposed = {
    clearCache,
    pruneCache,
    getCachedKeys: () => cacheManager.keys(),
    getCacheSize: () => cacheManager.size()
};
defineExpose(__VLS_exposed);
// 监听组件引用变化来捕获实例
watch(componentRef, (newRef) => {
    if (newRef) {
        // 在下一个tick获取实例，确保组件已挂载
        nextTick(() => {
            try {
                // 尝试获取实际组件的实例
                let actualInstance = newRef;
                // 如果这是包装组件，尝试查找实际组件的实例
                // 包装组件可能有一个子组件
                if (actualInstance.subTree && actualInstance.subTree.component) {
                    actualInstance = actualInstance.subTree.component;
                }
                // 检查实例是否有效：有 setupState 或 data
                // 函数组件可能没有 vnode.el，所以不检查 vnode.el
                if (actualInstance && (actualInstance.setupState || actualInstance.data)) {
                    currentInstance.value = actualInstance;
                    console.log('[YzsKeepAlive] Captured instance:', actualInstance);
                    console.log('[YzsKeepAlive] Instance has setupState:', !!actualInstance.setupState);
                    console.log('[YzsKeepAlive] Instance has data:', !!actualInstance.data);
                }
                else {
                    console.log('[YzsKeepAlive] Instance captured but invalid:', actualInstance);
                    currentInstance.value = null;
                }
            }
            catch (error) {
                console.error('[YzsKeepAlive] Error capturing instance:', error);
                currentInstance.value = null;
            }
        });
    }
    else {
        currentInstance.value = null;
    }
}, { immediate: true });
// 监听slot变化
watch(() => slots.default?.(), () => {
    updateCurrentComponent();
}, { deep: true });
// 监听max属性变化
watch(() => props.max, (newMax) => {
    // 更新缓存管理器的最大容量
    if (cacheManager && typeof cacheManager.setMaxSize === 'function') {
        ;
        cacheManager.setMaxSize(newMax);
    }
});
// 初始更新
onMounted(() => {
    updateCurrentComponent();
});
// 组件卸载时清理
onUnmounted(() => {
    // 清理生命周期管理器
    const lifecycleManager = getLifecycleManager();
    if (currentComponent.value) {
        lifecycleManager.cleanupComponent(currentComponent.value);
    }
    // 清理存储容器
    cleanupStorageContainer();
});
const __VLS_defaults = {
    include: undefined,
    exclude: undefined,
    max: 10
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
const __VLS_0 = (__VLS_ctx.currentComponent);
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...(__VLS_ctx.currentProps),
    key: (__VLS_ctx.currentKey),
    ref: "componentRef",
}));
const __VLS_2 = __VLS_1({
    ...(__VLS_ctx.currentProps),
    key: (__VLS_ctx.currentKey),
    ref: "componentRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
var __VLS_3;
// @ts-ignore
var __VLS_6 = __VLS_5;
// @ts-ignore
[currentComponent, currentProps, currentKey,];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => (__VLS_exposed),
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
