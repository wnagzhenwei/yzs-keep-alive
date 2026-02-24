import { h, ref, shallowRef, nextTick } from 'vue';
import { createCacheManager } from './cache-manager';
import { getLifecycleManager } from './lifecycle-manager';
import { generateKey, getComponentName, matches, deepClone } from './utils';
/**
 * 组件包装器，负责管理组件的缓存和切换
 */
export class ComponentWrapper {
    constructor(options = {}) {
        Object.defineProperty(this, "cacheManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: createCacheManager()
        });
        Object.defineProperty(this, "currentComponent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: shallowRef(null)
        });
        Object.defineProperty(this, "currentProps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: shallowRef({})
        });
        Object.defineProperty(this, "currentKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ref('')
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.options = options;
        this.cacheManager = createCacheManager({ max: options.max || 10 });
    }
    /**
     * 更新配置
     */
    updateOptions(options) {
        this.options = options;
        if (this.cacheManager && typeof this.cacheManager.setMaxSize === 'function') {
            ;
            this.cacheManager.setMaxSize(options.max || 10);
        }
    }
    /**
     * 检查组件是否应该被缓存
     */
    shouldCacheComponent(component) {
        const name = getComponentName(component);
        if (!name) {
            return false;
        }
        // 检查exclude
        if (this.options.exclude && matches(this.options.exclude, name)) {
            return false;
        }
        // 检查include
        if (this.options.include && !matches(this.options.include, name)) {
            return false;
        }
        return true;
    }
    /**
     * 切换组件
     */
    switchComponent(component, props = {}) {
        const name = getComponentName(component);
        const key = generateKey(component, props);
        // 触发当前组件的失活钩子
        if (this.currentComponent.value) {
            const prevComponent = this.currentComponent.value;
            const lifecycleManager = getLifecycleManager();
            lifecycleManager.triggerDeactivated(prevComponent);
        }
        // 检查是否应该缓存当前组件
        if (this.currentComponent.value && this.shouldCacheComponent(this.currentComponent.value)) {
            const prevKey = this.currentKey.value;
            if (prevKey) {
                // 保存当前组件的状态到缓存
                this.cacheManager.set(prevKey, {
                    vnode: {},
                    component: this.currentComponent.value,
                    props: deepClone(this.currentProps.value),
                    key: prevKey,
                    timestamp: Date.now()
                });
            }
        }
        // 检查新组件是否在缓存中
        if (this.cacheManager.has(key) && this.shouldCacheComponent(component)) {
            // 从缓存恢复
            const cached = this.cacheManager.get(key);
            if (cached) {
                this.currentComponent.value = cached.component;
                this.currentProps.value = deepClone(cached.props);
                // 触发激活钩子
                nextTick(() => {
                    const lifecycleManager = getLifecycleManager();
                    lifecycleManager.triggerActivated(cached.component);
                });
            }
            else {
                // 缓存项不存在，使用新组件
                this.currentComponent.value = component;
                this.currentProps.value = props;
            }
        }
        else {
            // 新组件，直接设置
            this.currentComponent.value = component;
            this.currentProps.value = props;
        }
        this.currentKey.value = key;
        // 触发新组件的激活钩子（如果不是从缓存恢复的）
        if (!this.cacheManager.has(key) || !this.shouldCacheComponent(component)) {
            nextTick(() => {
                const lifecycleManager = getLifecycleManager();
                lifecycleManager.triggerActivated(component);
            });
        }
    }
    /**
     * 渲染当前组件
     */
    render() {
        if (!this.currentComponent.value) {
            return null;
        }
        return h(this.currentComponent.value, this.currentProps.value);
    }
    /**
     * 获取当前组件
     */
    getCurrentComponent() {
        return this.currentComponent.value;
    }
    /**
     * 获取当前props
     */
    getCurrentProps() {
        return this.currentProps.value;
    }
    /**
     * 清空缓存
     */
    clearCache() {
        this.cacheManager.clear();
    }
    /**
     * 删除特定条件的缓存
     */
    pruneCache(filter) {
        const keys = this.cacheManager.keys();
        for (const key of keys) {
            if (!filter || filter(key)) {
                this.cacheManager.delete(key);
            }
        }
    }
    /**
     * 获取缓存键列表
     */
    getCachedKeys() {
        return this.cacheManager.keys();
    }
    /**
     * 获取缓存大小
     */
    getCacheSize() {
        return this.cacheManager.size();
    }
}
/**
 * 创建组件包装器实例
 */
export function createComponentWrapper(options = {}) {
    return new ComponentWrapper(options);
}
