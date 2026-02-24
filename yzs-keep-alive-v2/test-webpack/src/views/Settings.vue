<template>
  <div class="page settings">
    <h2>Settings Page (NOT Cached)</h2>
    <div class="info">
      <p><strong>⚠️ This page is NOT cached!</strong></p>
      <p>The counter will reset every time you visit this page.</p>
    </div>
    <div class="counter-section">
      <p><strong>Counter: {{ counter }}</strong></p>
      <button @click="counter++">Increment</button>
      <button @click="counter = 0">Reset</button>
    </div>
    <div class="content">
      <p>This page demonstrates the exclude functionality. Settings is not in the include list, so it won't be cached.</p>
      <p>Try incrementing the counter, navigate away, and come back - the counter will be 0 again.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      counter: 0
    }
  },
  activated() {
    console.log('[Settings] activated (not cached)')
  },
  deactivated() {
    console.log('[Settings] deactivated (not cached)')
  }
}
</script>

<style scoped>
.page {
  border: 2px solid #f44336;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  background-color: #ffebee;
}

.info {
  background-color: #f9f9f9;
  padding: 15px;
  margin: 15px 0;
  border-radius: 4px;
  border-left: 4px solid #f44336;
}

.info strong {
  color: #f44336;
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
  border: 2px solid #f44336;
  background-color: white;
  border-radius: 4px;
}

.counter-section button:hover {
  background-color: #f44336;
  color: white;
}
</style>
