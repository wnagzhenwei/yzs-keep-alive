// Simplified hacks for now
// In a real implementation, these would intercept router methods

export class RouterHacker {
  private router: any

  constructor(router: any) {
    this.router = router
  }

  beforeReplace(onReplace: () => void, onError?: (error: any) => void): RouterHacker {
    const originalReplace = this.router.replace
    this.router.replace = (...args: any[]) => {
      onReplace()
      try {
        return originalReplace.apply(this.router, args)
      } catch (error) {
        onError && onError(error)
        throw error
      }
    }
    return this
  }

  beforeGo(onGo: (num: number) => void): RouterHacker {
    const originalGo = this.router.go
    this.router.go = (num: number) => {
      onGo(num)
      return originalGo.call(this.router, num)
    }
    return this
  }

  beforePush(onPush: () => void): RouterHacker {
    const originalPush = this.router.push
    this.router.push = (...args: any[]) => {
      onPush()
      return originalPush.apply(this.router, args)
    }
    return this
  }
}

export function hackHistory(history: History) {
  // Simple history hack for now
  // In a real implementation, this would intercept pushState/replaceState
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = function(state: any, title: string, url?: string | null) {
    // Add custom logic here if needed
    return originalPushState.call(this, state, title, url)
  }

  history.replaceState = function(state: any, title: string, url?: string | null) {
    // Add custom logic here if needed
    return originalReplaceState.call(this, state, title, url)
  }
}