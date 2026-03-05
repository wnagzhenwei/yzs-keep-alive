<template>
  <div class="component-box component-b">
    <h2>
      组件 B
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
      <p>1. 在组件 A 和 B 之间切换</p>
      <p>2. 两个组件的计数器都应该各自保持状态</p>
      <p>3. 验证 LRU 缓存策略是否正确工作</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentB',
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
      this.$emit('counter-change', { component: 'ComponentB', value: this.counter })
    },
    decrement() {
      this.counter--
      this.$emit('counter-change', { component: 'ComponentB', value: this.counter })
    },
    reset() {
      this.counter = 0
      this.$emit('counter-change', { component: 'ComponentB', value: this.counter })
    }
  },
  activated() {
    this.activationCount++
    this.lastActivated = new Date().toLocaleTimeString('zh-CN')
    this.isActive = true
    console.log('ComponentB activated')
    this.$root.$emit('component-activated', 'ComponentB')
  },
  deactivated() {
    this.isActive = false
    console.log('ComponentB deactivated')
    this.$root.$emit('component-deactivated', 'ComponentB')
  }
}
</script>
