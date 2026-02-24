# Changelog

## [0.1.0] - 2025-02-12

### Added
- Initial release of yzs-keep-alive-v2
- Vue 2 custom KeepAlive component using `abstract: true` pattern
- Component instance caching with LRU eviction policy
- `include` and `exclude` pattern matching (string, RegExp, array)
- `max` prop to limit cache size
- `activated` and `deactivated` lifecycle hooks support
- Public methods: `clearCache()`, `clearCacheByKey()`, `getCachedKeys()`, `getCacheSize()`, `pruneCacheWithFilter()`
- Utility functions: `getComponentName()`, `generateKey()`, `matches()`, `shouldNotCache()`
- LRU Cache Manager class
- TypeScript type definitions
- Unit tests for utilities and cache manager
- Development demo page

### Differences from Vue 3 Version (yzs-keep-alive-v3)
- Uses Options API instead of Composition API
- Uses `abstract: true` instead of Vue 3 renderer internals
- VNode structure uses `componentOptions` instead of shape flags
- Cache storage uses Object/Array instead of Map/Set
- Component instance accessed via `vnode.componentInstance` instead of `vnode.component`
- DOM element accessed via `vnode.elm` instead of `vnode.el`
- Component name from `componentOptions.Ctor.options.name` instead of `Component.__name`
