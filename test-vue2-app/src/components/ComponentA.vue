<template>
  <div class="component-box component-a">
    <h2>
      组件 A
      <span class="status-badge status-cached">已缓存</span>
    </h2>

    <div class="info-box">
      <p><strong>说明:</strong> 此组件始终会被缓存，因为它的名称匹配 include 模式。</p>
      <p><strong>激活次数:</strong> {{ activationCount }}</p>
      <p><strong>上次激活时间:</strong> {{ lastActivated || '从未激活' }}</p>
      <p><strong>组件状态:</strong> {{ isActive ? '活动中' : '已停用' }}</p>
    </div>

    <div class="counter-display">{{ counter }}</div>

    <div>
      <button class="btn btn-primary" @click="increment">增加计数 (+1)</button>
      <button class="btn btn-primary" @click="decrement">减少计数 (-1)</button>
      <button class="btn btn-danger" @click="reset">重置计数</button>
    </div>

    <div class="info-box" style="margin-top: 20px;">
      <p><strong>测试提示:</strong></p>
      <p>1. 点击"增加计数"按钮增加计数</p>
      <p>2. 切换到其他标签页，然后再切回来</p>
      <p>3. 如果组件被正确缓存，计数器值应该保持不变</p>
      <p>4. "激活次数"应该每次增加 1</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentA',
  data() {
    return {
      counter: 0,
      activationCount: 0,
      lastActivated: null,
      isActive: true
    }
  },
  methods: {
    increment() {
      this.counter++
      this.$emit('counter-change', { component: 'ComponentA', value: this.counter })
    },
    decrement() {
      this.counter--
      this.$emit('counter-change', { component: 'ComponentA', value: this.counter })
    },
    reset() {
      this.counter = 0
      this.$emit('counter-change', { component: 'ComponentA', value: this.counter })
    }
  },
  activated() {
    this.activationCount++
    this.lastActivated = new Date().toLocaleTimeString('zh-CN')
    this.isActive = true
    console.log('ComponentA activated')
    this.$root.$emit('component-activated', 'ComponentA')
  },
  deactivated() {
    this.isActive = false
    console.log('ComponentA deactivated')
    this.$root.$emit('component-deactivated', 'ComponentA')
  }
}
</script>
