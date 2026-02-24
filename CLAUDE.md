# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains `yzs-keep-alive-v3`, a custom Vue 3 KeepAlive component library that replicates Vue's built-in KeepAlive functionality without depending on it.

## Project Structure

The repository is organized into two main parts:
- **`yzs-keep-alive-v3/`** - Main library project (Vue 3 component library)
- **`test-app/`** - Vue 3 test application for manual testing

### Key Directories (yzs-keep-alive-v3/)
- `src/components/` - Vue component implementations (contains multiple variant versions with `.old`, `.old2`, `.stack` suffixes - focus on `YzsKeepAlive.vue` and `YzsKeepAliveEnhanced.vue`)
- `src/core/` - Core caching, lifecycle, and utility modules
- `src/composables/` - Composition API hooks
- `src/types/` - TypeScript type definitions and Vue internal API extensions
- `test/` - Unit tests (run against built UMD module)
- `dist/` - Built output (ES and UMD formats with TypeScript declarations)

## Library: yzs-keep-alive-v3

A custom KeepAlive implementation for Vue 3 with the following features:
- Component instance caching and state preservation
- onActivated/onDeactivated lifecycle hooks
- Include/Exclude pattern matching
- Max cache limit with LRU eviction policy
- No dependency on Vue's built-in KeepAlive
- Full TypeScript support

### Key Architecture

The library has two main implementations:

1. **YzsKeepAlive.vue** (Main export) - Uses Vue internal renderer API
   - Direct integration with Vue's renderer via `sharedContext.renderer`
   - Uses Vue's internal `move`, `patch`, `_unmount` functions
   - Implements `activate`/`deactivate` callbacks for renderer
   - **Dependency**: Relies on Vue internal APIs

2. **YzsKeepAliveEnhanced.vue** - Alternative implementation with custom caching system
   - Custom LRU cache manager
   - Manual DOM management with hidden containers
   - Instance state serialization/deserialization
   - **Dependency**: Self-contained implementation

### Core Modules

- `src/core/cache-manager.ts` - LRU (Least Recently Used) cache implementation with eviction policy (used by Enhanced version)
- `src/core/lifecycle-manager.ts` - Manages `onActivated`/`onDeactivated` lifecycle hooks (used by Enhanced version)
- `src/core/shape-flags.ts` - Constants for Vue internal shape flags
- `src/composables/useKeepAlive.ts` - Composition API hooks (`useKeepAlive`, `useKeepAliveState`, `useShouldCache`)
- `src/types/` - TypeScript type definitions
- `src/types/vue-internal.d.ts` - Vue internal API type extensions

### API Surface

#### Props
- `include`: Only cache components matching these patterns (string, RegExp, or array)
- `exclude`: Don't cache components matching these patterns (string, RegExp, or array)
- `max`: Maximum number of component instances to cache (default: 10)

#### Methods
- `clearCache()`: Clear all cached components
- `pruneCache(filter)`: Remove cached components matching filter function
- `getCachedKeys()`: Get all cache keys
- `getCacheSize()`: Get current cache size

#### Events
- `activated`: Emitted when a component is activated
- `deactivated`: Emitted when a component is deactivated

#### Composables
- `useKeepAlive()`: Provides `onActivated` and `onDeactivated` hooks
- `useKeepAliveState()`: Provides `isActive` reactive state
- `useShouldCache()`: Utility to check if a component should be cached

### Development Commands (in yzs-keep-alive-v3 directory)

```bash
npm run build          # Build the library (ES + UMD formats)
npm run type-check     # TypeScript type checking
npm run dev            # Development server (for testing)
npm run preview        # Preview built output
npm run build:types    # Build TypeScript declarations (runs vue-tsc)
```

### Dependencies

#### Peer Dependencies
- `vue`: `^3.0.0`

#### Dev Dependencies
- `@vitejs/plugin-vue`: Vue plugin for Vite
- `@vue/compiler-sfc`: Vue SFC compiler
- `@vue/shared`: Vue shared utilities
- `typescript`: TypeScript compiler
- `vite`: Build tool
- `vite-plugin-dts`: TypeScript declaration generation
- `vue`: `^3.4.0`
- `vue-tsc`: TypeScript checking for Vue

### Testing

Unit tests are located in `test/` directory and use the built UMD module:
```bash
cd yzs-keep-alive-v3
node test/cache-manager.test.js
node test/lifecycle-manager.test.js
node test/utils.test.js
node test/state-cache.test.js
```

**Important**: Tests must be run from the `yzs-keep-alive-v3/` directory and require the library to be built first (`npm run build`).

## Test Application

A Vue 3 application for testing the yzs-keep-alive-v3 library functionality.

### Development Commands (in test-app directory)
```bash
cd test-app
npm run dev    # Start development server (typically on port 5173)
npm run build  # Build for production
npm run preview # Preview built app
```

### Local Linking

The test app uses the local library via `file:../yzskeepalive` dependency in package.json. When developing:
1. Make changes in `yzs-keep-alive-v3/`
2. Run `npm run build` in `yzs-keep-alive-v3/`
3. Restart the test app dev server to see changes

## Build Configuration

- **Build Tool**: Vite configured for library mode
- **Output Formats**: ES module (`dist/yzs-keep-alive-v3.es.js`) and UMD (`dist/yzs-keep-alive-v3.umd.js`)
- **External Dependencies**: `vue` and `@vue/shared` are externalized
- **TypeScript**: Strict mode enabled with declaration generation via `vite-plugin-dts`
- **Entry Point**: `src/index.ts`
- **Vue Shim**: `.vue` file type declarations in `src/vue-shim.d.ts`

## Development Workflow

1. **Library Development**: Work in `yzs-keep-alive-v3/` directory
2. **Building**: Run `npm run build` to build the library after making changes
3. **Unit Testing**: Run tests from `yzs-keep-alive-v3/` directory
4. **Manual Testing**: Use the test app in `test-app/` directory
5. **Local Linking**: Test app uses `file:../yzskeepalive` - rebuild library after changes

## Important Notes

1. **Vue Internal API Usage**: The main YzsKeepAlive.vue uses Vue's internal renderer API (`sharedContext.renderer`, `move`, `patch`, etc.). This is a dependency on Vue's internal implementation and may break across Vue versions.

2. **Two Implementations**: The repository contains both the Vue internal API version (main export) and the Enhanced version with custom caching.

3. **Type Declarations**: Custom type declarations are needed for Vue internal APIs in `src/types/vue-internal.d.ts`.

4. **Testing Approach**: Unit tests run against the built UMD module (`dist/yzs-keep-alive-v3.umd.js`), not the source code directly. Always build before testing.

5. **Component Variants**: The `src/components/` directory contains many `.old`, `.old2`, `.stack` files which are historical implementations. Focus on `YzsKeepAlive.vue` (main) and `YzsKeepAliveEnhanced.vue` (alternative).

6. **Package Manager**: Uses pnpm (evidenced by `pnpm-lock.yaml`).

## Exports

The library exports the following from `src/index.ts`:
- `YzsKeepAlive` - Main component (default)
- `YzsKeepAliveEnhanced` - Alternative implementation
- `useKeepAlive`, `useKeepAliveState`, `useShouldCache` - Composables
- `useKeepAliveLifecycle`, `getLifecycleManager`, `resetLifecycleManager` - Lifecycle utilities
- `createCacheManager` - Cache manager factory
- `ShapeFlags` - Vue shape flag constants
