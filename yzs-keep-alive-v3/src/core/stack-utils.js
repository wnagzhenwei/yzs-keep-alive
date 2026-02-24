// Shape flags (from Vue internals)
export var ShapeFlags;
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
export const isDef = function (v) {
    return v !== undefined && v !== null;
};
const PLACEHOLDER_VM = {
    __placeholder: true,
};
export const currentPathOf = function (router) {
    return router.currentRoute.value.path;
};
export const resolvePushedVm = function (current) {
    return isDef(current) ? current : PLACEHOLDER_VM;
};
export const isPlaceHolderVm = (vm) => vm && !!vm.__placeholder;
export const getStateId = function () {
    const state = getCurrentState();
    return isDef(state) ? state.id : undefined;
};
export const getStateForward = function () {
    const state = getCurrentState();
    return isDef(state) ? state.forward : undefined;
};
export const getQuery = function (params) {
    let query = '';
    query = Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    if (query.length > 0) {
        query = `?${query}`;
    }
    return query;
};
const getCurrentState = function () {
    return history.state;
};
export const genKey = function (num, router, routeTo = null) {
    return `keep-alive-vnode-key-${Number(num)}-${routeTo ? routeTo : currentPathOf(router)}`;
};
export const genSingletonKey = function (router, routeTo = null) {
    return `keep-alive-vnode-key-singleton-${routeTo ? routeTo : currentPathOf(router)}`;
};
export const isSingletonNode = function (vnode) {
    return vnode && vnode.key && vnode.key.startsWith('keep-alive-vnode-key-singleton-');
};
export const getCurrentVM = function (router) {
    return router?.currentRoute?.value?.matched?.length > 0
        ? router.currentRoute.value.matched[0].instances?.default?.$
        : undefined;
};
export const setCurrentVnodeKey = function (router, key) {
    const current = getCurrentVM(router);
    if (current && current.vnode) {
        current.vnode.key = key;
    }
};
export const replaceState = function (mode, router, id) {
    const { pathname, search, hash } = window.location;
    let path = `${pathname}${search}${hash}`;
    let state = isDef(history.state) ? history.state : {};
    state['id'] = id;
    // Optimize file:// URL
    const isFilSys = window.location.href.startsWith('file://');
    history.replaceState(state, '', isFilSys ? null : path);
};
export const inBrowser = typeof window !== 'undefined';
export const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
export function isSameVNodeType(n1, n2) {
    if (process.env.NODE_ENV !== 'production' && n2.shapeFlag & ShapeFlags.COMPONENT) {
        // HMR only: if the component has been hot-updated, force a reload
        return false;
    }
    return n1.type === n2.type && n1.key === n2.key;
}
