/**
 * yzs-keep-alive-v2
 * A custom KeepAlive component for Vue 2
 */

import YzsKeepAlive from './components/YzsKeepAlive.js'

// Export default component
export default YzsKeepAlive

// Named export
export { YzsKeepAlive }

// Export utilities for advanced usage
export { LRUCacheManager } from './core/cache-manager'
export * from './core/utils'
