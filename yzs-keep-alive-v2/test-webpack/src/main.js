import Vue from 'vue'
import VueRouter from 'vue-router'
import YzsKeepAlive from 'yzs-keep-alive-v2'
import App from './App.vue'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Profile from './views/Profile.vue'
import Settings from './views/Settings.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/about', name: 'about', component: About },
  { path: '/profile', name: 'profile', component: Profile },
  { path: '/settings', name: 'settings', component: Settings }
]

const router = new VueRouter({
  routes
})

Vue.component('YzsKeepAlive', YzsKeepAlive)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
