import type { Router } from 'vue-router'
import { nextTick } from 'vue'
import { HistoryStack } from './history-stack'
import {
  isDef,
  getStateId,
  resolvePushedVm,
  genKey,
  genSingletonKey,
  isPlaceHolderVm,
  replaceState,
  currentPathOf,
  getStateForward,
  isSingletonNode,
  getCurrentVM
} from './stack-utils'
import { hackHistory, RouterHacker } from './hacks'

// StackCore options interface
export interface StackCoreOptions {
  router: Router
  pruneCacheEntry: (key: string) => void
  replaceStay?: string[]
  singleton?: string[]
}

// Single instance pattern
let _core: StackCore | null = null

export class StackCore {
  private destroyCaches: (key: string) => void
  private router: Router
  private mode: 'hash' | 'history' | 'abstract'
  private historyShouldChange: boolean = false
  private isReplace: boolean = false
  private replacePrePath?: string
  private preStateId: number = 0
  private pre: any = null
  private replaceStay: string[] = []
  private singleton: string[] = []
  private _initial: boolean = true
  private historyStack: HistoryStack
  private _routeTo?: string
  private _hackRouter?: RouterHacker

  // Singleton instance
  static getInstance(options?: StackCoreOptions): StackCore {
    if (!_core) {
      _core = new StackCore()
    }
    if (options) {
      _core.setup(options)
    }
    return _core
  }

  constructor() {
    // Initialize with defaults
    this.destroyCaches = () => {}
    this.router = {} as Router
    this.mode = 'hash'
    this.historyStack = new HistoryStack((vm: any) => {
      if (vm && vm.vnode.key && !isSingletonNode(vm.vnode)) {
        this.destroyCaches(vm.vnode.key)
      }
    })
  }

  setup({ router, pruneCacheEntry, replaceStay, singleton }: StackCoreOptions) {
    // Hack history API
    hackHistory(history)

    this.destroyCaches = pruneCacheEntry
    this.router = router
    this.router._stack = 0
    this.mode = router.mode as 'hash' | 'history' | 'abstract'
    this.historyShouldChange = false
    this.isReplace = false
    this.replacePrePath = undefined
    this.preStateId = 0
    this.pre = null
    this.replaceStay = replaceStay || []
    this.singleton = singleton || []
    this._initial = true

    this.historyStack = new HistoryStack((vm: any) => {
      if (vm && vm.vnode.key && !isSingletonNode(vm.vnode)) {
        this.destroyCaches(vm.vnode.key)
      }
    })

    this.init()

    // Expose core on router for debugging
    this.router.__core = this
    this._routeTo = undefined
  }

  // Check if currently going back
  get isBacking(): boolean {
    return !(this.isPush || this.isReplace)
  }

  get isPush(): boolean {
    if (!this.isReplace) {
      const stateId = getStateId()
      const v = !isDef(stateId) || this.preStateId <= stateId
      return v
    }
    return false
  }

  get stackPointer(): number {
    return (this.router as any)._stack || 0
  }

  set stackPointer(val: number) {
    ;(this.router as any)._stack = val
  }

  private init() {
    this.initStackPointer()
    this.routerHooks()
    this.hackRouter()
  }

  private initStackPointer() {
    const currentStateId = getStateId()
    if (isDef(currentStateId)) {
      this.setStackPointer(currentStateId)
    } else {
      this.setState(0)
    }
  }

  // Fix for first time initial render with path like "/"
  genInitialKeyNextTime() {
    this._initial = true
  }

  // Generate key for vnode based on stack state
  genKeyForVnode(): string {
    const { router } = this

    const _genKey = (num: number, router: Router, to?: string) => {
      return (to && this.singleton.includes(to))
        ? genSingletonKey(router, to)
        : genKey(num, router, to)
    }

    if (this.isReplace || this._initial) {
      this._initial = false
      return _genKey(this.stackPointer, router, this._routeTo)
    } else if (this.isPush) {
      return _genKey(this.stackPointer + 1, router, this._routeTo)
    } else {
      return _genKey(this.stackPointer - 1, router, this._routeTo)
    }
  }

  // Setup router hooks
  private routerHooks() {
    const { router } = this

    router.beforeEach((to, from, next) => {
      if (this.singleton.includes(to.path) && to.path === from.path) {
        console.warn('警告 [stack-keep-alive]: 单例模式的页面不支持从自身重复路由')
        console.warn('warning [stack-keep-alive]: the singleton component doesn`t support route to from itself')
        return
      }
      this._routeTo = to.path
      next()
    })

    router.afterEach((to, from) => {
      this.historyShouldChange = true

      // Get the vm instance after render
      nextTick(() => {
        const current = this.currentVm
        const pendingToPushVm = resolvePushedVm(current)

        if (this.pre === null) {
          this.onInitial(pendingToPushVm)
        } else if (this.isReplace) {
          this.onReplace(pendingToPushVm)
        } else if (this.isPush) {
          this.onPush(pendingToPushVm)
        } else {
          this.onBack(pendingToPushVm)
        }

        this.pre = current
        this.preStateId = this.stackPointer

        if (!isPlaceHolderVm(pendingToPushVm)) {
          this.historyShouldChange = false
        }
      })
    })
  }

  // Hack router to detect replace, go, and push operations
  private hackRouter() {
    this._hackRouter = new RouterHacker(this.router)
    this._hackRouter
      .beforeReplace(() => {
        this.isReplace = true
        this.replacePrePath = currentPathOf(this.router)
      }, (e: any) => {
        this.isReplace = false
        this.replacePrePath = undefined
      })
      .beforeGo((num: number) => {
        this.isReplace = false
      })
      .beforePush(() => {
        this.isReplace = false
      })
  }

  private onInitial(vm: any) {
    this.historyStack.push(vm, this.stackPointer)
  }

  private onPush(vm: any) {
    this.setState(this.increaseStackPointer())
    this.historyStack.push(vm, this.stackPointer)
    this.pre?.$clearParent?.(vm)
    this.pre = null
  }

  private onBack(vm: any) {
    this.historyStack.pop()
    this.decreaseStackPointer()
    this.historyStack.push(vm, this.stackPointer)
  }

  private onReplace(vm: any) {
    // Avoid replace query issue: router.replace only a query by same path
    const avoidReplaceQuery = this.replacePrePath === currentPathOf(this.router)
    const shouldDestroy =
      !(isDef(this.replacePrePath) && this.replaceStay.includes(this.replacePrePath))
      &&
      !avoidReplaceQuery

    if (shouldDestroy) {
      this.historyStack.pop(true)
    } else if (!avoidReplaceQuery) {
      // this.pre?.$clearParent?.(vm)
    }

    this.pre = null
    this.setState(this.stackPointer)
    this.historyStack.push(vm, this.stackPointer)
    this.isReplace = false
    this.replacePrePath = undefined
  }

  get currentVm() {
    return getCurrentVM(this.router)
  }

  private setStackPointer(val: number) {
    this.stackPointer = val
  }

  private setState(id: number) {
    this.setStackPointer(id)
    replaceState(this.mode, this.router, id)
  }

  private increaseStackPointer(): number {
    return (this.stackPointer += 1)
  }

  private decreaseStackPointer(): number {
    return (this.stackPointer -= 1)
  }
}