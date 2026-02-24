// Vue internal types for stack-keep-alive implementation
declare module 'vue' {
  interface ComponentInternalInstance {
    ctx: {
      renderer?: {
        p: Function // patch
        m: Function // move
        um: Function // unmount
        o: {
          createElement: (tag: string) => HTMLElement
        }
      }
      activate?: Function
      deactivate?: Function
    }
    suspense?: any
    subTree: any
    vnode: any
  }

  interface VNode {
    component?: ComponentInternalInstance
    el?: HTMLElement
    shapeFlag: number
    key?: string | number | symbol
    type: any
    props?: any
    ssContent?: VNode
  }
}