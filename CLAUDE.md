# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains `yzs-keep-alive`, a custom Vue KeepAlive component library with two versions:
- **`yzs-keep-alive-v3/`** — Vue 3 TypeScript library (main development focus)
- **`yzs-keep-alive-v2/`** — Vue 2 JavaScript library (published to npm, stable)

Two test applications exist: `test-app/` (Vue 3) and `test-vue2-app/` (Vue 2).

This is **not** an npm workspace — each project has its own `package.json` and dependencies. Package manager is **pnpm**.

## Development Commands

### Library (yzs-keep-alive-v3/)
```bash
cd yzs-keep-alive-v3
pnpm run build          # Build library (ES + UMD) — must run before testing
pnpm run type-check     # TypeScript type checking (vue-tsc)
pnpm run build:types    # Build .d.ts declarations
pnpm run dev            # Dev server
pnpm run preview        # Preview built output
```

### Run a single test (must build first)
```bash
cd yzs-keep-alive-v3
pnpm run build
node test/cache-manager.test.js
node test/lifecycle-manager.test.js
node test/utils.test.js
node test/state-cache.test.js
```

### Test application (Vue 3)
```bash
cd test-app
pnpm run dev            # Dev server (port 5173)
```

## Architecture

### How the KeepAlive works (both v3 components)

Both `YzsKeepAlive.vue` and `YzsKeepAliveEnhanced.vue` are **functionally identical** — they both use Vue's internal renderer API:

1. Access Vue's internal renderer via `instance.ctx.renderer` (gets `patch`, `move`, `_unmount`, `createElement`)
2. Create a hidden `<div>` storage container for deactivated components
3. On **deactivate**: move vnode to hidden container, trigger `deactivated` hooks (`instance.da`)
4. On **activate**: move vnode back to visible container, trigger `activated` hooks (`instance.a`)
5. Cache stored in `Map<string, VNode>`, LRU tracking via `Set<string>`
6. Uses `Promise.resolve().then()` as a simplified `queuePostRenderEffect` scheduler

The only difference: `YzsKeepAliveEnhanced.vue` defines its own local `ShapeFlags` enum instead of importing from `core/shape-flags.ts`.

### Core modules actually used by the main components

Only these `src/core/` modules are imported by `YzsKeepAlive.vue` and `YzsKeepAliveEnhanced.vue`:
- `shape-flags.ts` — Vue internal shape flag constants
- `utils.ts` — `getComponentName()`, `matches()` for include/exclude pattern matching

The following modules exist in `src/core/` but are **not wired into** the main components (exported for potential future use or standalone use):
- `cache-manager.ts` — Standalone LRU cache (Map-based)
- `lifecycle-manager.ts` — Singleton lifecycle hook registry
- `component-wrapper.ts` — Component switching with caching wrapper
- `dom-manager.ts` — DOM container show/hide, scroll position, media pause/resume
- `instance-manager.ts` — Instance state save/restore
- `stack-core.ts`, `history-stack.ts`, `stack-utils.ts`, `hacks.ts` — Router-integrated navigation stack (planned feature, not connected)

### Build & entry point

- Entry: `yzs-keep-alive-v3/src/index.ts`
- Output: `dist/yzs-keep-alive-v3.es.js` (ESM) + `dist/yzs-keep-alive-v3.umd.js` (UMD)
- Type declarations: `dist/types/` via `vite-plugin-dts`
- `vue` and `@vue/shared` are externalized (not bundled)

## Critical Details

- **Tests run against the UMD build**, not source code. Always `pnpm run build` before running tests.
- **Vue internal API dependency**: Both components access `instance.ctx.renderer` — this relies on Vue internals and may break across Vue minor versions. Type augmentations are in `src/types/vue-internal.d.ts`.
- **Historical variants**: `src/components/` contains `.old`, `.old2`, `.stack`, `.stack-backup` files — these are dead code, do not modify.
- **test-app linking**: The test app references `"yzs-keep-alive-v3": "file:../yzskeepalive"` — ensure this path resolves correctly when linking locally.
