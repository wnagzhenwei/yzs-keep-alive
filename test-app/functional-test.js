#!/usr/bin/env node

/**
 * YzsKeepAlive 功能测试指南
 * 这个脚本会引导用户完成手动功能测试
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// 测试结果
const testResults = []
let currentTest = 1

console.log('🧪 YzsKeepAlive 功能测试指南')
console.log('='.repeat(60))
console.log('这个脚本将引导你完成所有功能测试。')
console.log('请按照指示在浏览器中操作，然后返回这里记录结果。')
console.log('='.repeat(60))

// 提问函数
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase())
    })
  })
}

// 记录测试结果
function recordTest(testName, result, notes = '') {
  testResults.push({
    test: currentTest++,
    name: testName,
    passed: result,
    notes,
    timestamp: new Date().toISOString()
  })
}

// 打印测试结果
function printResults() {
  console.log('\n' + '='.repeat(60))
  console.log('功能测试报告')
  console.log('='.repeat(60))

  testResults.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} 测试 ${result.test}: ${result.name}`)
    if (result.notes) {
      console.log(`   备注: ${result.notes}`)
    }
  })

  const passed = testResults.filter(r => r.passed).length
  const total = testResults.length

  console.log('\n' + '-'.repeat(60))
  console.log(`总计: ${total} 个测试`)
  console.log(`通过: ${passed} 个`)
  console.log(`失败: ${total - passed} 个`)
  console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`)
  console.log('-'.repeat(60))

  // 保存报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed: total - passed,
      successRate: (passed / total) * 100
    },
    tests: testResults,
    recommendations: getRecommendations()
  }

  fs.writeFileSync(
    path.join(__dirname, 'functional-test-report.json'),
    JSON.stringify(report, null, 2)
  )

  console.log(`\n详细报告已保存到: functional-test-report.json`)
}

// 获取建议
function getRecommendations() {
  const failedTests = testResults.filter(r => !r.passed)
  const recommendations = []

  if (failedTests.length > 0) {
    recommendations.push('需要修复以下失败的测试:')
    failedTests.forEach(test => {
      recommendations.push(`  - ${test.name}: ${test.notes || '无备注'}`)
    })
  }

  // 检查是否测试了所有核心功能
  const testedFeatures = testResults.map(r => r.name.toLowerCase())
  const coreFeatures = [
    '页面加载',
    '组件切换',
    '状态保持',
    '缓存配置',
    '生命周期',
    '缓存管理'
  ]

  coreFeatures.forEach(feature => {
    if (!testedFeatures.some(t => t.includes(feature.toLowerCase()))) {
      recommendations.push(`未测试: ${feature}`)
    }
  })

  return recommendations
}

// 主要测试流程
async function runFunctionalTests() {
  console.log('\n📋 第1步: 启动开发服务器')
  console.log('-' .repeat(40))
  console.log('1. 打开新的终端窗口')
  console.log('2. 切换到 test-app 目录: cd test-app')
  console.log('3. 启动开发服务器: npm run dev')
  console.log('4. 等待服务器启动，记下端口号（通常是5174）')
  console.log('5. 在浏览器中访问: http://localhost:<端口号>')

  const serverReady = await askQuestion('\n是否已完成上述步骤？(y/n): ')
  if (serverReady !== 'y') {
    console.log('请先完成第1步，然后重新运行测试。')
    rl.close()
    return
  }

  recordTest('服务器启动', true, '手动确认服务器已启动')

  console.log('\n📋 第2步: 基础功能测试')
  console.log('-' .repeat(40))
  console.log('请在浏览器中检查以下内容:')
  console.log('1. 页面标题是否为 "YzsKeepAlive Test Application"')
  console.log('2. 是否有四个按钮: Switch to Component A/B/C 和 Clear Cache')
  console.log('3. 是否显示缓存信息 (Cache Size 和 Cached Keys)')
  console.log('4. 是否有 Event Logs 区域')

  const basicCheck = await askQuestion('\n上述内容是否正确显示？(y/n): ')
  recordTest('页面加载和基础UI', basicCheck === 'y', basicCheck === 'y' ? '所有基础元素正常显示' : '部分元素缺失或异常')

  console.log('\n📋 第3步: 状态保持测试 - Component A')
  console.log('-' .repeat(40))
  console.log('请在浏览器中执行以下操作:')
  console.log('1. 确保当前显示 Component A')
  console.log('2. 点击 "Increment" 按钮几次，记下计数器值')
  console.log('3. 在输入框中输入一些文字')
  console.log('4. 勾选复选框')
  console.log('5. 点击 "Switch to Component B" 按钮')
  console.log('6. 等待切换完成')
  console.log('7. 点击 "Switch to Component A" 按钮切回')

  const stateCheckA = await askQuestion('\n切回Component A后，计数器、输入框内容和复选框状态是否保持？(y/n): ')
  recordTest('Component A状态保持', stateCheckA === 'y', stateCheckA === 'y' ? '状态保持正常' : '状态未保持')

  console.log('\n📋 第4步: 状态保持测试 - Component B')
  console.log('-' .repeat(40))
  console.log('请在浏览器中执行以下操作:')
  console.log('1. 切换到 Component B')
  console.log('2. 让计时器运行几秒，记下时间')
  console.log('3. 从下拉菜单中选择一个选项')
  console.log('4. 点击 "Add Item" 按钮几次')
  console.log('5. 切换到 Component C')
  console.log('6. 再切回 Component B')

  const stateCheckB = await askQuestion('\n切回Component B后，计时器是否继续运行？下拉选项和列表项是否保持？(y/n): ')
  recordTest('Component B状态保持', stateCheckB === 'y', stateCheckB === 'y' ? '状态保持正常' : '状态未保持')

  console.log('\n📋 第5步: 缓存配置测试 - Component C')
  console.log('-' .repeat(40))
  console.log('请在浏览器中执行以下操作:')
  console.log('1. 切换到 Component C')
  console.log('2. 点击 "Generate New Random Number" 按钮生成随机数')
  console.log('3. 在文本框中输入一些文字')
  console.log('4. 切换到 Component A')
  console.log('5. 再切回 Component C')

  const excludeCheck = await askQuestion('\n切回Component C后，随机数和文本框内容是否重置？（应该重置，因为Component C被排除在缓存外）(y/n): ')
  recordTest('Component C排除缓存', excludeCheck === 'y', excludeCheck === 'y' ? '正确排除缓存，状态重置' : '状态意外保持')

  console.log('\n📋 第6步: 缓存限制测试')
  console.log('-' .repeat(40))
  console.log('缓存最大限制设置为2，测试LRU淘汰策略:')
  console.log('1. 查看当前缓存大小 (Cache Size)')
  console.log('2. 按顺序切换: A → B → C → A')
  console.log('3. 查看缓存键 (Cached Keys) 变化')

  const cacheLimitCheck = await askQuestion('\n切换后，缓存中是否只包含2个组件？（B和C，或A和C）(y/n): ')
  recordTest('缓存最大限制', cacheLimitCheck === 'y', cacheLimitCheck === 'y' ? 'LRU淘汰策略正常' : '缓存限制未正常工作')

  console.log('\n📋 第7步: 生命周期钩子测试')
  console.log('-' .repeat(40))
  console.log('观察 Event Logs 区域:')
  console.log('1. 多次切换组件')
  console.log('2. 查看是否每次切换都触发 activated/deactivated 事件')
  console.log('3. 检查日志内容是否正确')

  const lifecycleCheck = await askQuestion('\n生命周期钩子是否正确触发？(y/n): ')
  recordTest('生命周期钩子', lifecycleCheck === 'y', lifecycleCheck === 'y' ? '钩子正常触发' : '钩子未触发或异常')

  console.log('\n📋 第8步: 缓存管理测试')
  console.log('-' .repeat(40))
  console.log('1. 点击 "Clear Cache" 按钮')
  console.log('2. 查看缓存信息是否清空')

  const cacheClearCheck = await askQuestion('\n点击清空缓存后，缓存大小是否变为0，缓存键列表是否清空？(y/n): ')
  recordTest('缓存清理功能', cacheClearCheck === 'y', cacheClearCheck === 'y' ? '缓存清理正常' : '缓存清理失败')

  console.log('\n📋 第9步: 性能测试')
  console.log('-' .repeat(40))
  console.log('快速多次切换组件（10次以上），观察:')
  console.log('1. 页面是否卡顿')
  console.log('2. 内存使用是否异常增长')
  console.log('3. 控制台是否有错误')

  const performanceCheck = await askQuestion('\n快速切换组件时，性能是否正常？(y/n): ')
  recordTest('性能测试', performanceCheck === 'y', performanceCheck === 'y' ? '性能正常' : '性能问题')

  // 打印结果
  printResults()

  // 提供总结
  console.log('\n' + '='.repeat(60))
  console.log('功能测试完成')
  console.log('='.repeat(60))

  const passedCount = testResults.filter(r => r.passed).length
  const totalCount = testResults.length

  if (passedCount === totalCount) {
    console.log('🎉 恭喜！所有功能测试通过！')
    console.log('YzsKeepAlive 组件完全实现所需功能。')
  } else {
    console.log('⚠️  部分测试失败，需要进一步检查。')
    console.log('请参考 functional-test-report.json 中的详细报告。')
  }

  console.log('\n下一步:')
  console.log('1. 检查 functional-test-report.json 获取详细结果')
  console.log('2. 如果有失败测试，请根据备注进行修复')
  console.log('3. 可以考虑进行更深入的压力测试')

  rl.close()
}

// 运行测试
runFunctionalTests().catch(error => {
  console.error('测试过程发生错误:', error)
  rl.close()
  process.exit(1)
})