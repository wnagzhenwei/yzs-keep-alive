# yzs-keep-alive-v2 测试应用

这是一个用于测试 `yzs-keep-alive-v2` 库的 Vue 2 应用程序。

## 项目结构

```
test-vue2-app/
├── index.html              # HTML 入口文件
├── package.json            # 项目依赖配置
├── vite.config.js          # Vite 构建配置
└── src/
    ├── main.js             # 应用入口
    ├── App.vue             # 主应用组件
    └── components/
        ├── ComponentA.vue  # 测试组件 A (始终缓存)
        ├── ComponentB.vue  # 测试组件 B (始终缓存)
        └── ComponentC.vue  # 测试组件 C (可选缓存)
```

## 功能说明

### YzsKeepAlive 组件特性

- **include/exclude 模式**: 支持通过组件名称模式匹配来控制缓存
- **max 限制**: 支持 LRU 缓存策略，超过限制时自动淘汰最久未使用的缓存
- **生命周期钩子**: 支持 `activated` 和 `deactivated` 钩子
- **公共方法**:
  - `clearCache()`: 清空所有缓存
  - `getCachedKeys()`: 获取所有缓存的键
  - `getCacheSize()`: 获取当前缓存大小

### 测试功能

1. **组件切换测试**: 在不同组件之间切换，验证状态是否被正确保留
2. **缓存控制测试**: 动态改变 include/exclude 配置，测试缓存行为变化
3. **LRU 测试**: 改变最大缓存限制，测试最久未使用淘汰策略
4. **日志面板**: 实时显示组件激活/停用事件

## 安装和运行

### 安装依赖

```bash
cd test-vue2-app
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 上打开。

### 构建生产版本

```bash
npm run build
```

## 使用说明

### 基本测试流程

1. **验证基本缓存功能**:
   - 在组件 A 中点击"增加计数"按钮几次
   - 切换到组件 B，然后再切换回组件 A
   - 验证计数器值是否保持不变

2. **验证 include/exclude 功能**:
   - 点击"切换 ComponentC 缓存"按钮
   - 观察缓存面板的变化
   - 切换到组件 C，验证缓存行为是否符合预期

3. **验证 LRU 淘汰策略**:
   - 点击"改变最大缓存数"按钮
   - 在多个组件之间切换
   - 观察缓存键的变化，验证最久未使用的组件是否被淘汰

4. **验证清空缓存功能**:
   - 点击"清空缓存"按钮
   - 观察缓存面板显示"暂无缓存"
   - 切换组件，验证缓存是否从零开始

### 预期结果

- **组件 A 和 B**: 始终被缓存，切换后状态保持不变
- **组件 C**: 根据 include 配置决定是否缓存
- **激活次数**: 每次切换到已缓存的组件时应该增加
- **日志面板**: 正确显示组件的激活和停用事件

## 开发说明

### 修改 yzs-keep-alive-v2 库

如果需要修改 `yzs-keep-alive-v2` 库：

1. 在 `yzs-keep-alive-v2/` 目录中修改代码
2. 运行 `npm run build` 重新构建库
3. 重启测试应用的开发服务器

### 调试技巧

- 打开浏览器控制台查看日志输出
- 使用 Vue DevTools 查看组件状态
- 观察日志面板中的激活/停用事件

## 常见问题

### Q: 组件状态没有被保留？
A: 检查组件名称是否正确配置，以及是否在 include 列表中。

### Q: activated 钩子没有被触发？
A: 确保 `vnode.data.keepAlive` 被正确设置为 true。

### Q: 缓存没有按预期淘汰？
A: 检查 max 限制是否正确设置，以及 LRU 更新逻辑是否正确。

## 技术栈

- Vue 2.7.16
- Vite 7.3.1
- @vitejs/plugin-vue2 2.3.1
- yzs-keep-alive-v2 (本地链接)

## 相关链接

- yzs-keep-alive-v2 源码: `../yzs-keep-alive-v2/`
- Vue 2 官方文档: https://v2.vuejs.org/
