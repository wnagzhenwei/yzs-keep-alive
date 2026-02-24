<script setup lang="ts">
import {
  getCurrentInstance,
  cloneVNode,
  isVNode,
  watch,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  defineComponent,
  type VNode,
  type Component,
  type ComponentInternalInstance,
  useSlots
} from 'vue'
import { isString, isArray, remove } from '@vue/shared'
import { useRouter } from 'vue-router'
import type { YzsKeepAliveProps } from '../types'
import { StackCore } from '../core/stack-core'

// Shape flags (from Vue internals)
const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = (1 << 1) | (1 << 2)
}

// Move type enum
const enum MoveType {
  ENTER = 0,
  LEAVE = 1,
  REORDER = 2
}

// Get component name utility
function getComponentName(Component: any): string {
  if (isString(Component)) {
    return Component
  }
  return Component.name || Component.__name || Component.displayName || ''
}

// Check if component matches pattern
function matches(pattern: string | RegExp | (string | RegExp)[], name: string): boolean {
  if (isArray(pattern)) {
    return pattern.some(p => matches(p, name))
  } else if (isString(pattern)) {
    return pattern === name
  } else if (pattern instanceof RegExp) {
    return pattern.test(name)
  }
  return false
}

// Get inner child for suspense
function getInnerChild(vnode: VNode): VNode {
  return vnode.shapeFlag & ShapeFlags.SUSPENSE ? (vnode as any).ssContent : vnode
}

// Reset shape flags
function resetShapeFlag(vnode: VNode) {
  if (!vnode) return
  let shapeFlag = vnode.shapeFlag
  if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
  }
  if (shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_KEPT_ALIVE
  }
  vnode.shapeFlag = shapeFlag
}

const props = defineProps<YzsKeepAliveProps>()

// Get current instance
const instance = getCurrentInstance()!
const sharedContext = instance.ctx as any

// If no renderer, it's SSR - just render default slot
if (!sharedContext.renderer) {
  defineExpose({})
  // SSR: just render children
  const slots = useSlots()
  defineExpose({})
  // For SSR, we need to return a render function
  // This is simplified for now
}

// Cache for vnodes
const cache = new Map<string, VNode>()
const keys = new Set<string>()
let current: VNode | null = null

const parentSuspense = instance.suspense

// Get renderer internals (Vue internal API)
const {
  renderer: {
    p: patch,
    m: move,
    um: _unmount,
    o: { createElement }
  }
} = sharedContext

// Create storage container for deactivated components
const storageContainer = createElement('div')

// Setup activate/deactivate functions for renderer
sharedContext.activate = (vnode: VNode, container: HTMLElement, anchor: any, isSVG: boolean, optimized: boolean) => {
  const componentInstance = vnode.component!
  move(vnode, container, anchor, MoveType.ENTER, parentSuspense)

  // Queue post-render effect for activated hooks
  queuePostRenderEffect(() => {
    componentInstance.isDeactivated = false
    if (componentInstance.a) { // activated hooks
      ;(componentInstance.a as Function[]).forEach(fn => fn())
    }
    // Call vnode mounted hook
    const vnodeHook = vnode.props && (vnode.props as any).onVnodeMounted
    if (vnodeHook) {
      vnodeHook(vnode)
    }
  }, parentSuspense)
}

sharedContext.deactivate = (vnode: VNode) => {
  const componentInstance = vnode.component!
  move(vnode, storageContainer, null, MoveType.LEAVE, parentSuspense)

  queuePostRenderEffect(() => {
    if (componentInstance.da) { // deactivated hooks
      ;(componentInstance.da as Function[]).forEach(fn => fn())
    }
    // Call vnode unmounted hook
    const vnodeHook = vnode.props && (vnode.props as any).onVnodeUnmounted
    if (vnodeHook) {
      vnodeHook(vnode)
    }
    componentInstance.isDeactivated = true
  }, parentSuspense)
}

// Queue post render effect (simplified)
function queuePostRenderEffect(fn: Function, suspense: any) {
  if (suspense && suspense.pendingBranch) {
    suspense.effects.push(fn)
  } else {
    // Use nextTick as simple alternative
    Promise.resolve().then(() => fn())
  }
}

// Unmount helper
function unmount(vnode: VNode) {
  resetShapeFlag(vnode)
  _unmount(vnode, instance, parentSuspense, true)
}

// Prune cache entry
function pruneCacheEntry(key: string) {
  const cached = cache.get(key)
  if (current && current.key === key) {
    // Current active instance should no longer be kept-alive
    resetShapeFlag(current)
  } else if (cached) {
    unmount(cached)
  }
  cache.delete(key)
  keys.delete(key)
}

// Prune cache based on filter
function pruneCache(filter?: (name: string) => boolean) {
  cache.forEach((vnode, key) => {
    const name = getComponentName(vnode.type as Component)
    if (name && (!filter || !filter(name))) {
      pruneCacheEntry(key)
    }
  })
}

// Get router instance
const router = useRouter()
if (!router) {
  throw new Error('vue-router is required for StackKeepAlive')
}

// Initialize stack core
const stackCore = StackCore.getInstance({
  router,
  pruneCacheEntry,
  replaceStay: props.replaceStay,
  singleton: props.singleton
})

// Watch include/exclude changes
watch(
  () => [props.include, props.exclude],
  ([include, exclude]) => {
    include && pruneCache(name => matches(include, name))
    exclude && pruneCache(name => !matches(exclude, name))
  },
  { flush: 'post', deep: true }
)

// Cache subtree after render
let pendingCacheKey: string | null = null
const cacheSubtree = () => {
  if (pendingCacheKey != null) {
    cache.set(pendingCacheKey, getInnerChild(instance.subTree))
  }
}

onMounted(cacheSubtree)
onUpdated(cacheSubtree)

// Cleanup on unmount
onBeforeUnmount(() => {
  cache.forEach(cached => {
    const { subTree, suspense } = instance
    const vnode = getInnerChild(subTree)
    if (cached.type === vnode.type) {
      // Current instance will be unmounted as part of keep-alive's unmount
      resetShapeFlag(vnode)
      // But invoke its deactivated hook here
      const da = vnode.component!.da as Function[]
      da && queuePostRenderEffect(() => {
        da.forEach(fn => fn())
      }, suspense)
      return
    }
    unmount(cached)
  })
})

// Render function
const render = () => {
  pendingCacheKey = null

  const slots = useSlots()
  if (!slots.default) {
    return null
  }

  // Generate key based on stack state
  const _key = stackCore.genKeyForVnode()
  const children = slots.default({ 'key': _key })
  const rawVNode = children[0]

  if (instance.vnode) {
    instance.vnode.__oldChild = children[0]
  }

  if (!isVNode(rawVNode)) {
    stackCore.genInitialKeyNextTime()
    current = null
    return rawVNode
  }

  // Handle multiple children
  if (children.length > 1) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('YzsKeepAlive should contain exactly one component child.')
    }
    current = null
    stackCore.genInitialKeyNextTime()
    return children
  }

  if (!(rawVNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) &&
      !(rawVNode.shapeFlag & ShapeFlags.SUSPENSE)) {
    stackCore.genInitialKeyNextTime()
    current = null
    return rawVNode
  }

  let vnode = getInnerChild(rawVNode)
  const comp = vnode.type as Component

  // Get component name for include/exclude checking
  const name = getComponentName(comp)

  const { include, exclude, max } = props

  // Check include/exclude
  if (
    (include && (!name || !matches(include, name))) ||
    (exclude && name && matches(exclude, name))
  ) {
    current = vnode
    return rawVNode
  }

  const key = vnode.key == null ? comp : vnode.key
  const cachedVNode = cache.get(key as string)

  // Clone vnode if it's reused because we are going to mutate it
  if (vnode.el) {
    vnode = cloneVNode(vnode)
    if (rawVNode.shapeFlag & ShapeFlags.SUSPENSE) {
      ;(rawVNode as any).ssContent = vnode
    }
  }

  pendingCacheKey = key as string

  if (cachedVNode) {
    // Copy over mounted state
    vnode.el = cachedVNode.el
    vnode.component = cachedVNode.component

    // Avoid vnode being mounted as fresh
    vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE

    // Make this key the freshest (LRU)
    keys.delete(key as string)
    keys.add(key as string)
  } else {
    keys.add(key as string)
    // Prune oldest entry if max limit reached
    if (max && keys.size > parseInt(max as string, 10)) {
      pruneCacheEntry(keys.values().next().value)
    }
  }

  // Avoid vnode being unmounted
  vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE

  current = vnode
  return rawVNode
}

// Define exposed methods
defineExpose({
  pruneCache,
  pruneCacheEntry
})

// Return render function
render
</script>

<template>
  <!-- Component is rendered via render function -->
</template>