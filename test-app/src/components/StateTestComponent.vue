<template>
  <div class="state-test-component">
    <h3>State Test Component {{ name }}</h3>

    <div class="state-section">
      <h4>Reactive State (Composition API)</h4>
      <div>
        <p>Count: {{ count }}</p>
        <button @click="increment">Increment</button>
        <button @click="decrement">Decrement</button>
      </div>

      <div>
        <p>User: {{ user.name }} ({{ user.age }})</p>
        <input v-model="user.name" placeholder="Name" />
        <input v-model.number="user.age" type="number" placeholder="Age" />
      </div>
    </div>

    <div class="state-section">
      <h4>Form State</h4>
      <div>
        <label>
          <input type="checkbox" v-model="checked" />
          Checkbox: {{ checked ? 'Checked' : 'Unchecked' }}
        </label>
      </div>

      <div>
        <label>
          Text Input:
          <input type="text" v-model="textInput" placeholder="Type something..." />
        </label>
        <p>Value: {{ textInput }}</p>
      </div>

      <div>
        <label>
          Select:
          <select v-model="selectedOption">
            <option value="">Select an option</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </label>
        <p>Selected: {{ selectedOption }}</p>
      </div>
    </div>

    <div class="state-section">
      <h4>Local Data</h4>
      <div>
        <p>Messages:</p>
        <ul>
          <li v-for="(message, index) in messages" :key="index">{{ message }}</li>
        </ul>
        <button @click="addMessage">Add Message</button>
      </div>
    </div>

    <div class="component-info">
      <p>Component created at: {{ createdTime }}</p>
      <p>Last activated: {{ lastActivated || 'Never' }}</p>
      <p>Activation count: {{ activationCount }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onActivated, onDeactivated } from 'vue'

const props = defineProps<{
  name: string
}>()

// Reactive state (Composition API)
const count = ref(0)
const user = reactive({
  name: 'John Doe',
  age: 30
})

// Form state
const checked = ref(false)
const textInput = ref('')
const selectedOption = ref('')

// Local data
const messages = ref<string[]>(['Initial message'])

// Component lifecycle info
const createdTime = ref(new Date().toLocaleTimeString())
const lastActivated = ref<string | null>(null)
const activationCount = ref(0)

// Methods
const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}

const addMessage = () => {
  messages.value.push(`Message ${messages.value.length + 1} at ${new Date().toLocaleTimeString()}`)
}

// Lifecycle hooks
onMounted(() => {
  console.log(`Component ${props.name} mounted`)
})

onActivated(() => {
  activationCount.value++
  lastActivated.value = new Date().toLocaleTimeString()
  console.log(`Component ${props.name} activated (count: ${activationCount.value})`)
})

onDeactivated(() => {
  console.log(`Component ${props.name} deactivated`)
})
</script>

<style scoped>
.state-test-component {
  padding: 20px;
  border: 2px solid #4a6ee0;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.state-test-component h3 {
  color: #4a6ee0;
  margin-top: 0;
}

.state-section {
  margin: 20px 0;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.state-section h4 {
  color: #666;
  margin-top: 0;
  margin-bottom: 10px;
}

.state-section div {
  margin: 10px 0;
}

.state-section input,
.state-section select {
  margin: 5px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.state-section button {
  margin: 5px;
  padding: 5px 10px;
  background-color: #4a6ee0;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.state-section button:hover {
  background-color: #3a5ed0;
}

.component-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #e8f4fd;
  border-radius: 4px;
  border: 1px solid #b3d9ff;
  font-size: 12px;
  color: #0066cc;
}

.component-info p {
  margin: 5px 0;
}
</style>