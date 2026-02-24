<template>
  <div class="page home">
    <h2>Home Page (Cached)</h2>
    <div class="info">
      <p>This page will be cached when you navigate away and back.</p>
      <p><strong>Activation Count:</strong> {{ activationCount }}</p>
      <p><strong>Last Activated:</strong> {{ lastActivated }}</p>
    </div>
    <div class="counter-section">
      <p><strong>Counter: {{ counter }}</strong></p>
      <button @click="counter++">Increment</button>
      <button @click="counter = 0">Reset</button>
    </div>
    <div class="content">
      <p>Welcome to the home page! Try incrementing the counter, then navigate to another page and come back. The counter value should be preserved.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      counter: 0,
      activationCount: 0,
      lastActivated: null
    }
  },
  activated() {
    this.activationCount++
    this.lastActivated = new Date().toLocaleTimeString()
    console.log('[Home] activated - count:', this.activationCount)
  },
  deactivated() {
    console.log('[Home] deactivated')
  }
}
</script>

<style scoped>
.page {
  border: 2px solid #2196f3;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  background-color: #e3f2fd;
}

.info {
  background-color: #f9f9f9;
  padding: 15px;
  margin: 15px 0;
  border-radius: 4px;
  border-left: 4px solid #2196f3;
}

.counter-section {
  margin: 20px 0;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
}

.counter-section button {
  margin-right: 10px;
  padding: 8px 16px;
  cursor: pointer;
  border: 2px solid #2196f3;
  background-color: white;
  border-radius: 4px;
}

.counter-section button:hover {
  background-color: #2196f3;
  color: white;
}
</style>
