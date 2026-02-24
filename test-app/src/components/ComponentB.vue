<template>
  <div class="component-b">
    <h2>Component B</h2>
    <p>This is Component B with different state.</p>

    <div class="timer">
      <p>Time active: {{ timer }} seconds</p>
      <p>Timer is {{ isTimerRunning ? 'running' : 'paused' }}</p>
      <button @click="toggleTimer">{{ isTimerRunning ? 'Pause Timer' : 'Start Timer' }}</button>
      <button @click="resetTimer">Reset Timer</button>
    </div>

    <div class="select-section">
      <p>Selected option: {{ selectedOption }}</p>
      <select v-model="selectedOption">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
    </div>

    <div class="list-section">
      <p>Items in list: {{ items.length }}</p>
      <button @click="addItem">Add Item</button>
      <button @click="removeItem">Remove Item</button>
      <ul>
        <li v-for="(item, index) in items" :key="index">{{ item }}</li>
      </ul>
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
  name: 'ComponentB'
})

// State
const timer = ref(0)
const isTimerRunning = ref(false)
const selectedOption = ref('option1')
const items = ref<string[]>(['Item 1', 'Item 2', 'Item 3'])
const lifecycleLogs = ref<string[]>([])
let timerInterval: number | null = null

// KeepAlive hooks
const { onActivated, onDeactivated } = useKeepAlive()

const addLog = (message: string) => {
  lifecycleLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
  if (lifecycleLogs.value.length > 5) {
    lifecycleLogs.value.pop()
  }
}

// Timer functions
const startTimer = () => {
  if (!timerInterval) {
    timerInterval = window.setInterval(() => {
      timer.value++
    }, 1000)
    isTimerRunning.value = true
  }
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
    isTimerRunning.value = false
  }
}

const toggleTimer = () => {
  if (isTimerRunning.value) {
    stopTimer()
  } else {
    startTimer()
  }
}

const resetTimer = () => {
  stopTimer()
  timer.value = 0
}

// List functions
const addItem = () => {
  items.value.push(`Item ${items.value.length + 1}`)
}

const removeItem = () => {
  if (items.value.length > 0) {
    items.value.pop()
  }
}

// Lifecycle hooks
onMounted(() => {
  addLog('Component mounted')
  startTimer()
})

onUnmounted(() => {
  addLog('Component unmounted')
  stopTimer()
})

onActivated(() => {
  addLog('Component activated')
  if (!isTimerRunning.value) {
    startTimer()
  }
})

onDeactivated(() => {
  addLog('Component deactivated')
  stopTimer()
})
</script>

<style scoped>
.component-b {
  padding: 20px;
  background-color: #f0f8e8;
  border-radius: 8px;
  border: 2px solid #c8e0b8;
}

.timer, .select-section, .list-section {
  margin: 15px 0;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
}

button {
  margin-right: 10px;
  padding: 5px 15px;
  background-color: #5db85d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #4da84d;
}

select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
  min-width: 150px;
}

ul {
  margin-top: 10px;
  padding-left: 20px;
}

li {
  margin: 5px 0;
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