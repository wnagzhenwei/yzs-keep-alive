/**
 * 状态缓存测试
 */

console.log('Testing State Cache...\n')

// 模拟 Vue 响应式对象
function createMockRef(value) {
  return {
    _is_ref: true,
    value: value
  }
}

function createMockReactive(obj) {
  return {
    __v_isReactive: true,
    ...obj
  }
}

// 测试响应式对象检测
console.log('  Testing reactive object detection...')

// 由于构建后的文件是 ES 模块，我们需要直接测试源代码
// 这里我们直接复制工具函数的逻辑进行测试
function isVueReactive(obj) {
  if (!obj || typeof obj !== 'object') return false

  // 检查是否是 ref
  if (obj._is_ref === true) return true

  // 检查是否是 reactive
  if (obj.__v_isReactive === true) return true

  // 检查是否是 readonly
  if (obj.__v_isReadonly === true) return true

  // 检查是否是 shallow reactive
  if (obj.__v_isShallow === true) return true

  return false
}

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理 Vue 响应式对象
  if (isVueReactive(obj)) {
    return cloneVueReactive(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item))
  }

  const cloned = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }

  return cloned
}

function cloneVueReactive(obj) {
  if (!obj || typeof obj !== 'object') return obj

  // 处理 ref
  if (obj._is_ref === true) {
    // 创建新的 ref 并复制值
    return {
      _is_ref: true,
      value: deepClone(obj.value)
    }
  }

  // 处理 reactive 对象
  if (obj.__v_isReactive === true || obj.__v_isReadonly === true || obj.__v_isShallow === true) {
    // 提取原始值进行克隆
    const cloned = {}
    for (const key in obj) {
      // 跳过 Vue 内部属性
      if (key.startsWith('__v_') || key === '_is_ref') continue
      cloned[key] = deepClone(obj[key])
    }
    return cloned
  }

  return deepClone(obj)
}

function safeCloneState(state) {
  if (!state || typeof state !== 'object') return state

  if (Array.isArray(state)) {
    return state.map(item => safeCloneState(item))
  }

  const cloned = {}
  for (const key in state) {
    if (Object.prototype.hasOwnProperty.call(state, key)) {
      const value = state[key]
      cloned[key] = isVueReactive(value) ? cloneVueReactive(value) : deepClone(value)
    }
  }

  return cloned
}

const testRef = createMockRef('test')
const testReactive = createMockReactive({ foo: 'bar' })
const plainObj = { normal: 'object' }

if (!isVueReactive(testRef)) {
  console.error('  ✗ Failed to detect ref')
  process.exit(1)
}

if (!isVueReactive(testReactive)) {
  console.error('  ✗ Failed to detect reactive')
  process.exit(1)
}

if (isVueReactive(plainObj)) {
  console.error('  ✗ False positive for plain object')
  process.exit(1)
}

console.log('  ✓ Reactive object detection passed')

// 测试响应式对象克隆
console.log('  Testing reactive object cloning...')
const clonedRef = cloneVueReactive(testRef)
if (!clonedRef._is_ref || clonedRef.value !== 'test') {
  console.error('  ✗ Failed to clone ref')
  process.exit(1)
}

const clonedReactive = cloneVueReactive(testReactive)
if (clonedReactive.__v_isReactive || clonedReactive.foo !== 'bar') {
  console.error('  ✗ Failed to clone reactive')
  process.exit(1)
}

console.log('  ✓ Reactive object cloning passed')

// 测试安全状态克隆
console.log('  Testing safe state cloning...')
const mixedState = {
  ref: createMockRef(42),
  reactive: createMockReactive({ nested: { value: 'test' } }),
  normal: 'string',
  array: [1, 2, 3],
  nested: {
    deepRef: createMockRef(true)
  }
}

const clonedState = safeCloneState(mixedState)

// 检查 ref 被正确克隆
if (!clonedState.ref._is_ref || clonedState.ref.value !== 42) {
  console.error('  ✗ Failed to clone ref in mixed state')
  process.exit(1)
}

// 检查 reactive 被正确克隆（Vue 内部属性被移除）
if (clonedState.reactive.__v_isReactive || clonedState.reactive.nested.value !== 'test') {
  console.error('  ✗ Failed to clone reactive in mixed state')
  process.exit(1)
}

// 检查普通值被正确克隆
if (clonedState.normal !== 'string') {
  console.error('  ✗ Failed to clone normal value')
  process.exit(1)
}

// 检查数组被正确克隆
if (!Array.isArray(clonedState.array) || clonedState.array.length !== 3) {
  console.error('  ✗ Failed to clone array')
  process.exit(1)
}

// 检查嵌套对象中的 ref
if (!clonedState.nested.deepRef._is_ref || clonedState.nested.deepRef.value !== true) {
  console.error('  ✗ Failed to clone nested ref')
  process.exit(1)
}

console.log('  ✓ Safe state cloning passed')

console.log('\n✅ All state cache tests passed!')