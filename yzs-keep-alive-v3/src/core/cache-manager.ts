import type { CacheItem, CacheManager, LRUCacheOptions } from '../types'

/**
 * LRU缓存管理器实现
 */
export class LRUCacheManager implements CacheManager {
  private cache: Map<string, CacheItem>
  private maxSize: number
  private readonly defaultMaxSize = 10

  constructor(options: LRUCacheOptions = {}) {
    this.cache = new Map()
    this.maxSize = options.max || this.defaultMaxSize
  }

  /**
   * 检查缓存中是否存在指定key
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * 获取缓存项，如果存在则将其移动到最近使用的位置
   */
  get(key: string): CacheItem | undefined {
    const item = this.cache.get(key)
    if (!item) {
      return undefined
    }

    // 移动到最近使用的位置（LRU策略）
    this.cache.delete(key)
    this.cache.set(key, item)

    return item
  }

  /**
   * 设置缓存项
   */
  set(key: string, item: CacheItem): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // 检查是否超过最大容量
    if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项（Map的第一个键）
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    // 设置新项
    this.cache.set(key, item)
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 更新最大容量
   */
  setMaxSize(max: number): void {
    this.maxSize = max
    // 如果当前大小超过新容量，删除最久未使用的项
    while (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      } else {
        break
      }
    }
  }
}

/**
 * 创建缓存管理器实例
 */
export function createCacheManager(options: LRUCacheOptions = {}): CacheManager {
  return new LRUCacheManager(options)
}