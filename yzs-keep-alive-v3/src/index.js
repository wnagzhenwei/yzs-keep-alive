import YzsKeepAlive from './components/YzsKeepAlive.vue';
import YzsKeepAliveEnhanced from './components/YzsKeepAliveEnhanced.vue';
import { useKeepAlive, useKeepAliveState, useShouldCache } from './composables/useKeepAlive';
import { useKeepAliveLifecycle, getLifecycleManager, resetLifecycleManager } from './core/lifecycle-manager';
import { createCacheManager } from './core/cache-manager';
import { ShapeFlags } from './core/shape-flags';
export { 
// 主组件
YzsKeepAlive, YzsKeepAliveEnhanced, 
// 组合式API
useKeepAlive, useKeepAliveState, useShouldCache, useKeepAliveLifecycle, 
// 核心工具
createCacheManager, getLifecycleManager, resetLifecycleManager, 
// 工具函数
ShapeFlags };
export default YzsKeepAlive;
