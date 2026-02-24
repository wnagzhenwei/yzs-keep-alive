<template>
  <div id="app">
    <h1>YzsKeepAlive State Cache Test</h1>

    <div class="controls">
      <button @click="currentComponent = 'StateTestA'">Switch to Component A</button>
      <button @click="currentComponent = 'StateTestB'">Switch to Component B</button>
      <button @click="currentComponent = 'StateTestC'">Switch to Component C</button>
      <button @click="clearCache">Clear Cache</button>
      <button @click="forceUpdate">Force Update</button>
    </div>

    <div class="cache-info">
      <p>Cache Size: {{ cacheSize }}</p>
      <p>Cached Keys: {{ cachedKeys.join(', ') || 'None' }}</p>
      <p>Current Component: {{ currentComponent }}</p>
    </div>

    <div class="test-instructions">
      <h3>Test Instructions:</h3>
      <ol>
        <li>Switch between components using the buttons above</li>
        <li>Modify state in each component (increment count, change inputs, etc.)</li>
        <li>Switch away and back to verify state is preserved</li>
        <li>Check console logs for activation/deactivation events</li>
        <li>Use "Clear Cache" to reset the cache</li>
      </ol>
    </div>

    <div class="test-area">
      <YzsKeepAlive
        ref="keepAliveRef"
        :max="3"
        @activated="handleActivated"
        @deactivated="handleDeactivated"
      >
        <component :is="components[currentComponent]" :name="currentComponent" :key="currentComponent" />
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
import StateTestComponent from './components/StateTestComponent.vue'

// Current component
const currentComponent = ref<'StateTestA' | 'StateTestB' | 'StateTestC'>('StateTestA')

// Component map
const components = {
  StateTestA: markRaw(StateTestComponent),
  StateTestB: markRaw(StateTestComponent),
  StateTestC: markRaw(StateTestComponent)
}

// KeepAlive ref
const keepAliveRef = ref<InstanceType<typeof YzsKeepAlive>>()

// Logs
const logs = ref<string[]>([])

// Add log
const addLog = (message: string) => {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
  if (logs.value.length > 20) {
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

// Force update (re-render current component)
const forceUpdate = () => {
  const temp = currentComponent.value
  currentComponent.value = 'StateTestA' as any
  setTimeout(() => {
    currentComponent.value = temp
    addLog(`Force updated component: ${temp}`)
  }, 100)
}

// Initialize
onMounted(() => {
  addLog('State cache test application started')
  addLog('Testing YzsKeepAlive with state preservation')
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
  max-width: 1000px;
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

.controls button:nth-child(4) {
  background-color: #e74c3c;
}

.controls button:nth-child(4):hover {
  background-color: #c0392b;
}

.controls button:nth-child(5) {
  background-color: #2ecc71;
}

.controls button:nth-child(5):hover {
  background-color: #27ae60;
}

.cache-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border-left: 4px solid #4a6ee0;
}

.test-instructions {
  background-color: #fff8e1;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border-left: 4px solid #ffc107;
}

.test-instructions h3 {
  margin-top: 0;
  color: #ff9800;
}

.test-instructions ol {
  margin: 10px 0;
  padding-left: 20px;
}

.test-instructions li {
  margin: 5px 0;
}

.test-area {
  border: 2px solid #4a6ee0;
  border-radius: 4px;
  padding: 20px;
  margin: 20px 0;
  min-height: 400px;
  background-color: #f8f9fa;
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