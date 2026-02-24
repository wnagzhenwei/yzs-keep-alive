import type { Component, VNode } from 'vue'

export interface YzsKeepAliveProps {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
  max?: number
}

export interface KeepAliveLifecycle {
  onActivated?: (hook: () => void) => void
  onDeactivated?: (hook: () => void) => void
}

export interface ComponentInstance {
  vnode: VNode
  component: Component
  props: Record<string, any>
  el?: HTMLElement
  isActive: boolean
}