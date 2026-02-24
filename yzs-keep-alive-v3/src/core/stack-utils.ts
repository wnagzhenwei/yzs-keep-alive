import type { Router } from 'vue-router'

// Shape flags (from Vue internals)
export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = (1 << 1) | (1 << 2)
}

export const isDef = function (v: any): boolean {
  return v !== undefined && v !== null
}

const PLACEHOLDER_VM = {
  __placeholder: true,
}

export const currentPathOf = function (router: Router): string {
  return router.currentRoute.value.path
}

export const resolvePushedVm = function (current: any) {
  return isDef(current) ? current : PLACEHOLDER_VM
}

export const isPlaceHolderVm = (vm: any): boolean => vm && !!vm.__placeholder

export const getStateId = function (): number | undefined {
  const state = getCurrentState()
  return isDef(state) ? state.id : undefined
}

export const getStateForward = function (): string | undefined {
  const state = getCurrentState()
  return isDef(state) ? state.forward : undefined
}

export const getQuery = function (params: Record<string, any>): string {
  let query = ''
  query = Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  if (query.length > 0) {
    query = `?${query}`
  }
  return query
}

const getCurrentState = function (): any {
  return history.state
}

export const genKey = function (num: number, router: Router, routeTo: string | null = null): string {
  return `keep-alive-vnode-key-${Number(num)}-${routeTo ? routeTo : currentPathOf(router)}`
}

export const genSingletonKey = function (router: Router, routeTo: string | null = null): string {
  return `keep-alive-vnode-key-singleton-${routeTo ? routeTo : currentPathOf(router)}`
}

export const isSingletonNode = function (vnode: any): boolean {
  return vnode && vnode.key && vnode.key.startsWith('keep-alive-vnode-key-singleton-')
}

export const getCurrentVM = function (router: Router): any {
  return router?.currentRoute?.value?.matched?.length > 0
    ? router.currentRoute.value.matched[0].instances?.default?.$
    : undefined
}

export const setCurrentVnodeKey = function (router: Router, key: string) {
  const current = getCurrentVM(router)
  if (current && current.vnode) {
    current.vnode.key = key
  }
}

export const replaceState = function (mode: string, router: Router, id: number) {
  const { pathname, search, hash } = window.location
  let path = `${pathname}${search}${hash}`
  let state = isDef(history.state) ? history.state : {}
  state['id'] = id
  // Optimize file:// URL
  const isFilSys = window.location.href.startsWith('file://')
  history.replaceState(state, '', isFilSys ? null : path)
}

export const inBrowser = typeof window !== 'undefined'

export const isKeepAlive = (vnode: any): boolean => vnode.type.__isKeepAlive

export function isSameVNodeType(n1: any, n2: any): boolean {
  if (process.env.NODE_ENV !== 'production' && n2.shapeFlag & ShapeFlags.COMPONENT) {
    // HMR only: if the component has been hot-updated, force a reload
    return false
  }
  return n1.type === n2.type && n1.key === n2.key
}