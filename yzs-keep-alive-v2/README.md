# yzs-keep-alive-v2

> A custom KeepAlive component for Vue 2 that replicates Vue's built-in KeepAlive functionality without depending on it.

## Features

- **Component Instance Caching**: Cache and preserve component state
- **Lifecycle Hooks**: Supports `activated` and `deactivated` hooks
- **Pattern Matching**: `include` and `exclude` props with string, RegExp, or array patterns
- **Max Cache Limit**: LRU (Least Recently Used) eviction policy
- **No Dependency**: Doesn't rely on Vue's built-in KeepAlive
- **Vue 2 Native**: Uses Options API and `abstract: true` pattern

## Installation

```bash
npm install yzs-keep-alive-v2
```

## Basic Usage

```vue
<template>
  <div>
    <button @click="currentView = 'home'">Home</button>
    <button @click="currentView = 'about'">About</button>

    <YzsKeepAlive>
      <component :is="currentView" />
    </YzsKeepAlive>
  </div>
</template>

<script>
import YzsKeepAlive from 'yzs-keep-alive-v2'

export default {
  components: {
    YzsKeepAlive
  },
  data() {
    return {
      currentView: 'home'
    }
  },
  components: {
    home: {
      name: 'home',
      template: '<div>Home View - Count: {{ count }}</div>',
      data() {
        return { count: 0 }
      },
      activated() {
        console.log('Home activated')
      },
      deactivated() {
        console.log('Home deactivated')
      }
    },
    about: {
      name: 'about',
      template: '<div>About View</div>'
    }
  }
}
</script>
```

## Props

### include

- **Type**: `string | RegExp | Array`
- **Description**: Only cache components matching these patterns

```vue
<!-- Cache only ComponentA and ComponentB -->
<YzsKeepAlive :include="['ComponentA', 'ComponentB']">
  <component :is="currentView" />
</YzsKeepAlive>

<!-- Cache components matching regex -->
<YzsKeepAlive :include="/^Component/">
  <component :is="currentView" />
</YzsKeepAlive>
```

### exclude

- **Type**: `string | RegExp | Array`
- **Description**: Don't cache components matching these patterns

```vue
<!-- Don't cache NoCacheComponent -->
<YzsKeepAlive :exclude="['NoCacheComponent']">
  <component :is="currentView" />
</YzsKeepAlive>
```

### max

- **Type**: `string | number`
- **Description**: Maximum number of component instances to cache
- **Default**: `10`

```vue
<!-- Cache at most 5 components -->
<YzsKeepAlive :max="5">
  <component :is="currentView" />
</YzsKeepAlive>
```

## Lifecycle Hooks

Cached components can use `activated` and `deactivated` hooks:

```javascript
export default {
  name: 'MyComponent',
  data() {
    return {
      scrollPosition: 0
    }
  },
  activated() {
    // Called when component becomes active
    console.log('Component activated')
    this.restoreScroll()
  },
  deactivated() {
    // Called when component becomes inactive
    console.log('Component deactivated')
    this.saveScroll()
  }
}
```

## Public Methods

Access the component instance via `ref` to call public methods:

```vue
<template>
  <div>
    <YzsKeepAlive ref="keepAlive" :max="10">
      <component :is="currentView" />
    </YzsKeepAlive>

    <button @click="clearAllCache">Clear Cache</button>
  </div>
</template>

<script>
export default {
  methods: {
    clearAllCache() {
      this.$refs.keepAlive.clearCache()
    }
  }
}
</script>
```

### clearCache()

Clear all cached components.

```javascript
this.$refs.keepAlive.clearCache()
```

### clearCacheByKey(key)

Clear a specific cache entry by key.

```javascript
this.$refs.keepAlive.clearCacheByKey('component-key')
```

### getCachedKeys()

Get all cached keys.

```javascript
const keys = this.$refs.keepAlive.getCachedKeys()
console.log('Cached keys:', keys)
```

### getCacheSize()

Get current cache size.

```javascript
const size = this.$refs.keepAlive.getCacheSize()
console.log('Cache size:', size)
```

## Component Naming

For `include` and `exclude` to work properly, ensure your components have a `name` property:

```javascript
export default {
  name: 'MyComponent',  // Required for include/exclude
  // ...
}
```

## How It Works

1. **Abstract Component**: Uses Vue 2's `abstract: true` to avoid creating a wrapper DOM element
2. **VNode Interception**: Intercepts render function to cache component instances
3. **Instance Reuse**: Reuses both the component instance and DOM element
4. **LRU Eviction**: When `max` limit is reached, removes the least recently used cache entry
5. **Keep-Alive Flag**: Sets `vnode.data.keepAlive = true` for Vue 2 renderer

## Differences from Vue 3 Version

| Feature | Vue 2 (v2) | Vue 3 (v3) |
|---------|------------|------------|
| Component API | Options API | Composition API |
| Pattern | `abstract: true` | `sharedContext.renderer` |
| VNode Type | `componentOptions` | Shape flags |
| Cache Storage | Object/Array | Map/Set |
| Component Name | `componentOptions.Ctor.options.name` | `Component.__name` |
| DOM Element | `vnode.elm` | `vnode.el` |
| Component Instance | `vnode.componentInstance` | `vnode.component` |

## License

MIT

## Author

hnwangzhenwei
