/**
 * yzs-keep-alive-v2
 * A custom KeepAlive component for Vue 2 (Pure JS implementation)
 */

import { getComponentName, generateKey, shouldNotCache } from '../core/utils'

/**
 * YzsKeepAlive - Vue 2 Custom KeepAlive Component
 * Uses abstract component pattern like Vue 2's built-in keep-alive
 */
export default {
  name: 'YzsKeepAlive',

  // Mark as abstract component (key difference from Vue 3)
  // Note: abstract: true prevents ref from working, so we've disabled it
  // abstract: true,

  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number]
  },

  created() {
    // Initialize cache storage
    this.cache = Object.create(null)
    this.keys = []

    // Watch include/exclude changes
    this.$watch(
      () => [this.include, this.exclude],
      () => {
        this.pruneCache()
      },
      { deep: true }
    )
  },

  destroyed() {
    // Clean up all cached components on destroy
    for (const key in this.cache) {
      this.pruneCacheEntry(key)
    }
  },

  render(h) {
    const slot = this.$slots.default
    if (!slot || slot.length === 0) {
      return
    }

    // Get first child vnode
    const vnode = slot[0]

    // Check if it's a component vnode
    if (!vnode || !vnode.componentOptions) {
      return vnode
    }

    const componentOptions = vnode.componentOptions
    const name = getComponentName(componentOptions)

    // Check include/exclude rules
    if (shouldNotCache(this.include, this.exclude, name)) {
      // Don't cache this component
      if (vnode.data) {
        delete vnode.data.keepAlive
      }
      return vnode
    }

    // Generate cache key
    const key = generateKey(vnode, componentOptions)
    const cachedVNode = this.cache[key]

    if (cachedVNode) {
      // Reuse cached component instance and DOM
      vnode.componentInstance = cachedVNode.componentInstance
      vnode.elm = cachedVNode.elm
      vnode.data = cachedVNode.data

      // Update LRU - move key to end
      this.updateLRU(key)
    } else {
      // New component - add to cache
      this.cache[key] = vnode
      this.keys.push(key)

      // Check max limit and evict oldest if needed
      if (this.max && this.keys.length > parseInt(this.max)) {
        this.pruneCacheEntry(this.keys[0])
        this.keys.shift()
      }
    }

    // Mark as keep-alive for Vue 2 renderer
    vnode.data = vnode.data || {}
    vnode.data.keepAlive = true

    return vnode
  },

  methods: {
    /**
     * Update LRU order - move key to end
     */
    updateLRU(key) {
      const index = this.keys.indexOf(key)
      if (index > -1) {
        this.keys.splice(index, 1)
        this.keys.push(key)
      }
    },

    /**
     * Prune a single cache entry
     */
    pruneCacheEntry(key) {
      const cached = this.cache[key]
      if (cached) {
        // Trigger deactivated hook if component instance exists
        if (cached.componentInstance) {
          cached.componentInstance.$emit('hook:deactivated')
        }

        // Don't remove DOM element here - let Vue handle it naturally
        // The DOM will be properly handled by Vue's rendering cycle
      }
      delete this.cache[key]
    },

    /**
     * Prune cache based on include/exclude rules
     */
    pruneCache() {
      for (const key in this.cache) {
        const vnode = this.cache[key]
        const name = getComponentName(vnode.componentOptions)

        // Prune if doesn't match include or matches exclude
        if (this.include && !this.matches(this.include, name)) {
          this.pruneCacheEntry(key)
          const keyIndex = this.keys.indexOf(key)
          if (keyIndex > -1) {
            this.keys.splice(keyIndex, 1)
          }
        } else if (this.exclude && this.matches(this.exclude, name)) {
          this.pruneCacheEntry(key)
          const keyIndex = this.keys.indexOf(key)
          if (keyIndex > -1) {
            this.keys.splice(keyIndex, 1)
          }
        }
      }
    },

    /**
     * Check if name matches pattern
     */
    matches(pattern, name) {
      if (!name) return false

      if (Array.isArray(pattern)) {
        return pattern.some(p => this.matches(p, name))
      }

      if (typeof pattern === 'string') {
        return pattern === name
      }

      if (pattern instanceof RegExp) {
        return pattern.test(name)
      }

      return false
    },

    /**
     * Clear all cached components (public method)
     */
    clearCache() {
      for (const key in this.cache) {
        this.pruneCacheEntry(key)
      }
      this.keys = []
    },

    /**
     * Clear specific cache entry by key (public method)
     */
    clearCacheByKey(key) {
      this.pruneCacheEntry(key)
      const index = this.keys.indexOf(key)
      if (index > -1) {
        this.keys.splice(index, 1)
      }
    },

    /**
     * Prune cache with filter function (public method)
     */
    pruneCacheWithFilter(filter) {
      for (const key in this.cache) {
        const vnode = this.cache[key]
        const name = getComponentName(vnode.componentOptions)
        if (filter ? filter(name, key) : true) {
          this.pruneCacheEntry(key)
          const keyIndex = this.keys.indexOf(key)
          if (keyIndex > -1) {
            this.keys.splice(keyIndex, 1)
          }
        }
      }
    },

    /**
     * Get all cached keys (public method)
     */
    getCachedKeys() {
      return [...this.keys]
    },

    /**
     * Get current cache size (public method)
     */
    getCacheSize() {
      return this.keys.length
    }
  }
}
