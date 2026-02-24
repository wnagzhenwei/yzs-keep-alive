# yzs-keep-alive

> 自定义 Vue KeepAlive 组件库 - 不依赖 Vue 内置 KeepAlive 实现

[![npm version](https://img.shields.io/npm/v/yzs-keep-alive-v2.svg)](https://www.npmjs.com/package/yzs-keep-alive-v2)
[![License](https://img.shields.io/npm/l/yzs-keep-alive-v2.svg)](LICENSE)
[![Vue 2](https://img.shields.io/badge/Vue-2.6%2B-brightgreen)](https://v2.vuejs.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.0%2B-brightgreen)](https://vuejs.org/)

## 项目简介

本项目提供了两个自定义的 KeepAlive 组件实现，分别用于 Vue 2 和 Vue 3，完全复制了 Vue 内置 KeepAlive 的功能，但不依赖其实现。

- **yzs-keep-alive-v2** - Vue 2 版本（已发布到 npm）
- **yzs-keep-alive-v3** - Vue 3 版本（开发中）

## 特性

### 共同特性

- ✅ **组件实例缓存** - 保存和恢复组件状态
- ✅ **生命周期钩子** - 支持 `activated` 和 `deactivated` 钩子
- ✅ **模式匹配** - `include` 和 `exclude` 属性支持字符串、正则或数组
- ✅ **最大缓存限制** - LRU（最近最少使用）淘汰策略
- ✅ **无依赖** - 不依赖 Vue 内置的 KeepAlive
- ✅ **TypeScript 支持** - 完整的类型定义

### Vue 2 版本特性

- 使用 Options API
- 基于 `abstract: true` 模式
- 对象/数组缓存存储
- 兼容 Vue 2.6+ 和 Vue 2.7

### Vue 3 版本特性

- 使用 Composition API
- 基于 Vue 内部渲染器 API
- Map/Set 缓存存储
- 兼容 Vue 3.0+

## 安装

### Vue 2

```bash
npm install yzs-keep-alive-v2
# 或
yarn add yzs-keep-alive-v2
# 或
pnpm add yzs-keep-alive-v2
```

### Vue 3（开发中）

Vue 3 版本尚未发布到 npm，可从源码构建使用。

## 快速开始

### Vue 2 使用示例

```vue
<template>
  <div>
    <button @click="currentView = 'home'">首页</button>
    <button @click="currentView = 'about'">关于</button>

    <YzsKeepAlive :include="['Home', 'About']" :max="10">
      <component :is="currentView" />
    </YzsKeepAlive>
  </div>
</template>

<script>
import YzsKeepAlive from 'yzs-keep-alive-v2'

export default {
  components: {
    YzsKeepAlive
  },
  data() {
    return {
      currentView: 'home'
    }
  },
  components: {
    home: {
      name: 'Home',
      template: '<div>首页 - 计数: {{ count }}</div>',
      data() {
        return { count: 0 }
      },
      activated() {
        console.log('首页被激活')
      },
      deactivated() {
        console.log('首页被停用')
      }
    },
    about: {
      name: 'About',
      template: '<div>关于页面</div>'
    }
  }
}
</script>
```

### Vue 3 使用示例

```vue
<template>
  <div>
    <button @click="currentView = 'Home'">首页</button>
    <button @click="currentView = 'About'">关于</button>

    <YzsKeepAlive :include="['Home', 'About']" :max="10">
      <component :is="currentView" />
    </YzsKeepAlive>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import YzsKeepAlive from 'yzs-keep-alive-v3'

const currentView = ref('Home')
</script>
```

## API 文档

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| include | `string \| RegExp \| Array` | - | 只缓存匹配的组件 |
| exclude | `string \| RegExp \| Array` | - | 不缓存匹配的组件 |
| max | `string \| number` | `10` | 最大缓存数量 |

### 公共方法

通过 ref 调用组件实例方法：

```javascript
// 清空所有缓存
this.$refs.keepAlive.clearCache()

// 获取所有缓存的键
const keys = this.$refs.keepAlive.getCachedKeys()

// 获取当前缓存大小
const size = this.$refs.keepAlive.getCacheSize()

// 清除指定缓存
this.$refs.keepAlive.clearCacheByKey(key)

// 使用过滤器清除缓存
this.$refs.keepAlive.pruneCacheWithFilter((name, key) => {
  return name === 'ComponentA'
})
```

## 生命周期钩子

被缓存的组件可以使用 `activated` 和 `deactivated` 钩子：

```javascript
export default {
  name: 'MyComponent',
  data() {
    return {
      scrollPosition: 0
    }
  },
  activated() {
    // 组件被激活时调用
    console.log('组件激活')
    this.restoreScroll()
  },
  deactivated() {
    // 组件被停用时调用
    console.log('组件停用')
    this.saveScroll()
  }
}
```

## 项目结构

```
yzs-keep-alive/
├── yzs-keep-alive-v2/          # Vue 2 版本
│   ├── src/
│   │   ├── components/         # 组件实现
│   │   ├── core/               # 核心模块
│   │   │   ├── cache-manager.js    # LRU 缓存管理
│   │   │   └── utils.js            # 工具函数
│   │   └── index.js            # 入口文件
│   ├── dist/                   # 构建产物
│   ├── test/                   # 单元测试
│   └── package.json
│
├── yzs-keep-alive-v3/          # Vue 3 版本
│   ├── src/
│   │   ├── components/         # 组件实现
│   │   ├── core/               # 核心模块
│   │   ├── composables/        # Composition API
│   │   └── types/              # TypeScript 类型
│   ├── dist/                   # 构建产物
│   ├── test/                   # 单元测试
│   └── package.json
│
├── test-vue2-app/              # Vue 2 测试应用
├── test-app/                   # Vue 3 测试应用
└── README.md
```

## 开发

### yzs-keep-alive-v2 (Vue 2)

```bash
cd yzs-keep-alive-v2
npm install
npm run build      # 构建库
npm run test       # 运行测试
npm run dev        # 开发服务器
```

### yzs-keep-alive-v3 (Vue 3)

```bash
cd yzs-keep-alive-v3
npm install
npm run build          # 构建库
npm run type-check     # TypeScript 类型检查
npm run dev            # 开发服务器
```

### 测试应用

```bash
# Vue 2 测试应用
cd test-vue2-app
npm install
npm run dev

# Vue 3 测试应用
cd test-app
npm install
npm run dev
```

## 技术实现

### Vue 2 版本

- **抽象组件模式**: 使用 `abstract: true` 避免创建包装 DOM 元素
- **VNode 拦截**: 在 render 函数中拦截并缓存组件实例
- **实例复用**: 同时复用组件实例和 DOM 元素
- **Keep-Alive 标志**: 设置 `vnode.data.keepAlive = true` 通知 Vue 2 渲染器

### Vue 3 版本

- **渲染器集成**: 通过 `sharedContext.renderer` 直接集成
- **内部 API**: 使用 Vue 内部的 `move`、`patch`、`_unmount` 函数
- **Shape Flags**: 使用 Vue 3 的 shape flags 系统
- **增强版**: 提供独立的缓存系统实现

## 版本对比

| 特性 | Vue 2 版本 | Vue 3 版本 |
|------|-----------|-----------|
| 组件 API | Options API | Composition API |
| 实现模式 | `abstract: true` | `sharedContext.renderer` |
| VNode 类型 | `componentOptions` | Shape flags |
| 缓存存储 | Object/Array | Map/Set |
| 组件名称 | `componentOptions.Ctor.options.name` | `Component.__name` |
| DOM 元素 | `vnode.elm` | `vnode.el` |
| 组件实例 | `vnode.componentInstance` | `vnode.component` |

## 浏览器支持

### Vue 2 版本

- Chrome >= 51
- Firefox >= 54
- Safari >= 10
- Edge >= 79
- IE >= 11（需要 polyfills）

### Vue 3 版本

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 常见问题

### Q: 组件名称如何设置？

A: 确保 `include` 和 `exclude` 能正常工作，组件必须设置 `name` 属性：

```javascript
export default {
  name: 'MyComponent',  // 必需
  // ...
}
```

### Q: 为什么组件状态没有保留？

A: 检查组件名称是否正确配置，以及是否在 `include` 列表中。

### Q: Vue 2 和 Vue 3 版本可以互换吗？

A: 不可以，请根据项目使用的 Vue 版本选择对应的库。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT](LICENSE)

## 作者

hnwangzhenwei

## 链接

- [npm 包 (Vue 2)](https://www.npmjs.com/package/yzs-keep-alive-v2)
- [GitHub 仓库](https://github.com/wnagzhenwei/yzs-keep-alive)
- [Vue 2 文档](https://v2.vuejs.org/)
- [Vue 3 文档](https://vuejs.org/)

## 更新日志

### yzs-keep-alive-v2

- **0.1.0** (2025-02-24)
  - 首次发布
  - 实现 Vue 2 KeepAlive 功能
  - 支持 include/exclude 模式匹配
  - 支持 LRU 缓存淘汰策略
  - 支持公共方法操作缓存

### yzs-keep-alive-v3

- 开发中
