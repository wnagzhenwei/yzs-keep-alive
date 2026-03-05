<template>
  <div>
    <div class="header">
      <h1>yzs-keep-alive-v2 测试应用</h1>
      <p>Vue 2 自定义 KeepAlive 组件测试</p>
    </div>

    <div class="tab-buttons">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="{ active: currentTab === tab.name }"
        @click="switchTab(tab.name)">
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <!-- YzsKeepAlive 组件 -->
      <yzs-keep-alive
        ref="keepAlive"
        :include="includePatterns"
        :exclude="excludePatterns"
        :max="maxCache">
        <component :is="currentTab" @counter-change="handleCounterChange"></component>
      </yzs-keep-alive>
    </div>

    <div class="cache-panel">
      <h3>缓存状态</h3>
      <p><strong>缓存大小:</strong> {{ cacheSize }} / {{ maxCache }}</p>
      <p><strong>缓存模式:</strong> include={{ JSON.stringify(includePatterns) }}, exclude={{ JSON.stringify(excludePatterns) }}</p>
      <p><strong>已缓存的组件:</strong></p>
      <div class="cache-keys" v-if="cachedKeys.length > 0">
        <span class="cache-key" v-for="key in cachedKeys" :key="key">{{ key }}</span>
      </div>
      <p v-else style="color: #999; font-style: italic;">暂无缓存</p>
    </div>

    <div class="log-panel" ref="logPanel">
      <div class="log-entry" v-for="(log, index) in logs" :key="index">
        <span class="log-time">{{ log.time }}</span>
        <span :class="log.type === 'activated' ? 'log-activated' : 'log-deactivated'">
          {{ log.message }}
        </span>
      </div>
    </div>

    <div class="controls">
      <button class="btn btn-danger" @click="clearCache">清空缓存</button>
      <button class="btn btn-info" @click="showCacheInfo">显示缓存信息</button>
      <button class="btn btn-primary" @click="toggleIncludeC">切换 ComponentC 缓存</button>
      <button class="btn btn-primary" @click="changeMaxLimit">改变最大缓存数</button>
      <button class="btn" @click="clearLogs">清空日志</button>
    </div>
  </div>
</template>

<script>
import YzsKeepAlive from 'yzs-keep-alive-v2'
import ComponentA from './components/ComponentA.vue'
import ComponentB from './components/ComponentB.vue'
import ComponentC from './components/ComponentC.vue'

export default {
  name: 'App',
  components: {
    YzsKeepAlive,
    ComponentA,
    ComponentB,
    ComponentC
  },
  data() {
    return {
      currentTab: 'ComponentA',
      tabs: [
        { name: 'ComponentA', label: '组件 A (缓存)' },
        { name: 'ComponentB', label: '组件 B (缓存)' },
        { name: 'ComponentC', label: '组件 C (可选)' }
      ],
      includePatterns: ['ComponentA', 'ComponentB'],
      excludePatterns: [],
      maxCache: 3,
      cachedKeys: [],
      cacheSize: 0,
      logs: []
    }
  },
  methods: {
    switchTab(tabName) {
      this.currentTab = tabName
      this.addLog(`切换到 ${tabName}`)
    },
    updateCacheInfo() {
      if (this.$refs.keepAlive) {
        this.cachedKeys = this.$refs.keepAlive.getCachedKeys()
        this.cacheSize = this.$refs.keepAlive.getCacheSize()
      }
    },
    clearCache() {
      if (this.$refs.keepAlive) {
        this.$refs.keepAlive.clearCache()
        this.updateCacheInfo()
        this.addLog('缓存已清空')
        alert('缓存已清空！')
      }
    },
    showCacheInfo() {
      if (this.$refs.keepAlive) {
        const keys = this.$refs.keepAlive.getCachedKeys()
        const size = this.$refs.keepAlive.getCacheSize()
        alert(`缓存的组件: ${keys.join(', ') || '无'}\n缓存大小: ${size}`)
      }
    },
    toggleIncludeC() {
      const index = this.includePatterns.indexOf('ComponentC')
      if (index > -1) {
        this.includePatterns.splice(index, 1)
        this.addLog('ComponentC 已从 include 中移除 (不再缓存)')
      } else {
        this.includePatterns.push('ComponentC')
        this.addLog('ComponentC 已添加到 include (将被缓存)')
      }
    },
    changeMaxLimit() {
      this.maxCache = this.maxCache === 3 ? 2 : 3
      this.addLog(`最大缓存数已更改为: ${this.maxCache}`)
    },
    handleCounterChange(data) {
      this.addLog(`${data.component} 计数器更新: ${data.value}`)
      this.updateCacheInfo()
    },
    addLog(message) {
      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      this.logs.unshift({ time, message, type: 'info' })
      if (this.logs.length > 50) {
        this.logs.pop()
      }
    },
    addActivatedLog(component) {
      this.addLog(`${component} 被激活`)
      this.logs[0].type = 'activated'
    },
    addDeactivatedLog(component) {
      this.addLog(`${component} 被停用`)
      this.logs[0].type = 'deactivated'
    },
    clearLogs() {
      this.logs = []
    }
  },
  watch: {
    currentTab() {
      this.$nextTick(() => {
        this.updateCacheInfo()
      })
    }
  },
  mounted() {
    this.updateCacheInfo()
    this.addLog('应用已启动')

    // 监听组件的激活/停用事件
    this.$root.$on('component-activated', this.addActivatedLog)
    this.$root.$on('component-deactivated', this.addDeactivatedLog)
  },
  beforeDestroy() {
    this.$root.$off('component-activated', this.addActivatedLog)
    this.$root.$off('component-deactivated', this.addDeactivatedLog)
  }
}
</script>
