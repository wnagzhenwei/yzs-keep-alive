# yzs-keep-alive-v3

A custom KeepAlive component for Vue 3 that doesn't depend on Vue's built-in KeepAlive component.

## Features

- ✅ Component instance caching and state preservation
- ✅ onActivated/onDeactivated lifecycle hooks
- ✅ Include/Exclude pattern matching
- ✅ Max cache limit with LRU eviction policy
- ✅ No dependency on Vue's built-in KeepAlive
- ✅ Full TypeScript support

## Installation

```bash
npm install yzs-keep-alive-v3
```

## Usage

### Basic Usage

```vue
<template>
  <YzsKeepAlive>
    <component :is="currentComponent" />
  </YzsKeepAlive>
</template>

<script setup>
import { ref } from 'vue'
import { YzsKeepAlive } from 'yzs-keep-alive-v3'
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

const currentComponent = ref(ComponentA)
</script>
```

### With Include/Exclude

```vue
<template>
  <YzsKeepAlive :include="['ComponentA', /^ComponentB/]" :exclude="['ComponentC']" :max="5">
    <component :is="currentComponent" />
  </YzsKeepAlive>
</template>
```

### Using Composition API

```vue
<script setup>
import { useKeepAlive, useKeepAliveState } from 'yzs-keep-alive-v3'

const { onActivated, onDeactivated } = useKeepAlive()
const { isActive } = useKeepAliveState()

onActivated(() => {
  console.log('Component activated')
})

onDeactivated(() => {
  console.log('Component deactivated')
})
</script>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| include | string \| RegExp \| Array | undefined | Only cache components matching these patterns |
| exclude | string \| RegExp \| Array | undefined | Don't cache components matching these patterns |
| max | number | 10 | Maximum number of component instances to cache |

### Events

| Event | Description |
|-------|-------------|
| activated | Emitted when a component is activated |
| deactivated | Emitted when a component is deactivated |

### Methods

| Method | Description |
|--------|-------------|
| clearCache() | Clear all cached components |
| pruneCache(filter) | Remove cached components matching the filter function |
| getCachedKeys() | Get all cache keys |
| getCacheSize() | Get current cache size |

### Composables

- `useKeepAlive()`: Provides `onActivated` and `onDeactivated` hooks
- `useKeepAliveState()`: Provides `isActive` reactive state
- `useShouldCache()`: Utility to check if a component should be cached

## How It Works

This library implements a custom caching mechanism that:

1. **Caches Component Instances**: Uses an LRU cache to store component instances
2. **Preserves State**: Saves and restores component state between activations
3. **Lifecycle Hooks**: Provides custom `onActivated` and `onDeactivated` hooks
4. **Pattern Matching**: Supports include/exclude patterns for fine-grained control
5. **Memory Management**: Automatically evicts least recently used components when cache limit is reached

## Browser Support

- Vue 3.0+
- Modern browsers (Chrome, Firefox, Safari, Edge)

## License

MIT