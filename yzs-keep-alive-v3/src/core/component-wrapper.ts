import type { Component, VNode } from 'vue'
import { h, ref, shallowRef, watch, nextTick } from 'vue'
import type { YzsKeepAliveProps } from '../types'
import { createCacheManager } from './cache-manager'
import { getLifecycleManager } from './lifecycle-manager'
import { generateKey, getComponentName, matches, deepClone } from './utils'

/**
 * 组件包装器，负责管理组件的缓存和切换
 */
export class ComponentWrapper {
  private cacheManager = createCacheManager()
  private currentComponent = shallowRef<Component | null>(null)
  private currentProps = shallowRef<Record<string, any>>({})
  private currentKey = ref<string>('')
  private options: YzsKeepAliveProps

  constructor(options: YzsKeepAliveProps = {}) {
    this.options = options
    this.cacheManager = createCacheManager({ max: options.max || 10 })
  }

  /**
   * 更新配置
   */
  updateOptions(options: YzsKeepAliveProps) {
    this.options = options
    if (this.cacheManager && typeof (this.cacheManager as any).setMaxSize === 'function') {
      ;(this.cacheManager as any).setMaxSize(options.max || 10)
    }
  }

  /**
   * 检查组件是否应该被缓存
   */
  private shouldCacheComponent(component: Component): boolean {
    const name = getComponentName(component)

    if (!name) {
      return false
    }

    // 检查exclude
    if (this.options.exclude && matches(this.options.exclude, name)) {
      return false
    }

    // 检查include
    if (this.options.include && !matches(this.options.include, name)) {
      return false
    }

    return true
  }

  /**
   * 切换组件
   */
  switchComponent(component: Component, props: Record<string, any> = {}): void {
    const name = getComponentName(component)
    const key = generateKey(component, props)

    // 触发当前组件的失活钩子
    if (this.currentComponent.value) {
      const prevComponent = this.currentComponent.value
      const lifecycleManager = getLifecycleManager()
      lifecycleManager.triggerDeactivated(prevComponent)
    }

    // 检查是否应该缓存当前组件
    if (this.currentComponent.value && this.shouldCacheComponent(this.currentComponent.value)) {
      const prevKey = this.currentKey.value
      if (prevKey) {
        // 保存当前组件的状态到缓存
        this.cacheManager.set(prevKey, {
          vnode: {} as VNode,
          component: this.currentComponent.value,
          props: deepClone(this.currentProps.value),
          key: prevKey,
          timestamp: Date.now()
        })
      }
    }

    // 检查新组件是否在缓存中
    if (this.cacheManager.has(key) && this.shouldCacheComponent(component)) {
      // 从缓存恢复
      const cached = this.cacheManager.get(key)
      if (cached) {
        this.currentComponent.value = cached.component
        this.currentProps.value = deepClone(cached.props)
        // 触发激活钩子
        nextTick(() => {
          const lifecycleManager = getLifecycleManager()
          lifecycleManager.triggerActivated(cached.component!)
        })
      } else {
        // 缓存项不存在，使用新组件
        this.currentComponent.value = component
        this.currentProps.value = props
      }
    } else {
      // 新组件，直接设置
      this.currentComponent.value = component
      this.currentProps.value = props
    }

    this.currentKey.value = key

    // 触发新组件的激活钩子（如果不是从缓存恢复的）
    if (!this.cacheManager.has(key) || !this.shouldCacheComponent(component)) {
      nextTick(() => {
        const lifecycleManager = getLifecycleManager()
        lifecycleManager.triggerActivated(component)
      })
    }
  }

  /**
   * 渲染当前组件
   */
  render(): VNode | null {
    if (!this.currentComponent.value) {
      return null
    }

    return h(this.currentComponent.value, this.currentProps.value)
  }

  /**
   * 获取当前组件
   */
  getCurrentComponent(): Component | null {
    return this.currentComponent.value
  }

  /**
   * 获取当前props
   */
  getCurrentProps(): Record<string, any> {
    return this.currentProps.value
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cacheManager.clear()
  }

  /**
   * 删除特定条件的缓存
   */
  pruneCache(filter?: (name: string) => boolean): void {
    const keys = this.cacheManager.keys()
    for (const key of keys) {
      if (!filter || filter(key)) {
        this.cacheManager.delete(key)
      }
    }
  }

  /**
   * 获取缓存键列表
   */
  getCachedKeys(): string[] {
    return this.cacheManager.keys()
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(): number {
    return this.cacheManager.size()
  }
}

/**
 * 创建组件包装器实例
 */
export function createComponentWrapper(options: YzsKeepAliveProps = {}): ComponentWrapper {
  return new ComponentWrapper(options)
}