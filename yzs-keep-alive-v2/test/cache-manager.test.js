/**
 * Unit tests for LRUCacheManager
 * Run with: node test/cache-manager.test.js
 */

// We'll use the built UMD file, but for now test the module directly
// You may need to adjust this path after building
const LRUCacheManagerClass = require('../dist/yzs-keep-alive-v2.umd.js').LRUCacheManager

console.log('Running cache manager tests...\n')

// Test 1: Basic set and get
console.log('Test 1: Basic set and get')
const cache1 = new LRUCacheManagerClass({ max: 3 })
cache1.set('a', { value: 1 })
cache1.set('b', { value: 2 })
const result1 = cache1.get('a')
console.log('  Get "a":', result1)
console.log('  Expected: { value: 1 }')
console.log(result1 && result1.value === 1 ? '✓ PASS' : '✗ FAIL')

// Test 2: LRU order
console.log('\nTest 2: LRU order')
const cache2 = new LRUCacheManagerClass({ max: 3 })
cache2.set('a', 1)
cache2.set('b', 2)
cache2.set('c', 3)
cache2.get('a') // 'a' becomes most recently used
cache2.set('d', 4) // Should evict 'b' (least recently used)
console.log('  Has "a":', cache2.has('a'))
console.log('  Expected: true')
console.log(cache2.has('a') === true ? '✓ PASS' : '✗ FAIL')
console.log('  Has "b":', cache2.has('b'))
console.log('  Expected: false (evicted)')
console.log(cache2.has('b') === false ? '✓ PASS' : '✗ FAIL')
console.log('  Has "c":', cache2.has('c'))
console.log('  Expected: true')
console.log(cache2.has('c') === true ? '✓ PASS' : '✗ FAIL')

// Test 3: Max limit eviction
console.log('\nTest 3: Max limit eviction')
const cache3 = new LRUCacheManagerClass({ max: 2 })
cache3.set('a', 1)
cache3.set('b', 2)
cache3.set('c', 3) // Should evict 'a'
console.log('  Size:', cache3.size())
console.log('  Expected: 2')
console.log(cache3.size() === 2 ? '✓ PASS' : '✗ FAIL')
console.log('  Has "a":', cache3.has('a'))
console.log('  Expected: false')
console.log(cache3.has('a') === false ? '✓ PASS' : '✗ FAIL')

// Test 4: Delete
console.log('\nTest 4: Delete')
const cache4 = new LRUCacheManagerClass({ max: 5 })
cache4.set('a', 1)
cache4.set('b', 2)
cache4.delete('a')
console.log('  Has "a" after delete:', cache4.has('a'))
console.log('  Expected: false')
console.log(cache4.has('a') === false ? '✓ PASS' : '✗ FAIL')
console.log('  Has "b":', cache4.has('b'))
console.log('  Expected: true')
console.log(cache4.has('b') === true ? '✓ PASS' : '✗ FAIL')

// Test 5: Clear
console.log('\nTest 5: Clear')
const cache5 = new LRUCacheManagerClass({ max: 5 })
cache5.set('a', 1)
cache5.set('b', 2)
cache5.clear()
console.log('  Size after clear:', cache5.size())
console.log('  Expected: 0')
console.log(cache5.size() === 0 ? '✓ PASS' : '✗ FAIL')

// Test 6: Update LRU
console.log('\nTest 6: Update LRU position')
const cache6 = new LRUCacheManagerClass({ max: 3 })
cache6.set('a', 1)
cache6.set('b', 2)
cache6.updateLRU('a') // Move 'a' to end
const oldest = cache6.getOldestKey()
console.log('  Oldest key:', oldest)
console.log('  Expected: b')
console.log(oldest === 'b' ? '✓ PASS' : '✗ FAIL')

// Test 7: ForEach
console.log('\nTest 7: ForEach iteration')
const cache7 = new LRUCacheManagerClass({ max: 5 })
cache7.set('a', 1)
cache7.set('b', 2)
cache7.set('c', 3)
let count = 0
cache7.forEach((value, key, index) => {
  count++
})
console.log('  Iteration count:', count)
console.log('  Expected: 3')
console.log(count === 3 ? '✓ PASS' : '✗ FAIL')

// Test 8: Filter
console.log('\nTest 8: Filter')
const cache8 = new LRUCacheManagerClass({ max: 5 })
cache8.set('a', 1)
cache8.set('ab', 2)
cache8.set('abc', 3)
const filtered = cache8.filter((value, key) => key.includes('a'))
console.log('  Filtered count:', filtered.length)
console.log('  Expected: 3')
console.log(filtered.length === 3 ? '✓ PASS' : '✗ FAIL')

console.log('\n✅ All cache manager tests completed!')
