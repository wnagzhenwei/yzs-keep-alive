import { getCurrentInstance, onUnmounted } from 'vue';
/**
 * 生命周期钩子管理器
 */
export class LifecycleManager {
    constructor() {
        Object.defineProperty(this, "activatedCallbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "deactivatedCallbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * 注册激活钩子
     */
    registerActivated(component, callback) {
        if (!this.activatedCallbacks.has(component)) {
            this.activatedCallbacks.set(component, []);
        }
        this.activatedCallbacks.get(component).push(callback);
    }
    /**
     * 注册失活钩子
     */
    registerDeactivated(component, callback) {
        if (!this.deactivatedCallbacks.has(component)) {
            this.deactivatedCallbacks.set(component, []);
        }
        this.deactivatedCallbacks.get(component).push(callback);
    }
    /**
     * 触发组件的激活钩子
     */
    triggerActivated(component) {
        const callbacks = this.activatedCallbacks.get(component);
        if (callbacks) {
            callbacks.forEach(callback => callback());
        }
    }
    /**
     * 触发组件的失活钩子
     */
    triggerDeactivated(component) {
        const callbacks = this.deactivatedCallbacks.get(component);
        if (callbacks) {
            callbacks.forEach(callback => callback());
        }
    }
    /**
     * 清理组件的所有钩子
     */
    cleanupComponent(component) {
        this.activatedCallbacks.delete(component);
        this.deactivatedCallbacks.delete(component);
    }
    /**
     * 清理所有钩子
     */
    cleanupAll() {
        this.activatedCallbacks.clear();
        this.deactivatedCallbacks.clear();
    }
}
/**
 * 创建组合式API的生命周期钩子
 */
export function useKeepAliveLifecycle() {
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error('useKeepAliveLifecycle must be called within a component setup function');
    }
    const manager = getLifecycleManager();
    const onActivated = (callback) => {
        manager.registerActivated(instance.type, callback);
        // 组件卸载时清理钩子
        onUnmounted(() => {
            manager.cleanupComponent(instance.type);
        });
    };
    const onDeactivated = (callback) => {
        manager.registerDeactivated(instance.type, callback);
        // 组件卸载时清理钩子
        onUnmounted(() => {
            manager.cleanupComponent(instance.type);
        });
    };
    return {
        onActivated,
        onDeactivated
    };
}
// 单例生命周期管理器
let lifecycleManager = null;
export function getLifecycleManager() {
    if (!lifecycleManager) {
        lifecycleManager = new LifecycleManager();
    }
    return lifecycleManager;
}
export function resetLifecycleManager() {
    lifecycleManager = null;
}
