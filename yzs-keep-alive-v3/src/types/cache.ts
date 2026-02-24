import type { Component, VNode, ComponentInternalInstance } from 'vue'

export interface ComponentState {
  reactive: Record<string, any>      // ref, reactive 值
  props: Record<string, any>         // 当前 props
  attrs: Record<string, any>         // 非 props 属性
  slots: any[]                       // 插槽内容
  context: any                       // 上下文
  setupState: Record<string, any>    // setup() 返回值
  data: Record<string, any>          // data() 返回值（选项式 API）
  computed: Record<string, any>      // computed 值
}

export interface CacheItem {
  vnode: VNode
  component: Component | null
  instance: ComponentInternalInstance | null  // 组件实例（如果可用）
  props: Record<string, any>
  data: ComponentState | null                 // 组件内部状态
  key: string
  timestamp: number
  container: HTMLElement | null               // DOM 容器
}

export interface CacheOptions {
  max?: number
}

export interface CacheManager {
  has(key: string): boolean
  get(key: string): CacheItem | undefined
  set(key: string, item: CacheItem): void
  delete(key: string): boolean
  clear(): void
  keys(): string[]
  size(): number
  setMaxSize?(max: number): void
}

export interface LRUCacheOptions extends CacheOptions {
  max?: number
}

export interface InstanceManager {
  // 创建并缓存组件实例
  createAndCacheInstance(vnode: VNode, container: HTMLElement): ComponentInternalInstance
  // 从缓存恢复实例
  restoreInstance(cacheKey: string, container: HTMLElement): ComponentInternalInstance | null
  // 保存实例状态
  saveInstanceState(instance: ComponentInternalInstance): ComponentState
  // 恢复实例状态
  restoreInstanceState(instance: ComponentInternalInstance, state: ComponentState): void
  // 包装组件以支持状态收集
  wrapComponent(component: Component): Component
  // 隐藏组件（保持DOM）
  hideComponent(instance: ComponentInternalInstance): void
  // 显示组件
  showComponent(instance: ComponentInternalInstance): void
}

export interface DOMManager {
  // 创建容器
  createContainer(parent: HTMLElement): HTMLElement
  // 隐藏容器
  hideContainer(container: HTMLElement): void
  // 显示容器
  showContainer(container: HTMLElement): void
  // 移除容器
  removeContainer(container: HTMLElement): void
}