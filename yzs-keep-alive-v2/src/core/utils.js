/**
 * Utility functions for yzs-keep-alive-v2
 * Vue 2 compatible implementation
 */

/**
 * Get component name from component options
 * @param {Object} componentOptions - Vue 2 componentOptions object
 * @returns {string} Component name
 */
export function getComponentName(componentOptions) {
  if (!componentOptions) return ''

  // Vue 2: Component name is in componentOptions.Ctor.options.name
  const name = componentOptions.Ctor?.options?.name || componentOptions.tag || ''
  return name
}

/**
 * Generate cache key for a component vnode
 * @param {Object} vnode - Vue 2 VNode
 * @param {Object} componentOptions - Component options
 * @returns {string} Cache key
 */
export function generateKey(vnode, componentOptions) {
  // Use vnode.key if provided, otherwise generate from component info
  if (vnode.key != null) {
    return String(vnode.key)
  }

  const cid = componentOptions.Ctor?.cid || ''
  const tag = componentOptions.tag || ''

  return `${cid}::${tag}`
}

/**
 * Check if a component name matches a pattern
 * @param {string|RegExp|Array} pattern - Pattern(s) to match
 * @param {string} name - Component name to check
 * @returns {boolean} True if matches
 */
export function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.some(p => matches(p, name))
  }

  if (typeof pattern === 'string') {
    return pattern === name
  }

  if (pattern instanceof RegExp) {
    return pattern.test(name)
  }

  return false
}

/**
 * Check if component should be cached based on include/exclude
 * @param {string|RegExp|Array} include - Include pattern
 * @param {string|RegExp|Array} exclude - Exclude pattern
 * @param {string} name - Component name
 * @returns {boolean} True if should NOT be cached
 */
export function shouldNotCache(include, exclude, name) {
  if (!name) return false

  if (include && !matches(include, name)) {
    return true
  }

  if (exclude && matches(exclude, name)) {
    return true
  }

  return false
}

/**
 * Check if vnode is a component vnode
 * @param {Object} vnode - Vue 2 VNode
 * @returns {boolean} True if component vnode
 */
export function isComponentVNode(vnode) {
  return !!(vnode && vnode.componentOptions)
}

/**
 * Check if vnode is a valid keep-alive candidate
 * @param {Object} vnode - Vue 2 VNode
 * @returns {boolean} True if valid for keep-alive
 */
export function isValidKeepAliveNode(vnode) {
  return isComponentVNode(vnode)
}
