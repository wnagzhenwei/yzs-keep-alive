<template>
  <div id="app">
    <h1>YzsKeepAlive Test Application</h1>

    <div class="controls">
      <button @click="currentComponent = 'ComponentA'">Switch to Component A</button>
      <button @click="currentComponent = 'ComponentB'">Switch to Component B</button>
      <button @click="currentComponent = 'ComponentC'">Switch to Component C</button>
      <button @click="clearCache">Clear Cache</button>
    </div>

    <div class="cache-info">
      <p>Cache Size: {{ cacheSize }}</p>
      <p>Cached Keys: {{ cachedKeys.join(', ') || 'None' }}</p>
    </div>

    <div class="test-area">
      <YzsKeepAlive
        ref="keepAliveRef"
        :include="['ComponentA', 'ComponentB']"
        :exclude="['ComponentC']"
        :max="2"
        @activated="handleActivated"
        @deactivated="handleDeactivated"
      >
        <component :is="components[currentComponent]" :key="currentComponent" />
      </YzsKeepAlive>
    </div>

    <div class="logs">
      <h3>Event Logs:</h3>
      <div v-for="(log, index) in logs" :key="index" class="log-item">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw, onMounted } from 'vue'
import { YzsKeepAlive } from 'yzs-keep-alive-v3'
import ComponentA from './components/ComponentA.vue'
import ComponentB from './components/ComponentB.vue'
import ComponentC from './components/ComponentC.vue'

// Current component
const currentComponent = ref<'ComponentA' | 'ComponentB' | 'ComponentC'>('ComponentA')

// Component map
const components = {
  ComponentA: markRaw(ComponentA),
  ComponentB: markRaw(ComponentB),
  ComponentC: markRaw(ComponentC)
}

// KeepAlive ref
const keepAliveRef = ref<InstanceType<typeof YzsKeepAlive>>()

// Logs
const logs = ref<string[]>([])

// Add log
const addLog = (message: string) => {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
  if (logs.value.length > 10) {
    logs.value.pop()
  }
}

// Event handlers
const handleActivated = (component: any) => {
  addLog(`Component activated: ${component.name || 'Unknown'}`)
}

const handleDeactivated = (component: any) => {
  addLog(`Component deactivated: ${component.name || 'Unknown'}`)
}

// Cache info
const cacheSize = computed(() => {
  return keepAliveRef.value?.getCacheSize() || 0
})

const cachedKeys = computed(() => {
  return keepAliveRef.value?.getCachedKeys() || []
})

// Clear cache
const clearCache = () => {
  keepAliveRef.value?.clearCache()
  addLog('Cache cleared')
}

// Initialize
onMounted(() => {
  addLog('Application started')
})
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f5f5f5;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-top: 0;
}

.controls {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.controls button {
  padding: 10px 20px;
  background-color: #4a6ee0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.controls button:hover {
  background-color: #3a5ed0;
}

.cache-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border-left: 4px solid #4a6ee0;
}

.test-area {
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  padding: 20px;
  margin: 20px 0;
  min-height: 200px;
}

.logs {
  margin-top: 30px;
}

.log-item {
  padding: 10px;
  background-color: #f8f9fa;
  margin-bottom: 5px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  border-left: 3px solid #4a6ee0;
}
</style>