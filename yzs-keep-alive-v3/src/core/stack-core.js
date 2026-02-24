import { nextTick } from 'vue';
import { HistoryStack } from './history-stack';
import { isDef, getStateId, resolvePushedVm, genKey, genSingletonKey, isPlaceHolderVm, replaceState, currentPathOf, isSingletonNode, getCurrentVM } from './stack-utils';
import { hackHistory, RouterHacker } from './hacks';
// Single instance pattern
let _core = null;
export class StackCore {
    // Singleton instance
    static getInstance(options) {
        if (!_core) {
            _core = new StackCore();
        }
        if (options) {
            _core.setup(options);
        }
        return _core;
    }
    constructor() {
        Object.defineProperty(this, "destroyCaches", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "router", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "historyShouldChange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isReplace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "replacePrePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "preStateId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "pre", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "replaceStay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "singleton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_initial", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "historyStack", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_routeTo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_hackRouter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Initialize with defaults
        this.destroyCaches = () => { };
        this.router = {};
        this.mode = 'hash';
        this.historyStack = new HistoryStack((vm) => {
            if (vm && vm.vnode.key && !isSingletonNode(vm.vnode)) {
                this.destroyCaches(vm.vnode.key);
            }
        });
    }
    setup({ router, pruneCacheEntry, replaceStay, singleton }) {
        // Hack history API
        hackHistory(history);
        this.destroyCaches = pruneCacheEntry;
        this.router = router;
        this.router._stack = 0;
        this.mode = router.mode;
        this.historyShouldChange = false;
        this.isReplace = false;
        this.replacePrePath = undefined;
        this.preStateId = 0;
        this.pre = null;
        this.replaceStay = replaceStay || [];
        this.singleton = singleton || [];
        this._initial = true;
        this.historyStack = new HistoryStack((vm) => {
            if (vm && vm.vnode.key && !isSingletonNode(vm.vnode)) {
                this.destroyCaches(vm.vnode.key);
            }
        });
        this.init();
        // Expose core on router for debugging
        this.router.__core = this;
        this._routeTo = undefined;
    }
    // Check if currently going back
    get isBacking() {
        return !(this.isPush || this.isReplace);
    }
    get isPush() {
        if (!this.isReplace) {
            const stateId = getStateId();
            const v = !isDef(stateId) || this.preStateId <= stateId;
            return v;
        }
        return false;
    }
    get stackPointer() {
        return this.router._stack || 0;
    }
    set stackPointer(val) {
        ;
        this.router._stack = val;
    }
    init() {
        this.initStackPointer();
        this.routerHooks();
        this.hackRouter();
    }
    initStackPointer() {
        const currentStateId = getStateId();
        if (isDef(currentStateId)) {
            this.setStackPointer(currentStateId);
        }
        else {
            this.setState(0);
        }
    }
    // Fix for first time initial render with path like "/"
    genInitialKeyNextTime() {
        this._initial = true;
    }
    // Generate key for vnode based on stack state
    genKeyForVnode() {
        const { router } = this;
        const _genKey = (num, router, to) => {
            return (to && this.singleton.includes(to))
                ? genSingletonKey(router, to)
                : genKey(num, router, to);
        };
        if (this.isReplace || this._initial) {
            this._initial = false;
            return _genKey(this.stackPointer, router, this._routeTo);
        }
        else if (this.isPush) {
            return _genKey(this.stackPointer + 1, router, this._routeTo);
        }
        else {
            return _genKey(this.stackPointer - 1, router, this._routeTo);
        }
    }
    // Setup router hooks
    routerHooks() {
        const { router } = this;
        router.beforeEach((to, from, next) => {
            if (this.singleton.includes(to.path) && to.path === from.path) {
                console.warn('警告 [stack-keep-alive]: 单例模式的页面不支持从自身重复路由');
                console.warn('warning [stack-keep-alive]: the singleton component doesn`t support route to from itself');
                return;
            }
            this._routeTo = to.path;
            next();
        });
        router.afterEach((to, from) => {
            this.historyShouldChange = true;
            // Get the vm instance after render
            nextTick(() => {
                const current = this.currentVm;
                const pendingToPushVm = resolvePushedVm(current);
                if (this.pre === null) {
                    this.onInitial(pendingToPushVm);
                }
                else if (this.isReplace) {
                    this.onReplace(pendingToPushVm);
                }
                else if (this.isPush) {
                    this.onPush(pendingToPushVm);
                }
                else {
                    this.onBack(pendingToPushVm);
                }
                this.pre = current;
                this.preStateId = this.stackPointer;
                if (!isPlaceHolderVm(pendingToPushVm)) {
                    this.historyShouldChange = false;
                }
            });
        });
    }
    // Hack router to detect replace, go, and push operations
    hackRouter() {
        this._hackRouter = new RouterHacker(this.router);
        this._hackRouter
            .beforeReplace(() => {
            this.isReplace = true;
            this.replacePrePath = currentPathOf(this.router);
        }, (e) => {
            this.isReplace = false;
            this.replacePrePath = undefined;
        })
            .beforeGo((num) => {
            this.isReplace = false;
        })
            .beforePush(() => {
            this.isReplace = false;
        });
    }
    onInitial(vm) {
        this.historyStack.push(vm, this.stackPointer);
    }
    onPush(vm) {
        this.setState(this.increaseStackPointer());
        this.historyStack.push(vm, this.stackPointer);
        this.pre?.$clearParent?.(vm);
        this.pre = null;
    }
    onBack(vm) {
        this.historyStack.pop();
        this.decreaseStackPointer();
        this.historyStack.push(vm, this.stackPointer);
    }
    onReplace(vm) {
        // Avoid replace query issue: router.replace only a query by same path
        const avoidReplaceQuery = this.replacePrePath === currentPathOf(this.router);
        const shouldDestroy = !(isDef(this.replacePrePath) && this.replaceStay.includes(this.replacePrePath))
            &&
                !avoidReplaceQuery;
        if (shouldDestroy) {
            this.historyStack.pop(true);
        }
        else if (!avoidReplaceQuery) {
            // this.pre?.$clearParent?.(vm)
        }
        this.pre = null;
        this.setState(this.stackPointer);
        this.historyStack.push(vm, this.stackPointer);
        this.isReplace = false;
        this.replacePrePath = undefined;
    }
    get currentVm() {
        return getCurrentVM(this.router);
    }
    setStackPointer(val) {
        this.stackPointer = val;
    }
    setState(id) {
        this.setStackPointer(id);
        replaceState(this.mode, this.router, id);
    }
    increaseStackPointer() {
        return (this.stackPointer += 1);
    }
    decreaseStackPointer() {
        return (this.stackPointer -= 1);
    }
}
