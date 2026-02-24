export class HistoryStack {
  private historyStackMap: any[][] = []
  private destroyCache: (vm: any) => void

  constructor(destroyCache: (vm: any) => void) {
    this.destroyCache = destroyCache
  }

  push(vm: any, index: number) {
    const stack = this.historyStackMap[index]
    if (Array.isArray(stack)) {
      !stack.includes(vm) && stack.push(vm)
      this.historyStackMap[index] = stack.filter((item) => !item._isDestroyed)
    } else {
      const vms: any[] = []
      vms.push(vm)
      this.historyStackMap[index] = vms
    }
  }

  pop(onlyLastOne: boolean = false) {
    const last = this.historyStackMap.pop()
    if (Array.isArray(last)) {
      if (onlyLastOne) {
        const vm = last.pop()
        vm && this.destroyCache(vm)
      } else {
        last.forEach((vm) => vm && this.destroyCache(vm))
      }
    }
  }

  removeGreater(index: number) {
    while (this.historyStackMap.length >= index) {
      this.pop()
    }
  }

  clear() {
    this.historyStackMap = []
  }
}