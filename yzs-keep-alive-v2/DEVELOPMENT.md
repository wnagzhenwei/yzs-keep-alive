# yzs-keep-alive-v2

A custom KeepAlive component for Vue 2 - replicates Vue's built-in KeepAlive functionality without depending on it.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build library
npm run build

# Run tests
npm test
```

## Project Structure

```
yzs-keep-alive-v2/
├── src/
│   ├── components/
│   │   └── YzsKeepAlive.vue       # Main component (abstract: true)
│   ├── core/
│   │   ├── cache-manager.js       # LRU cache manager
│   │   └── utils.js              # Utility functions
│   ├── index.js                  # Entry point
│   └── index.d.ts               # TypeScript definitions
├── test/
│   ├── cache-manager.test.js    # Cache manager tests
│   └── utils.test.js            # Utility tests
├── dist/                        # Build output
├── index.html                   # Dev demo page
├── vite.config.js              # Vite configuration
└── package.json
```

## Usage Example

```vue
<template>
  <div>
    <button @click="current = 'A'">Show A</button>
    <button @click="current = 'B'">Show B</button>

    <YzsKeepAlive :include="['ComponentA']" :max="5">
      <component :is="current" />
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
      current: 'A'
    }
  }
}
</script>
```

## API

### Props
- `include`: Only cache components matching patterns
- `exclude`: Don't cache components matching patterns
- `max`: Maximum cache size (default: 10)

### Methods (via ref)
- `clearCache()`: Clear all cached components
- `clearCacheByKey(key)`: Clear specific cache entry
- `getCachedKeys()`: Get all cached keys
- `getCacheSize()`: Get current cache size
- `pruneCacheWithFilter(filter)`: Prune with filter function

## License
MIT
