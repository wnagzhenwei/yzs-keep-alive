# CLAUDE.md

This file provides guidance for working with the `yzs-keep-alive-v3` library project.

## Project Overview

A custom Vue 3 KeepAlive component library that implements all the functionality of Vue's built-in KeepAlive component without depending on it.

## Key Architecture

### Two Implementations

1. **YzsKeepAlive.vue** (Current) - Uses Vue internal renderer API
   - Direct integration via `sharedContext.renderer`
   - Uses Vue's internal `move`, `patch`, `_unmount` functions
   - Implements `activate`/`deactivate` callbacks
   - Dependency: Relies on Vue internal APIs

2. **YzsKeepAliveEnhanced.vue** (Older) - Custom caching system
   - Custom LRU cache manager
   - Manual DOM management with hidden containers
   - Instance state serialization/deserialization
   - Self-contained implementation

### Core Modules

- `src/core/cache-manager.ts` - LRU cache with eviction policy (used by Enhanced version)
- `src/core/lifecycle-manager.ts` - Manages `onActivated`/`onDeactivated` hooks (used by Enhanced version)
- `src/core/shape-flags.ts` - Vue internal shape flags constants
- `src/composables/useKeepAlive.ts` - Composition API hooks (`useKeepAlive`, `useKeepAliveState`, `useShouldCache`)
- `src/types/` - TypeScript type definitions
- `src/types/vue-internal.d.ts` - Vue internal API type extensions

## Development Commands

```bash
npm run build          # Build library (ES + UMD formats)
npm run type-check     # TypeScript type checking
npm run dev            # Development server (default port 5173)
npm run preview        # Preview built output
npm run build:types    # Build TypeScript declarations
```

## Testing

Unit tests are located in `test/` directory and use the built UMD module:
```bash
node test/cache-manager.test.js
node test/lifecycle-manager.test.js
node test/utils.test.js
node test/state-cache.test.js
```

## Build Configuration

- **Build Tool**: Vite
- **Output Formats**: ES module (`yzs-keep-alive-v3.es.js`) and UMD (`yzs-keep-alive-v3.umd.js`)
- **External Dependencies**: `vue` and `@vue/shared` are externalized
- **TypeScript**: Strict mode with declaration generation
- **Entry Point**: `src/index.ts`

## Dependencies

### Peer Dependencies
- `vue`: `^3.0.0`

### Dev Dependencies
- `@vitejs/plugin-vue`: Vue plugin for Vite
- `@vue/compiler-sfc`: Vue SFC compiler
- `@vue/shared`: Vue shared utilities
- `typescript`: TypeScript compiler
- `vite`: Build tool
- `vite-plugin-dts`: TypeScript declaration generation
- `vue`: `^3.4.0`
- `vue-tsc`: TypeScript checking for Vue

## Important Notes

1. **Vue Internal API Usage**: The current implementation depends on Vue's internal renderer API (`sharedContext.renderer`, `move`, `patch`, etc.), which may break across Vue versions.

2. **Two Implementations**: The repository contains both implementations. The main export is the simplified Vue internal API version.

3. **Type Declarations**: Custom type declarations for Vue internal APIs are in `src/types/vue-internal.d.ts`.

4. **Testing Approach**: Unit tests run against the built UMD module (`dist/yzs-keep-alive-v3.umd.js`), not the source code directly.

5. **Test Application**: A separate test app is located in `../test-app/` and uses `file:../yzskeepalive` dependency for local testing.