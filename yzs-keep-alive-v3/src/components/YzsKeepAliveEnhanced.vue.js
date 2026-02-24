/// <reference types="E:/webspace/keepalive/yzskeepalive/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="E:/webspace/keepalive/yzskeepalive/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { getCurrentInstance, cloneVNode, isVNode, watch, onMounted, onUpdated, onBeforeUnmount, defineComponent } from 'vue';
import { isString, isArray } from '@vue/shared';
// Shape flags (copied from Vue internals)
var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["FUNCTIONAL_COMPONENT"] = 2] = "FUNCTIONAL_COMPONENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
    ShapeFlags[ShapeFlags["TELEPORT"] = 64] = "TELEPORT";
    ShapeFlags[ShapeFlags["SUSPENSE"] = 128] = "SUSPENSE";
    ShapeFlags[ShapeFlags["COMPONENT_SHOULD_KEEP_ALIVE"] = 256] = "COMPONENT_SHOULD_KEEP_ALIVE";
    ShapeFlags[ShapeFlags["COMPONENT_KEPT_ALIVE"] = 512] = "COMPONENT_KEPT_ALIVE";
    ShapeFlags[ShapeFlags["COMPONENT"] = 6] = "COMPONENT";
})(ShapeFlags || (ShapeFlags = {}));
// Move type enum
var MoveType;
(function (MoveType) {
    MoveType[MoveType["ENTER"] = 0] = "ENTER";
    MoveType[MoveType["LEAVE"] = 1] = "LEAVE";
    MoveType[MoveType["REORDER"] = 2] = "REORDER";
})(MoveType || (MoveType = {}));
// Get component name utility
function getComponentName(Component) {
    if (isString(Component)) {
        return Component;
    }
    return Component.name || Component.__name || Component.displayName || '';
}
// Check if component matches pattern
function matches(pattern, name) {
    if (isArray(pattern)) {
        return pattern.some(p => matches(p, name));
    }
    else if (isString(pattern)) {
        return pattern === name;
    }
    else if (pattern instanceof RegExp) {
        return pattern.test(name);
    }
    return false;
}
// Get inner child for suspense
function getInnerChild(vnode) {
    return vnode.shapeFlag & ShapeFlags.SUSPENSE ? vnode.ssContent : vnode;
}
// Reset shape flags
function resetShapeFlag(vnode) {
    if (!vnode)
        return;
    let shapeFlag = vnode.shapeFlag;
    if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
        shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;
    }
    if (shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        shapeFlag -= ShapeFlags.COMPONENT_KEPT_ALIVE;
    }
    vnode.shapeFlag = shapeFlag;
}
export default {};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
const __VLS_export = defineComponent({
    name: 'YzsKeepAliveEnhanced',
    // Marker for special handling inside renderer
    __isKeepAlive: true,
    props: {
        include: [String, RegExp, Array],
        exclude: [String, RegExp, Array],
        max: [String, Number]
    },
    setup(props, { slots }) {
        const instance = getCurrentInstance();
        const sharedContext = instance.ctx;
        // If no renderer, it's SSR - just render children
        if (!sharedContext.renderer) {
            return () => slots.default?.();
        }
        const cache = new Map();
        const keys = new Set();
        let current = null;
        const parentSuspense = instance.suspense;
        // Get renderer internals
        const { renderer: { p: patch, m: move, um: _unmount, o: { createElement } } } = sharedContext;
        // Create storage container for deactivated components
        const storageContainer = createElement('div');
        // Setup activate/deactivate functions for renderer
        sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
            const instance = vnode.component;
            move(vnode, container, anchor, MoveType.ENTER, parentSuspense);
            // Queue post-render effect for activated hooks
            queuePostRenderEffect(() => {
                instance.isDeactivated = false;
                if (instance.a) { // activated hooks
                    ;
                    instance.a.forEach(fn => fn());
                }
                // Call vnode mounted hook
                const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
                if (vnodeHook) {
                    vnodeHook(vnode);
                }
            }, parentSuspense);
        };
        sharedContext.deactivate = (vnode) => {
            const instance = vnode.component;
            move(vnode, storageContainer, null, MoveType.LEAVE, parentSuspense);
            queuePostRenderEffect(() => {
                if (instance.da) { // deactivated hooks
                    ;
                    instance.da.forEach(fn => fn());
                }
                // Call vnode unmounted hook
                const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;
                if (vnodeHook) {
                    vnodeHook(vnode);
                }
                instance.isDeactivated = true;
            }, parentSuspense);
        };
        // Queue post render effect (simplified)
        function queuePostRenderEffect(fn, suspense) {
            if (suspense && suspense.pendingBranch) {
                suspense.effects.push(fn);
            }
            else {
                // Use nextTick as simple alternative
                Promise.resolve().then(() => fn());
            }
        }
        // Unmount helper
        function unmount(vnode) {
            resetShapeFlag(vnode);
            _unmount(vnode, instance, parentSuspense, true);
        }
        // Prune cache entry
        function pruneCacheEntry(key) {
            const cached = cache.get(key);
            if (current && current.key === key) {
                // Current active instance should no longer be kept-alive
                resetShapeFlag(current);
            }
            else if (cached) {
                unmount(cached);
            }
            cache.delete(key);
            keys.delete(key);
        }
        // Prune cache based on filter
        function pruneCache(filter) {
            cache.forEach((vnode, key) => {
                const name = getComponentName(vnode.type);
                if (name && (!filter || !filter(name))) {
                    pruneCacheEntry(key);
                }
            });
        }
        // Watch include/exclude changes
        watch(() => [props.include, props.exclude], ([include, exclude]) => {
            include && pruneCache(name => matches(include, name));
            exclude && pruneCache(name => !matches(exclude, name));
        }, { flush: 'post', deep: true });
        // Cache subtree after render
        let pendingCacheKey = null;
        const cacheSubtree = () => {
            if (pendingCacheKey != null) {
                cache.set(pendingCacheKey, getInnerChild(instance.subTree));
            }
        };
        onMounted(cacheSubtree);
        onUpdated(cacheSubtree);
        // Cleanup on unmount
        onBeforeUnmount(() => {
            cache.forEach(cached => {
                const { subTree, suspense } = instance;
                const vnode = getInnerChild(subTree);
                if (cached.type === vnode.type) {
                    // Current instance will be unmounted as part of keep-alive's unmount
                    resetShapeFlag(vnode);
                    // But invoke its deactivated hook here
                    const da = vnode.component.da;
                    da && queuePostRenderEffect(() => {
                        da.forEach(fn => fn());
                    }, suspense);
                    return;
                }
                unmount(cached);
            });
        });
        // Render function
        return () => {
            pendingCacheKey = null;
            if (!slots.default) {
                return null;
            }
            const children = slots.default();
            const rawVNode = children[0];
            if (!isVNode(rawVNode)) {
                return rawVNode;
            }
            // Handle multiple children
            if (children.length > 1) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('YzsKeepAlive should contain exactly one component child.');
                }
                current = null;
                return children;
            }
            if (!(rawVNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) &&
                !(rawVNode.shapeFlag & ShapeFlags.SUSPENSE)) {
                current = null;
                return rawVNode;
            }
            let vnode = getInnerChild(rawVNode);
            const comp = vnode.type;
            // Get component name for include/exclude checking
            const name = getComponentName(comp);
            const { include, exclude, max } = props;
            // Check include/exclude
            if ((include && (!name || !matches(include, name))) ||
                (exclude && name && matches(exclude, name))) {
                current = vnode;
                return rawVNode;
            }
            const key = vnode.key == null ? comp : vnode.key;
            const cachedVNode = cache.get(key);
            // Clone vnode if it's reused because we are going to mutate it
            if (vnode.el) {
                vnode = cloneVNode(vnode);
                if (rawVNode.shapeFlag & ShapeFlags.SUSPENSE) {
                    ;
                    rawVNode.ssContent = vnode;
                }
            }
            pendingCacheKey = key;
            if (cachedVNode) {
                // Copy over mounted state
                vnode.el = cachedVNode.el;
                vnode.component = cachedVNode.component;
                // Avoid vnode being mounted as fresh
                vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE;
                // Make this key the freshest (LRU)
                keys.delete(key);
                keys.add(key);
            }
            else {
                keys.add(key);
                // Prune oldest entry if max limit reached
                if (max && keys.size > parseInt(max, 10)) {
                    pruneCacheEntry(keys.values().next().value);
                }
            }
            // Avoid vnode being unmounted
            vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;
            current = vnode;
            return rawVNode;
        };
    }
});
