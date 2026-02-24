/**
 * Unit tests for utility functions
 * Run with: node test/utils.test.js
 */

const { getComponentName, generateKey, matches, shouldNotCache } = require('../dist/yzs-keep-alive-v2.umd.js')

// Mock component options for Vue 2
function createComponentOptions(name, cid, tag) {
  return {
    Ctor: {
      cid: cid,
      options: {
        name: name
      }
    },
    tag: tag
  }
}

function createVNode(key) {
  return {
    key: key,
    componentOptions: createComponentOptions('Test', 1, 'test-component')
  }
}

// Tests
console.log('Running utils tests...\n')

// Test 1: getComponentName
console.log('Test 1: getComponentName')
const opts1 = createComponentOptions('MyComponent', 1, 'my-tag')
console.log('  With name:', getComponentName(opts1))
console.log('  Expected: MyComponent')
console.log(getComponentName(opts1) === 'MyComponent' ? '✓ PASS' : '✗ FAIL')

const opts2 = createComponentOptions(null, 1, 'my-tag')
console.log('  Without name, with tag:', getComponentName(opts2))
console.log('  Expected: my-tag')
console.log(getComponentName(opts2) === 'my-tag' ? '✓ PASS' : '✗ FAIL')

const opts3 = createComponentOptions(null, 1, null)
console.log('  Without name or tag:', getComponentName(opts3))
console.log('  Expected: (empty string)')
console.log(getComponentName(opts3) === '' ? '✓ PASS' : '✗ FAIL')

// Test 2: generateKey
console.log('\nTest 2: generateKey')
const vnode1 = createVNode('custom-key')
const key1 = generateKey(vnode1, vnode1.componentOptions)
console.log('  With custom key:', key1)
console.log('  Expected: custom-key')
console.log(key1 === 'custom-key' ? '✓ PASS' : '✗ FAIL')

const vnode2 = createVNode(null)
const key2 = generateKey(vnode2, vnode2.componentOptions)
console.log('  Without custom key:', key2)
console.log('  Expected: 1::test-component')
console.log(key2 === '1::test-component' ? '✓ PASS' : '✗ FAIL')

// Test 3: matches
console.log('\nTest 3: matches')
console.log('  String match:', matches('ComponentA', 'ComponentA'))
console.log('  Expected: true')
console.log(matches('ComponentA', 'ComponentA') === true ? '✓ PASS' : '✗ FAIL')

console.log('  String no match:', matches('ComponentA', 'ComponentB'))
console.log('  Expected: false')
console.log(matches('ComponentA', 'ComponentB') === false ? '✓ PASS' : '✗ FAIL')

console.log('  RegExp match:', matches(/^Component/, 'ComponentA'))
console.log('  Expected: true')
console.log(matches(/^Component/, 'ComponentA') === true ? '✓ PASS' : '✗ FAIL')

console.log('  Array match:', matches(['A', 'B'], 'A'))
console.log('  Expected: true')
console.log(matches(['A', 'B'], 'A') === true ? '✓ PASS' : '✗ FAIL')

// Test 4: shouldNotCache
console.log('\nTest 4: shouldNotCache')
console.log('  Include match:', shouldNotCache(['A', 'B'], null, 'A'))
console.log('  Expected: false (should cache)')
console.log(shouldNotCache(['A', 'B'], null, 'A') === false ? '✓ PASS' : '✗ FAIL')

console.log('  Include no match:', shouldNotCache(['A', 'B'], null, 'C'))
console.log('  Expected: true (should NOT cache)')
console.log(shouldNotCache(['A', 'B'], null, 'C') === true ? '✓ PASS' : '✗ FAIL')

console.log('  Exclude match:', shouldNotCache(null, ['A', 'B'], 'A'))
console.log('  Expected: true (should NOT cache)')
console.log(shouldNotCache(null, ['A', 'B'], 'A') === true ? '✓ PASS' : '✗ FAIL')

console.log('  Exclude no match:', shouldNotCache(null, ['A', 'B'], 'C'))
console.log('  Expected: false (should cache)')
console.log(shouldNotCache(null, ['A', 'B'], 'C') === false ? '✓ PASS' : '✗ FAIL')

console.log('\n✅ All utils tests completed!')
