const { createCacheManager } = require('../dist/yzs-keep-alive-v3.umd.js')
const assert = require('assert')

console.log('Testing Cache Manager...')

function testBasicOperations() {
  console.log('  Testing basic operations...')
  const cache = createCacheManager({ max: 3 })

  // Test set and get
  cache.set('key1', { value: 'test1' })
  cache.set('key2', { value: 'test2' })
  cache.set('key3', { value: 'test3' })

  assert.strictEqual(cache.has('key1'), true)
  assert.strictEqual(cache.has('key2'), true)
  assert.strictEqual(cache.has('key3'), true)
  assert.strictEqual(cache.has('key4'), false)

  const item1 = cache.get('key1')
  assert.deepStrictEqual(item1, { value: 'test1' })

  // Test LRU eviction
  cache.set('key4', { value: 'test4' }) // Should evict key2 (oldest)
  assert.strictEqual(cache.has('key1'), true) // key1 was recently accessed
  assert.strictEqual(cache.has('key2'), false) // key2 should be evicted
  assert.strictEqual(cache.has('key3'), true)
  assert.strictEqual(cache.has('key4'), true)

  // Test delete
  assert.strictEqual(cache.delete('key1'), true)
  assert.strictEqual(cache.has('key1'), false)

  // Test clear
  cache.clear()
  assert.strictEqual(cache.size(), 0)

  console.log('  ✓ Basic operations passed')
}

function testLRUBehavior() {
  console.log('  Testing LRU behavior...')
  const cache = createCacheManager({ max: 3 })

  cache.set('a', { value: 1 })
  cache.set('b', { value: 2 })
  cache.set('c', { value: 3 })

  // Access 'a' to make it most recently used
  cache.get('a')

  // Add 'd' - should evict 'b' (least recently used)
  cache.set('d', { value: 4 })

  assert.strictEqual(cache.has('a'), true)
  assert.strictEqual(cache.has('b'), false) // b should be evicted
  assert.strictEqual(cache.has('c'), true)
  assert.strictEqual(cache.has('d'), true)

  console.log('  ✓ LRU behavior passed')
}

function testMaxSize() {
  console.log('  Testing max size...')
  const cache = createCacheManager({ max: 2 })

  cache.set('key1', { value: 1 })
  cache.set('key2', { value: 2 })
  assert.strictEqual(cache.size(), 2)

  cache.set('key3', { value: 3 }) // Should evict key1
  assert.strictEqual(cache.size(), 2)
  assert.strictEqual(cache.has('key1'), false)
  assert.strictEqual(cache.has('key2'), true)
  assert.strictEqual(cache.has('key3'), true)

  console.log('  ✓ Max size passed')
}

try {
  testBasicOperations()
  testLRUBehavior()
  testMaxSize()
  console.log('\n✅ All cache manager tests passed!')
} catch (error) {
  console.error('\n❌ Test failed:', error.message)
  console.error(error.stack)
  process.exit(1)
}