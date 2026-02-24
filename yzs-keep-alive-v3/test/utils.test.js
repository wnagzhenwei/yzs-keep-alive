const { getComponentName, matches, generateKey, deepClone } = require('../dist/yzs-keep-alive-v3.umd.js')
const assert = require('assert')

console.log('Testing Utils...')

function testGetComponentName() {
  console.log('  Testing getComponentName...')

  // Test string component
  assert.strictEqual(getComponentName('ComponentA'), 'ComponentA')

  // Test object with name property
  const componentWithName = { name: 'MyComponent' }
  assert.strictEqual(getComponentName(componentWithName), 'MyComponent')

  // Test object with __name property (Vue 3)
  const componentWith__name = { __name: 'VueComponent' }
  assert.strictEqual(getComponentName(componentWith__name), 'VueComponent')

  // Test object with displayName
  const componentWithDisplayName = { displayName: 'DisplayComponent' }
  assert.strictEqual(getComponentName(componentWithDisplayName), 'DisplayComponent')

  // Test empty object
  assert.strictEqual(getComponentName({}), '')

  // Test null/undefined
  assert.strictEqual(getComponentName(null), '')
  assert.strictEqual(getComponentName(undefined), '')

  console.log('  ✓ getComponentName passed')
}

function testMatches() {
  console.log('  Testing matches...')

  // Test string match
  assert.strictEqual(matches('ComponentA', 'ComponentA'), true)
  assert.strictEqual(matches('ComponentA', 'ComponentB'), false)

  // Test regex match
  assert.strictEqual(matches(/^Comp/, 'ComponentA'), true)
  assert.strictEqual(matches(/^Comp/, 'Other'), false)

  // Test array of strings
  assert.strictEqual(matches(['CompA', 'CompB'], 'CompA'), true)
  assert.strictEqual(matches(['CompA', 'CompB'], 'CompC'), false)

  // Test array of regex
  assert.strictEqual(matches([/^A/, /^B/], 'Component'), false)
  assert.strictEqual(matches([/^A/, /^B/], 'Apple'), true)

  // Test mixed array
  assert.strictEqual(matches(['CompA', /^CompB/], 'CompA'), true)
  assert.strictEqual(matches(['CompA', /^CompB/], 'CompBTest'), true)
  assert.strictEqual(matches(['CompA', /^CompB/], 'CompC'), false)

  console.log('  ✓ matches passed')
}

function testGenerateKey() {
  console.log('  Testing generateKey...')

  const component = { name: 'TestComponent' }
  const props1 = { id: 1, name: 'test' }
  const props2 = { id: 2, name: 'test2' }

  const key1 = generateKey(component, props1)
  const key2 = generateKey(component, props2)

  assert.strictEqual(typeof key1, 'string')
  assert.strictEqual(key1.includes('TestComponent'), true)
  assert.notStrictEqual(key1, key2)

  // Same props should generate same key
  const key3 = generateKey(component, props1)
  assert.strictEqual(key1, key3)

  console.log('  ✓ generateKey passed')
}

function testDeepClone() {
  console.log('  Testing deepClone...')

  // Test primitive
  assert.strictEqual(deepClone(42), 42)
  assert.strictEqual(deepClone('test'), 'test')
  assert.strictEqual(deepClone(null), null)
  assert.strictEqual(deepClone(undefined), undefined)

  // Test array
  const arr = [1, 2, { nested: 'value' }]
  const clonedArr = deepClone(arr)
  assert.deepStrictEqual(clonedArr, arr)
  assert.notStrictEqual(clonedArr, arr) // Should be different reference
  assert.notStrictEqual(clonedArr[2], arr[2]) // Nested object should also be cloned

  // Test object
  const obj = { a: 1, b: { nested: 'value' }, c: [1, 2, 3] }
  const clonedObj = deepClone(obj)
  assert.deepStrictEqual(clonedObj, obj)
  assert.notStrictEqual(clonedObj, obj)
  assert.notStrictEqual(clonedObj.b, obj.b)
  assert.notStrictEqual(clonedObj.c, obj.c)

  // Test that modifying clone doesn't affect original
  clonedObj.a = 999
  clonedObj.b.nested = 'modified'
  clonedObj.c.push(4)
  assert.strictEqual(obj.a, 1)
  assert.strictEqual(obj.b.nested, 'value')
  assert.strictEqual(obj.c.length, 3)

  console.log('  ✓ deepClone passed')
}

try {
  testGetComponentName()
  testMatches()
  testGenerateKey()
  testDeepClone()
  console.log('\n✅ All utils tests passed!')
} catch (error) {
  console.error('\n❌ Test failed:', error.message)
  console.error(error.stack)
  process.exit(1)
}