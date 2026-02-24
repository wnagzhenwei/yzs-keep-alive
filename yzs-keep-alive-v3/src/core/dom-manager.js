var _a;
/**
 * DOM管理器实现
 */
export class DOMManagerImpl {
    /**
     * 创建容器
     */
    createContainer(parent) {
        const container = document.createElement('div');
        // 应用基础样式
        Object.assign(container.style, _a.CONTAINER_STYLE);
        // 添加到父元素
        parent.appendChild(container);
        return container;
    }
    /**
     * 隐藏容器
     */
    hideContainer(container) {
        Object.assign(container.style, _a.HIDDEN_STYLE);
        // 保存当前滚动位置
        const scrollState = {
            scrollTop: container.scrollTop,
            scrollLeft: container.scrollLeft
        };
        container.__keepalive_scroll = scrollState;
        // 暂停内部动画和视频
        this.pauseMediaElements(container);
        // 触发不可见事件
        container.dispatchEvent(new CustomEvent('keepalive:hide'));
    }
    /**
     * 显示容器
     */
    showContainer(container) {
        // 恢复基础样式
        Object.assign(container.style, _a.CONTAINER_STYLE);
        // 恢复滚动位置
        const scrollState = container.__keepalive_scroll;
        if (scrollState) {
            container.scrollTop = scrollState.scrollTop;
            container.scrollLeft = scrollState.scrollLeft;
        }
        // 恢复内部动画和视频
        this.resumeMediaElements(container);
        // 触发可见事件
        container.dispatchEvent(new CustomEvent('keepalive:show'));
    }
    /**
     * 移除容器
     */
    removeContainer(container) {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
    /**
     * 暂停容器内的媒体元素
     */
    pauseMediaElements(container) {
        // 视频
        const videos = container.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
                video.__keepalive_wasPlaying = true;
            }
        });
        // 音频
        const audios = container.querySelectorAll('audio');
        audios.forEach(audio => {
            if (!audio.paused) {
                audio.pause();
                audio.__keepalive_wasPlaying = true;
            }
        });
        // 动画
        const animations = container.querySelectorAll('*[style*="animation"]');
        animations.forEach(el => {
            const style = window.getComputedStyle(el);
            const animation = style.animationName;
            if (animation && animation !== 'none') {
                ;
                el.__keepalive_animation = style.animation;
                el.style.animation = 'none';
            }
        });
    }
    /**
     * 恢复容器内的媒体元素
     */
    resumeMediaElements(container) {
        // 视频
        const videos = container.querySelectorAll('video');
        videos.forEach(video => {
            if (video.__keepalive_wasPlaying) {
                video.play().catch(() => { });
                delete video.__keepalive_wasPlaying;
            }
        });
        // 音频
        const audios = container.querySelectorAll('audio');
        audios.forEach(audio => {
            if (audio.__keepalive_wasPlaying) {
                audio.play().catch(() => { });
                delete audio.__keepalive_wasPlaying;
            }
        });
        // 动画
        const animations = container.querySelectorAll('*[style*="animation"]');
        animations.forEach(el => {
            if (el.__keepalive_animation) {
                el.style.animation = el.__keepalive_animation;
                delete el.__keepalive_animation;
            }
        });
    }
    /**
     * 获取容器内的所有输入元素状态
     */
    saveFormState(container) {
        const state = {};
        // 输入框
        const inputs = container.querySelectorAll('input, textarea, select');
        inputs.forEach((input, index) => {
            const id = input.id || input.name || `input_${index}`;
            if (input instanceof HTMLInputElement) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    state[id] = input.checked;
                }
                else {
                    state[id] = input.value;
                }
            }
            else if (input instanceof HTMLTextAreaElement) {
                state[id] = input.value;
            }
            else if (input instanceof HTMLSelectElement) {
                state[id] = input.value;
            }
        });
        return state;
    }
    /**
     * 恢复容器内的表单元素状态
     */
    restoreFormState(container, state) {
        for (const [id, value] of Object.entries(state)) {
            const element = container.querySelector(`#${id}`) ||
                container.querySelector(`[name="${id}"]`);
            if (!element)
                continue;
            if (element instanceof HTMLInputElement) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = Boolean(value);
                }
                else {
                    element.value = String(value);
                }
            }
            else if (element instanceof HTMLTextAreaElement) {
                element.value = String(value);
            }
            else if (element instanceof HTMLSelectElement) {
                element.value = String(value);
            }
        }
    }
}
_a = DOMManagerImpl;
// 容器样式
Object.defineProperty(DOMManagerImpl, "CONTAINER_STYLE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        visibility: 'visible'
    }
});
Object.defineProperty(DOMManagerImpl, "HIDDEN_STYLE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        ..._a.CONTAINER_STYLE,
        display: 'none',
        visibility: 'hidden'
    }
});
/**
 * 创建DOM管理器
 */
export function createDOMManager() {
    return new DOMManagerImpl();
}
