declare module 'yzs-keep-alive-v2' {
  import { VueConstructor } from 'vue'

  export interface LRUCacheManagerOptions {
    max?: number
  }

  export class LRUCacheManager {
    constructor(options?: LRUCacheManagerOptions)
    get(key: string): any
    set(key: string, value: any): void
    has(key: string): boolean
    delete(key: string): boolean
    clear(): void
    size(): number
    keys(): string[]
    getOldestKey(): string | undefined
    getNewestKey(): string | undefined
    updateLRU(key: string): void
    forEach(callback: (value: any, key: string, index: number) => void): void
    filter(predicate: (value: any, key: string, index: number) => boolean): Array<{ key: string; value: any }>
  }

  export interface YzsKeepAliveMethods {
    clearCache(): void
    clearCacheByKey(key: string): void
    pruneCacheWithFilter(filter: (name: string, key: string) => boolean): void
    getCachedKeys(): string[]
    getCacheSize(): number
  }

  export const YzsKeepAlive: VueConstructor<Vue & YzsKeepAliveMethods>

  export default YzsKeepAlive

  export function getComponentName(componentOptions: any): string
  export function generateKey(vnode: any, componentOptions: any): string
  export function matches(pattern: string | RegExp | Array<string | RegExp>, name: string): boolean
  export function shouldNotCache(
    include: string | RegExp | Array<string | RegExp>,
    exclude: string | RegExp | Array<string | RegExp>,
    name: string
  ): boolean
  export function isComponentVNode(vnode: any): boolean
  export function isValidKeepAliveNode(vnode: any): boolean
}
