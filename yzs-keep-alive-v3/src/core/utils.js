/**
 * 获取组件的名称
 */
export function getComponentName(component) {
    if (!component)
        return '';
    if (typeof component === 'string') {
        return component;
    }
    if (component.name) {
        return component.name;
    }
    if (component.__name) {
        return component.__name;
    }
    if (component.displayName) {
        return component.displayName;
    }
    return '';
}
/**
 * 检查组件是否匹配include/exclude规则
 */
export function matches(pattern, name) {
    if (Array.isArray(pattern)) {
        return pattern.some(p => matches(p, name));
    }
    if (typeof pattern === 'string') {
        return pattern === name;
    }
    if (pattern instanceof RegExp) {
        return pattern.test(name);
    }
    return false;
}
/**
 * 生成缓存key
 */
export function generateKey(component, props) {
    const name = getComponentName(component);
    const propStr = JSON.stringify(props);
    return `${name}:${propStr}`;
}
/**
 * 深拷贝对象（简单实现，用于props）
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    // 处理 Vue 响应式对象
    if (isVueReactive(obj)) {
        return cloneVueReactive(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}
/**
 * 检查是否是 Vue 响应式对象
 */
export function isVueReactive(obj) {
    if (!obj || typeof obj !== 'object')
        return false;
    // 检查是否是 ref
    if (obj._is_ref === true)
        return true;
    // 检查是否是 reactive
    if (obj.__v_isReactive === true)
        return true;
    // 检查是否是 readonly
    if (obj.__v_isReadonly === true)
        return true;
    // 检查是否是 shallow reactive
    if (obj.__v_isShallow === true)
        return true;
    return false;
}
/**
 * 克隆 Vue 响应式对象
 */
export function cloneVueReactive(obj) {
    if (!obj || typeof obj !== 'object')
        return obj;
    // 处理 ref
    if (obj._is_ref === true) {
        // 创建新的 ref 并复制值
        return {
            _is_ref: true,
            value: deepClone(obj.value)
        };
    }
    // 处理 reactive 对象
    if (obj.__v_isReactive === true || obj.__v_isReadonly === true || obj.__v_isShallow === true) {
        // 提取原始值进行克隆
        const cloned = {};
        for (const key in obj) {
            // 跳过 Vue 内部属性
            if (key.startsWith('__v_') || key === '_is_ref')
                continue;
            cloned[key] = deepClone(obj[key]);
        }
        return cloned;
    }
    return deepClone(obj);
}
/**
 * 安全地克隆组件状态，处理响应式对象
 */
export function safeCloneState(state) {
    if (!state || typeof state !== 'object')
        return state;
    if (Array.isArray(state)) {
        return state.map(item => safeCloneState(item));
    }
    const cloned = {};
    for (const key in state) {
        if (Object.prototype.hasOwnProperty.call(state, key)) {
            const value = state[key];
            cloned[key] = isVueReactive(value) ? cloneVueReactive(value) : deepClone(value);
        }
    }
    return cloned;
}
