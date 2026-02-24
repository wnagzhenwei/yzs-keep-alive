/**
 * LRU Cache Manager for Vue 2
 * Uses plain objects and arrays instead of Map/Set for Vue 2 compatibility
 */

export class LRUCacheManager {
  constructor(options = {}) {
    // Use Object.create(null) for Vue 2 reactivity compatibility
    this.cache = Object.create(null)
    this.keys = []
    this.max = options.max || 10
  }

  /**
   * Get item from cache and update LRU order
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    const item = this.cache[key]
    if (!item) return undefined

    // Move key to end (most recently used)
    const index = this.keys.indexOf(key)
    if (index > -1) {
      this.keys.splice(index, 1)
      this.keys.push(key)
    }

    return item
  }

  /**
   * Set item in cache with LRU eviction
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  set(key, value) {
    // If key already exists, remove it first
    if (this.cache[key]) {
      const index = this.keys.indexOf(key)
      if (index > -1) {
        this.keys.splice(index, 1)
      }
    }

    // Evict oldest if max limit reached
    if (this.keys.length >= this.max) {
      const oldestKey = this.keys[0]
      this.delete(oldestKey)
    }

    // Add new item
    this.cache[key] = value
    this.keys.push(key)
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if exists
   */
  has(key) {
    return key in this.cache
  }

  /**
   * Delete item from cache
   * @param {string} key - Cache key
   * @returns {boolean} True if deleted
   */
  delete(key) {
    if (!(key in this.cache)) return false

    delete this.cache[key]
    const index = this.keys.indexOf(key)
    if (index > -1) {
      this.keys.splice(index, 1)
    }
    return true
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache = Object.create(null)
    this.keys = []
  }

  /**
   * Get all cached keys in LRU order (oldest to newest)
   * @returns {Array<string>} Array of keys
   */
  keys() {
    return [...this.keys]
  }

  /**
   * Get current cache size
   * @returns {number} Number of cached items
   */
  size() {
    return this.keys.length
  }

  /**
   * Get the oldest key (least recently used)
   * @returns {string|undefined} Oldest key
   */
  getOldestKey() {
    return this.keys[0]
  }

  /**
   * Get the newest key (most recently used)
   * @returns {string|undefined} Newest key
   */
  getNewestKey() {
    return this.keys[this.keys.length - 1]
  }

  /**
   * Update LRU position (move to end)
   * @param {string} key - Cache key
   */
  updateLRU(key) {
    const index = this.keys.indexOf(key)
    if (index > -1) {
      this.keys.splice(index, 1)
      this.keys.push(key)
    }
  }

  /**
   * Iterate over cache entries
   * @param {Function} callback - Callback function (value, key, index)
   */
  forEach(callback) {
    this.keys.forEach((key, index) => {
      callback(this.cache[key], key, index)
    })
  }

  /**
   * Filter cache entries
   * @param {Function} predicate - Filter function (value, key, index)
   * @returns {Array} Array of matching entries
   */
  filter(predicate) {
    const results = []
    this.keys.forEach((key, index) => {
      if (predicate(this.cache[key], key, index)) {
        results.push({ key, value: this.cache[key] })
      }
    })
    return results
  }
}
