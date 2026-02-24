<template>
  <div class="component-c">
    <h2>Component C (Excluded from Cache)</h2>
    <p>This component should not be cached due to exclude configuration.</p>

    <div class="state-info">
      <p>Random number: {{ randomNumber }}</p>
      <p>Last updated: {{ lastUpdate }}</p>
      <button @click="generateRandom">Generate New Random Number</button>
    </div>

    <div class="text-section">
      <p>Text: {{ text }}</p>
      <textarea v-model="text" placeholder="Type something..." rows="3"></textarea>
    </div>

    <div class="lifecycle-logs">
      <h3>Lifecycle Logs:</h3>
      <div v-for="(log, index) in lifecycleLogs" :key="index" class="log-item">
        {{ log }}
      </div>
    </div>

    <div class="warning">
      <p><strong>Note:</strong> This component is excluded from caching. State will not be preserved when switching away.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useKeepAlive } from 'yzs-keep-alive-v3'

defineOptions({
  name: 'ComponentC'
})

// State
const randomNumber = ref(0)
const lastUpdate = ref('')
const text = ref('')
const lifecycleLogs = ref<string[]>([])

// KeepAlive hooks
const { onActivated, onDeactivated } = useKeepAlive()

const addLog = (message: string) => {
  lifecycleLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
  if (lifecycleLogs.value.length > 5) {
    lifecycleLogs.value.pop()
  }
}

// Generate random number
const generateRandom = () => {
  randomNumber.value = Math.floor(Math.random() * 1000)
  lastUpdate.value = new Date().toLocaleTimeString()
}

// Lifecycle hooks
onMounted(() => {
  addLog('Component mounted')
  generateRandom()
})

onUnmounted(() => {
  addLog('Component unmounted')
})

onActivated(() => {
  addLog('Component activated')
})

onDeactivated(() => {
  addLog('Component deactivated')
})
</script>

<style scoped>
.component-c {
  padding: 20px;
  background-color: #fde8e8;
  border-radius: 8px;
  border: 2px solid #f0b8b8;
}

.state-info, .text-section {
  margin: 15px 0;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
}

button {
  margin-right: 10px;
  padding: 5px 15px;
  background-color: #e05a5a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #d04a4a;
}

textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
  font-family: inherit;
}

.lifecycle-logs {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.log-item {
  padding: 5px;
  font-family: monospace;
  font-size: 12px;
  color: #666;
}

.warning {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff3cd;
  border-radius: 4px;
  border-left: 4px solid #ffc107;
}

.warning p {
  margin: 0;
  color: #856404;
}
</style>