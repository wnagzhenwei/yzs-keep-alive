<template>
  <div id="app">
    <h1>yzs-keep-alive-v2 Test</h1>

    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/profile">Profile</router-link>
      <router-link to="/settings">Settings (No Cache)</router-link>
    </nav>

    <YzsKeepAlive
      ref="keepAlive"
      :include="['Home', 'About', 'Profile']"
      :max="3">
      <router-view></router-view>
    </YzsKeepAlive>

    <div class="cache-info">
      <h3>Cache Status</h3>
      <p><strong>Cached Components:</strong> {{ cachedKeys.join(', ') || 'None' }}</p>
      <p><strong>Cache Size:</strong> {{ cacheSize }} / 3</p>
      <p><strong>Current Route:</strong> {{ $route.name }}</p>
      <button @click="clearCache">Clear Cache</button>
      <button @click="refreshInfo">Refresh Info</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      cachedKeys: [],
      cacheSize: 0
    }
  },
  methods: {
    clearCache() {
      if (this.$refs.keepAlive) {
        this.$refs.keepAlive.clearCache()
        this.updateCacheInfo()
      }
    },
    refreshInfo() {
      this.updateCacheInfo()
    },
    updateCacheInfo() {
      if (this.$refs.keepAlive) {
        this.cachedKeys = this.$refs.keepAlive.getCachedKeys()
        this.cacheSize = this.$refs.keepAlive.getCacheSize()
      }
    }
  },
  mounted() {
    console.log('App mounted')
    this.updateCacheInfo()
  },
  watch: {
    '$route'() {
      this.$nextTick(() => {
        this.updateCacheInfo()
      })
    }
  }
}
</script>

<style scoped>
#app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #42b983;
}

nav {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

nav a {
  margin-right: 15px;
  text-decoration: none;
  color: #333;
  padding: 8px 16px;
  border: 2px solid #42b983;
  border-radius: 4px;
  display: inline-block;
}

nav a:hover,
nav a.router-link-active {
  background-color: #42b983;
  color: white;
}

.cache-info {
  margin-top: 30px;
  padding: 20px;
  background-color: #fff9e6;
  border: 2px solid #ffd700;
  border-radius: 8px;
}

.cache-info button {
  margin-right: 10px;
  margin-top: 10px;
  padding: 8px 16px;
  cursor: pointer;
  border: 2px solid #666;
  background-color: white;
  border-radius: 4px;
}

.cache-info button:hover {
  background-color: #666;
  color: white;
}
</style>
