import type { Component } from 'vue'
import { getCurrentInstance, onMounted, onUnmounted } from 'vue'

/**
 * 生命周期钩子管理器
 */
export class LifecycleManager {
  private activatedCallbacks: Map<Component, (() => void)[]> = new Map()
  private deactivatedCallbacks: Map<Component, (() => void)[]> = new Map()

  /**
   * 注册激活钩子
   */
  registerActivated(component: Component, callback: () => void): void {
    if (!this.activatedCallbacks.has(component)) {
      this.activatedCallbacks.set(component, [])
    }
    this.activatedCallbacks.get(component)!.push(callback)
  }

  /**
   * 注册失活钩子
   */
  registerDeactivated(component: Component, callback: () => void): void {
    if (!this.deactivatedCallbacks.has(component)) {
      this.deactivatedCallbacks.set(component, [])
    }
    this.deactivatedCallbacks.get(component)!.push(callback)
  }

  /**
   * 触发组件的激活钩子
   */
  triggerActivated(component: Component): void {
    const callbacks = this.activatedCallbacks.get(component)
    if (callbacks) {
      callbacks.forEach(callback => callback())
    }
  }

  /**
   * 触发组件的失活钩子
   */
  triggerDeactivated(component: Component): void {
    const callbacks = this.deactivatedCallbacks.get(component)
    if (callbacks) {
      callbacks.forEach(callback => callback())
    }
  }

  /**
   * 清理组件的所有钩子
   */
  cleanupComponent(component: Component): void {
    this.activatedCallbacks.delete(component)
    this.deactivatedCallbacks.delete(component)
  }

  /**
   * 清理所有钩子
   */
  cleanupAll(): void {
    this.activatedCallbacks.clear()
    this.deactivatedCallbacks.clear()
  }
}

/**
 * 创建组合式API的生命周期钩子
 */
export function useKeepAliveLifecycle() {
  const instance = getCurrentInstance()

  if (!instance) {
    throw new Error('useKeepAliveLifecycle must be called within a component setup function')
  }

  const manager = getLifecycleManager()

  const onActivated = (callback: () => void) => {
    manager.registerActivated(instance.type, callback)

    // 组件卸载时清理钩子
    onUnmounted(() => {
      manager.cleanupComponent(instance.type)
    })
  }

  const onDeactivated = (callback: () => void) => {
    manager.registerDeactivated(instance.type, callback)

    // 组件卸载时清理钩子
    onUnmounted(() => {
      manager.cleanupComponent(instance.type)
    })
  }

  return {
    onActivated,
    onDeactivated
  }
}

// 单例生命周期管理器
let lifecycleManager: LifecycleManager | null = null

export function getLifecycleManager(): LifecycleManager {
  if (!lifecycleManager) {
    lifecycleManager = new LifecycleManager()
  }
  return lifecycleManager
}

export function resetLifecycleManager(): void {
  lifecycleManager = null
}