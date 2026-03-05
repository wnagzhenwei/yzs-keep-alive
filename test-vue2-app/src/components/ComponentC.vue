<template>
  <div class="component-box component-c">
    <h2>
      组件 C
      <span class="status-badge" :class="isCached ? 'status-cached' : 'status-not-cached'">
        {{ isCached ? '已缓存' : '未缓存' }}
      </span>
    </h2>

    <div class="info-box">
      <p><strong>说明:</strong> 此组件的缓存状态取决于 include 配置。</p>
      <p><strong>当前配置:</strong> {{ isCached ? '在 include 列表中' : '不在 include 列表中' }}</p>
      <p v-if="isCached"><strong>激活次数:</strong> {{ activationCount }}</p>
      <p v-if="isCached"><strong>上次激活时间:</strong> {{ lastActivated || '从未激活' }}</p>
      <p><strong>提示:</strong> 点击下方的"切换 ComponentC 缓存"按钮来改变缓存行为</p>
    </div>

    <div class="counter-display">{{ counter }}</div>

    <div>
      <button class="btn btn-primary" @click="increment">增加计数 (+1)</button>
      <button class="btn btn-primary" @click="decrement">减少计数 (-1)</button>
      <button class="btn btn-danger" @click="reset">重置计数</button>
    </div>

    <div class="info-box" style="margin-top: 20px;">
      <p><strong>缓存行为测试:</strong></p>
      <p v-if="isCached">
        ✅ 组件被缓存 - 切换标签页后计数器值会保持
      </p>
      <p v-else>
        ❌ 组件不被缓存 - 每次切换到此标签页计数器会重置为 0
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentC',
  data() {
    return {
      counter: 0,
      activationCount: 0,
      lastActivated: null,
      isCached: false
    }
  },
  mounted() {
    // 检查是否在 include 列表中
    // 这是一个简化检查，实际中可以通过 props 或其他方式获取
    this.checkCachedStatus()
  },
  methods: {
    increment() {
      this.counter++
      this.$emit('counter-change', { component: 'ComponentC', value: this.counter })
    },
    decrement() {
      this.counter--
      this.$emit('counter-change', { component: 'ComponentC', value: this.counter })
    },
    reset() {
      this.counter = 0
      this.$emit('counter-change', { component: 'ComponentC', value: this.counter })
    },
    checkCachedStatus() {
      // 通过检查 keepAlive 属性来判断是否被缓存
      // Vue 2 会在 render 时设置这个属性
      this.isCached = this.$vnode?.data?.keepAlive === true
    }
  },
  activated() {
    this.activationCount++
    this.lastActivated = new Date().toLocaleTimeString('zh-CN')
    this.isCached = true
    console.log('ComponentC activated')
    this.$root.$emit('component-activated', 'ComponentC')
  },
  deactivated() {
    console.log('ComponentC deactivated')
    this.$root.$emit('component-deactivated', 'ComponentC')
  }
}
</script>
