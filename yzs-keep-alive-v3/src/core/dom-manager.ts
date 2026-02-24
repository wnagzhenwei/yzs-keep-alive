import type { DOMManager } from '../types'

/**
 * DOM管理器实现
 */
export class DOMManagerImpl implements DOMManager {
  // 容器样式
  private static readonly CONTAINER_STYLE = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    overflow: 'auto',
    visibility: 'visible' as const
  }

  private static readonly HIDDEN_STYLE = {
    ...this.CONTAINER_STYLE,
    display: 'none',
    visibility: 'hidden' as const
  }

  /**
   * 创建容器
   */
  createContainer(parent: HTMLElement): HTMLElement {
    const container = document.createElement('div')

    // 应用基础样式
    Object.assign(container.style, DOMManagerImpl.CONTAINER_STYLE)

    // 添加到父元素
    parent.appendChild(container)

    return container
  }

  /**
   * 隐藏容器
   */
  hideContainer(container: HTMLElement): void {
    Object.assign(container.style, DOMManagerImpl.HIDDEN_STYLE)

    // 保存当前滚动位置
    const scrollState = {
      scrollTop: container.scrollTop,
      scrollLeft: container.scrollLeft
    }
    ;(container as any).__keepalive_scroll = scrollState

    // 暂停内部动画和视频
    this.pauseMediaElements(container)

    // 触发不可见事件
    container.dispatchEvent(new CustomEvent('keepalive:hide'))
  }

  /**
   * 显示容器
   */
  showContainer(container: HTMLElement): void {
    // 恢复基础样式
    Object.assign(container.style, DOMManagerImpl.CONTAINER_STYLE)

    // 恢复滚动位置
    const scrollState = (container as any).__keepalive_scroll
    if (scrollState) {
      container.scrollTop = scrollState.scrollTop
      container.scrollLeft = scrollState.scrollLeft
    }

    // 恢复内部动画和视频
    this.resumeMediaElements(container)

    // 触发可见事件
    container.dispatchEvent(new CustomEvent('keepalive:show'))
  }

  /**
   * 移除容器
   */
  removeContainer(container: HTMLElement): void {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }

  /**
   * 暂停容器内的媒体元素
   */
  private pauseMediaElements(container: HTMLElement): void {
    // 视频
    const videos = container.querySelectorAll('video')
    videos.forEach(video => {
      if (!video.paused) {
        video.pause()
        ;(video as any).__keepalive_wasPlaying = true
      }
    })

    // 音频
    const audios = container.querySelectorAll('audio')
    audios.forEach(audio => {
      if (!audio.paused) {
        audio.pause()
        ;(audio as any).__keepalive_wasPlaying = true
      }
    })

    // 动画
    const animations = container.querySelectorAll('*[style*="animation"]')
    animations.forEach(el => {
      const style = window.getComputedStyle(el)
      const animation = style.animationName
      if (animation && animation !== 'none') {
        ;(el as any).__keepalive_animation = style.animation
        el.style.animation = 'none'
      }
    })
  }

  /**
   * 恢复容器内的媒体元素
   */
  private resumeMediaElements(container: HTMLElement): void {
    // 视频
    const videos = container.querySelectorAll('video')
    videos.forEach(video => {
      if ((video as any).__keepalive_wasPlaying) {
        video.play().catch(() => {})
        delete (video as any).__keepalive_wasPlaying
      }
    })

    // 音频
    const audios = container.querySelectorAll('audio')
    audios.forEach(audio => {
      if ((audio as any).__keepalive_wasPlaying) {
        audio.play().catch(() => {})
        delete (audio as any).__keepalive_wasPlaying
      }
    })

    // 动画
    const animations = container.querySelectorAll('*[style*="animation"]')
    animations.forEach(el => {
      if ((el as any).__keepalive_animation) {
        el.style.animation = (el as any).__keepalive_animation
        delete (el as any).__keepalive_animation
      }
    })
  }

  /**
   * 获取容器内的所有输入元素状态
   */
  saveFormState(container: HTMLElement): Record<string, any> {
    const state: Record<string, any> = {}

    // 输入框
    const inputs = container.querySelectorAll('input, textarea, select')
    inputs.forEach((input, index) => {
      const id = input.id || input.name || `input_${index}`
      if (input instanceof HTMLInputElement) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          state[id] = input.checked
        } else {
          state[id] = input.value
        }
      } else if (input instanceof HTMLTextAreaElement) {
        state[id] = input.value
      } else if (input instanceof HTMLSelectElement) {
        state[id] = input.value
      }
    })

    return state
  }

  /**
   * 恢复容器内的表单元素状态
   */
  restoreFormState(container: HTMLElement, state: Record<string, any>): void {
    for (const [id, value] of Object.entries(state)) {
      const element = container.querySelector(`#${id}`) ||
                     container.querySelector(`[name="${id}"]`)

      if (!element) continue

      if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = Boolean(value)
        } else {
          element.value = String(value)
        }
      } else if (element instanceof HTMLTextAreaElement) {
        element.value = String(value)
      } else if (element instanceof HTMLSelectElement) {
        element.value = String(value)
      }
    }
  }
}

/**
 * 创建DOM管理器
 */
export function createDOMManager(): DOMManager {
  return new DOMManagerImpl()
}