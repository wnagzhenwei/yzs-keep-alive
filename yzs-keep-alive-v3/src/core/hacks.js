// Simplified hacks for now
// In a real implementation, these would intercept router methods
export class RouterHacker {
    constructor(router) {
        Object.defineProperty(this, "router", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.router = router;
    }
    beforeReplace(onReplace, onError) {
        const originalReplace = this.router.replace;
        this.router.replace = (...args) => {
            onReplace();
            try {
                return originalReplace.apply(this.router, args);
            }
            catch (error) {
                onError && onError(error);
                throw error;
            }
        };
        return this;
    }
    beforeGo(onGo) {
        const originalGo = this.router.go;
        this.router.go = (num) => {
            onGo(num);
            return originalGo.call(this.router, num);
        };
        return this;
    }
    beforePush(onPush) {
        const originalPush = this.router.push;
        this.router.push = (...args) => {
            onPush();
            return originalPush.apply(this.router, args);
        };
        return this;
    }
}
export function hackHistory(history) {
    // Simple history hack for now
    // In a real implementation, this would intercept pushState/replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (state, title, url) {
        // Add custom logic here if needed
        return originalPushState.call(this, state, title, url);
    };
    history.replaceState = function (state, title, url) {
        // Add custom logic here if needed
        return originalReplaceState.call(this, state, title, url);
    };
}
