import { getCurrentInstance, onActivated, onDeactivated, defineComponent, h } from 'vue';
/**
 * 实例管理器实现
 */
export class InstanceManagerImpl {
    constructor() {
        // 存储组件状态
        Object.defineProperty(this, "stateCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        // 存储组件实例引用
        Object.defineProperty(this, "instanceCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        // 存储包装后的组件
        Object.defineProperty(this, "wrappedComponents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * 包装组件以支持状态收集
     */
    wrapComponent(component) {
        // 如果已经包装过，直接返回
        if (this.wrappedComponents.has(component)) {
            return this.wrappedComponents.get(component);
        }
        const self = this; // 保存 this 引用
        const wrapped = defineComponent({
            name: `KeepAliveWrapper(${component.name || 'Anonymous'})`,
            props: component.props || {},
            setup(props, context) {
                const instance = getCurrentInstance();
                const originalComponent = component;
                // 存储包装组件实例以便后续访问
                instance.__wrappedInstance = instance;
                // 注册生命周期钩子
                onActivated(() => {
                    // 激活时恢复状态
                    const state = self.stateCache.get(instance.uid);
                    if (state) {
                        self.restoreInstanceState(instance, state);
                    }
                });
                onDeactivated(() => {
                    // 失活时保存状态
                    const state = self.saveInstanceState(instance);
                    self.stateCache.set(instance.uid, state);
                });
                // 返回渲染函数
                return () => h(originalComponent, props, context.slots);
            }
        });
        this.wrappedComponents.set(component, wrapped);
        return wrapped;
    }
    /**
     * 创建并缓存组件实例
     */
    createAndCacheInstance(vnode, container) {
        // 这里实际上由 Vue 运行时创建实例
        // 我们只需要在实例创建后收集它
        // 这个方法将在组件挂载后被调用
        const instance = vnode.component;
        this.instanceCache.set(instance.uid, instance);
        return instance;
    }
    /**
     * 从缓存恢复实例
     */
    restoreInstance(cacheKey, container) {
        // 通过 cacheKey 查找实例
        // 这里需要根据实际情况实现
        for (const [uid, instance] of this.instanceCache) {
            if (instance.type.name === cacheKey || instance.uid.toString() === cacheKey) {
                return instance;
            }
        }
        return null;
    }
    /**
     * 保存实例状态
     */
    saveInstanceState(instance) {
        try {
            const state = {
                reactive: {},
                props: {},
                attrs: {},
                slots: [],
                context: {},
                setupState: {},
                data: {},
                computed: {}
            };
            // 简化：只收集我们实际需要的数据
            // 对于测试组件，我们主要需要保存 ref 和 reactive 的值
            if (!instance.setupState) {
                console.log('[InstanceManager] No setupState found');
                return state;
            }
            // 遍历 setupState 收集简单的值
            const simpleState = {};
            for (const [key, value] of Object.entries(instance.setupState)) {
                if (value && typeof value === 'object') {
                    // 处理 ref
                    if ('_is_ref' in value && 'value' in value) {
                        try {
                            // 对于简单类型，直接保存值
                            const val = value.value;
                            if (val === null || val === undefined ||
                                typeof val === 'string' ||
                                typeof val === 'number' ||
                                typeof val === 'boolean' ||
                                (Array.isArray(val) && val.every(item => typeof item === 'string'))) {
                                simpleState[key] = val;
                                state.reactive[key] = val;
                            }
                        }
                        catch (e) {
                            console.warn(`[InstanceManager] Failed to save ref ${key}:`, e);
                        }
                    }
                    // 处理 reactive 对象（简单对象）
                    else if ('__v_isReactive' in value) {
                        try {
                            // 创建浅拷贝
                            const shallowCopy = {};
                            for (const [k, v] of Object.entries(value)) {
                                if (!k.startsWith('__v_') &&
                                    (v === null || v === undefined ||
                                        typeof v === 'string' ||
                                        typeof v === 'number' ||
                                        typeof v === 'boolean')) {
                                    shallowCopy[k] = v;
                                }
                            }
                            if (Object.keys(shallowCopy).length > 0) {
                                simpleState[key] = shallowCopy;
                                state.reactive[key] = shallowCopy;
                            }
                        }
                        catch (e) {
                            console.warn(`[InstanceManager] Failed to save reactive ${key}:`, e);
                        }
                    }
                }
            }
            state.setupState = simpleState;
            console.log('[InstanceManager] Saved state:', state);
            return state;
        }
        catch (error) {
            console.error('[InstanceManager] Error saving instance state:', error);
            // 返回空状态而不是抛出错误
            return {
                reactive: {},
                props: {},
                attrs: {},
                slots: [],
                context: {},
                setupState: {},
                data: {},
                computed: {}
            };
        }
    }
    /**
     * 恢复实例状态
     */
    restoreInstanceState(instance, state) {
        try {
            if (!instance.setupState) {
                console.log('[InstanceManager] No setupState to restore to');
                return;
            }
            console.log('[InstanceManager] Restoring state:', state);
            // 恢复响应式数据
            if (state.reactive && instance.setupState) {
                for (const [key, savedValue] of Object.entries(state.reactive)) {
                    if (key in instance.setupState) {
                        const target = instance.setupState[key];
                        if (target && typeof target === 'object') {
                            // 恢复 ref
                            if ('_is_ref' in target && 'value' in target) {
                                try {
                                    target.value = savedValue;
                                    console.log(`[InstanceManager] Restored ref ${key}:`, savedValue);
                                }
                                catch (e) {
                                    console.warn(`[InstanceManager] Failed to restore ref ${key}:`, e);
                                }
                            }
                            // 恢复 reactive 对象
                            else if ('__v_isReactive' in target) {
                                // 更新 reactive 对象的属性
                                if (savedValue && typeof savedValue === 'object') {
                                    for (const [k, v] of Object.entries(savedValue)) {
                                        if (k in target) {
                                            target[k] = v;
                                        }
                                    }
                                    console.log(`[InstanceManager] Restored reactive ${key}:`, savedValue);
                                }
                            }
                        }
                    }
                }
            }
            console.log('[InstanceManager] State restoration complete');
        }
        catch (error) {
            console.error('[InstanceManager] Error restoring instance state:', error);
        }
    }
    /**
     * 隐藏组件（保持DOM）
     */
    hideComponent(instance) {
        const el = instance.vnode.el;
        if (el) {
            el.style.display = 'none';
            // 保存当前滚动位置等
            el.__keepalive_scrollTop = el.scrollTop;
            el.__keepalive_scrollLeft = el.scrollLeft;
        }
    }
    /**
     * 显示组件
     */
    showComponent(instance) {
        const el = instance.vnode.el;
        if (el) {
            el.style.display = '';
            // 恢复滚动位置
            if (el.__keepalive_scrollTop !== undefined) {
                el.scrollTop = el.__keepalive_scrollTop;
            }
            if (el.__keepalive_scrollLeft !== undefined) {
                el.scrollLeft = el.__keepalive_scrollLeft;
            }
        }
    }
    /**
     * 清理实例缓存
     */
    cleanupInstance(uid) {
        this.stateCache.delete(uid);
        this.instanceCache.delete(uid);
    }
    /**
     * 获取所有缓存的实例
     */
    getCachedInstances() {
        return new Map(this.instanceCache);
    }
}
/**
 * 创建实例管理器
 */
export function createInstanceManager() {
    return new InstanceManagerImpl();
}
