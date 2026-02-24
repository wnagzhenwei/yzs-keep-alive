import { computed, getCurrentInstance, ref, watch } from 'vue'
import type { Component, Ref } from 'vue'
import { useKeepAliveLifecycle } from '../core/lifecycle-manager'
import { getComponentName, matches } from '../core/utils'

/**
 * 自定义KeepAlive的组合式API
 */
export function useKeepAlive() {
  const { onActivated, onDeactivated } = useKeepAliveLifecycle()

  return {
    onActivated,
    onDeactivated
  }
}

/**
 * 用于组件内部的KeepAlive状态管理
 */
export function useKeepAliveState() {
  const isActive = ref(false)
  const instance = getCurrentInstance()

  if (!instance) {
    throw new Error('useKeepAliveState must be called within a component setup function')
  }

  const { onActivated, onDeactivated } = useKeepAlive()

  onActivated(() => {
    isActive.value = true
  })

  onDeactivated(() => {
    isActive.value = false
  })

  return {
    isActive,
    isActivated: isActive
  }
}

/**
 * 检查组件是否应该被缓存
 */
export function useShouldCache(options: {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
  component: Component
}) {
  const { include, exclude, component } = options

  return computed(() => {
    const name = getComponentName(component)

    if (!name) {
      return false
    }

    // 如果指定了exclude，且匹配则排除
    if (exclude && matches(exclude, name)) {
      return false
    }

    // 如果指定了include，且不匹配则不缓存
    if (include && !matches(include, name)) {
      return false
    }

    // 默认情况下缓存所有组件
    return true
  })
}