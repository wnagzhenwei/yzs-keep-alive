const { useKeepAliveLifecycle, getLifecycleManager, resetLifecycleManager } = require('../dist/yzs-keep-alive-v3.umd.js')
const assert = require('assert')

console.log('Testing Lifecycle Manager...')

function testLifecycleHooks() {
  console.log('  Testing lifecycle hooks...')

  // Reset singleton for clean test
  resetLifecycleManager()
  const manager = getLifecycleManager()

  // Mock components
  const component1 = { name: 'ComponentA' }
  const component2 = { name: 'ComponentB' }

  // Track callbacks
  let activated1 = false
  let deactivated1 = false
  let activated2 = false
  let deactivated2 = false

  // Register hooks
  manager.registerActivated(component1, () => { activated1 = true })
  manager.registerDeactivated(component1, () => { deactivated1 = true })
  manager.registerActivated(component2, () => { activated2 = true })
  manager.registerDeactivated(component2, () => { deactivated2 = true })

  // Trigger hooks
  assert.strictEqual(activated1, false)
  assert.strictEqual(deactivated1, false)

  manager.triggerActivated(component1)
  assert.strictEqual(activated1, true)
  assert.strictEqual(deactivated1, false)

  manager.triggerDeactivated(component1)
  assert.strictEqual(activated1, true)
  assert.strictEqual(deactivated1, true)

  // Component2 should not be affected
  assert.strictEqual(activated2, false)
  assert.strictEqual(deactivated2, false)

  manager.triggerActivated(component2)
  assert.strictEqual(activated2, true)

  // Test cleanup
  manager.cleanupComponent(component1)
  activated1 = false
  deactivated1 = false

  // Hooks should not be triggered after cleanup
  manager.triggerActivated(component1)
  manager.triggerDeactivated(component1)
  assert.strictEqual(activated1, false)
  assert.strictEqual(deactivated1, false)

  // Component2 should still work
  manager.triggerDeactivated(component2)
  assert.strictEqual(deactivated2, true)

  console.log('  ✓ Lifecycle hooks passed')
}

function testMultipleCallbacks() {
  console.log('  Testing multiple callbacks...')

  resetLifecycleManager()
  const manager = getLifecycleManager()

  const component = { name: 'TestComponent' }
  const calls = []

  // Register multiple callbacks
  manager.registerActivated(component, () => { calls.push('activated1') })
  manager.registerActivated(component, () => { calls.push('activated2') })
  manager.registerActivated(component, () => { calls.push('activated3') })

  manager.triggerActivated(component)

  assert.deepStrictEqual(calls, ['activated1', 'activated2', 'activated3'])

  console.log('  ✓ Multiple callbacks passed')
}

function testCleanupAll() {
  console.log('  Testing cleanup all...')

  resetLifecycleManager()
  const manager = getLifecycleManager()

  const component1 = { name: 'Component1' }
  const component2 = { name: 'Component2' }

  let called1 = false
  let called2 = false

  manager.registerActivated(component1, () => { called1 = true })
  manager.registerActivated(component2, () => { called2 = true })

  manager.cleanupAll()

  manager.triggerActivated(component1)
  manager.triggerActivated(component2)

  assert.strictEqual(called1, false)
  assert.strictEqual(called2, false)

  console.log('  ✓ Cleanup all passed')
}

try {
  testLifecycleHooks()
  testMultipleCallbacks()
  testCleanupAll()
  console.log('\n✅ All lifecycle manager tests passed!')
} catch (error) {
  console.error('\n❌ Test failed:', error.message)
  console.error(error.stack)
  process.exit(1)
}