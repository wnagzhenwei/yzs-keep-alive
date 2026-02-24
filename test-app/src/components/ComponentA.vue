<template>
  <div class="component-a">
    <h2>Component A</h2>
    <p>This is Component A with state preservation.</p>

    <div class="counter">
      <p>Counter: {{ count }}</p>
      <button @click="count++">Increment</button>
      <button @click="count--">Decrement</button>
      <button @click="count = 0">Reset</button>
    </div>

    <div class="input-section">
      <p>Input value: {{ inputValue }}</p>
      <input v-model="inputValue" placeholder="Type something..." />
    </div>

    <div class="checkbox-section">
      <label>
        <input type="checkbox" v-model="checked" />
        Check me ({{ checked ? 'Checked' : 'Unchecked' }})
      </label>
    </div>

    <div class="lifecycle-logs">
      <h3>Lifecycle Logs:</h3>
      <div v-for="(log, index) in lifecycleLogs" :key="index" class="log-item">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useKeepAlive } from 'yzs-keep-alive-v3'

defineOptions({
  name: 'ComponentA'
})

// State
const count = ref(0)
const inputValue = ref('')
const checked = ref(false)
const lifecycleLogs = ref<string[]>([])

// KeepAlive hooks
const { onActivated, onDeactivated } = useKeepAlive()

const addLog = (message: string) => {
  lifecycleLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
  if (lifecycleLogs.value.length > 5) {
    lifecycleLogs.value.pop()
  }
}

// Lifecycle hooks
onMounted(() => {
  addLog('Component mounted')
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
.component-a {
  padding: 20px;
  background-color: #e8f4fd;
  border-radius: 8px;
  border: 2px solid #b8d4f0;
}

.counter, .input-section, .checkbox-section {
  margin: 15px 0;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
}

button {
  margin-right: 10px;
  padding: 5px 15px;
  background-color: #4a6ee0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3a5ed0;
}

input[type="text"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
  margin-top: 5px;
}

input[type="checkbox"] {
  margin-right: 8px;
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
</style>