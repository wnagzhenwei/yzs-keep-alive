#!/usr/bin/env node

/**
 * YzsKeepAlive 完整测试套件
 * 运行所有测试：验证、功能、单元测试
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 YzsKeepAlive 完整测试套件')
console.log('='.repeat(60))

// 测试结果汇总
const allResults = {
  validation: null,
  unit: null,
  functional: null,
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0
  }
}

// 运行验证测试
function runValidationTests() {
  console.log('\n📋 第1部分: 项目验证测试')
  console.log('-' .repeat(40))

  try {
    const output = execSync(`node "${path.join(__dirname, 'run-tests.js')}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    })

    console.log(output)

    // 解析结果
    const reportPath = path.join(__dirname, 'validation-report.json')
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      allResults.validation = report
      allResults.summary.totalTests += report.summary.total
      allResults.summary.passedTests += report.summary.passed
      allResults.summary.failedTests += report.summary.failed

      return report.summary.passed === report.summary.total
    }

    return false
  } catch (error) {
    console.error('验证测试失败:', error.message)
    return false
  }
}

// 运行库单元测试
function runUnitTests() {
  console.log('\n📋 第2部分: 库单元测试')
  console.log('-' .repeat(40))

  const testDir = path.join(__dirname, '..', 'yzskeepalive', 'test')
  const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'))

  const unitResults = {
    total: testFiles.length,
    passed: 0,
    failed: 0,
    details: []
  }

  testFiles.forEach((testFile, index) => {
    console.log(`\n运行测试: ${testFile}`)
    try {
      const testPath = path.join(testDir, testFile)
      const output = execSync(`node "${testPath}"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      console.log(output)

      const passed = output.includes('✅ All') || output.includes('passed')
      if (passed) {
        unitResults.passed++
        unitResults.details.push({ file: testFile, passed: true })
      } else {
        unitResults.failed++
        unitResults.details.push({ file: testFile, passed: false })
      }
    } catch (error) {
      console.error(`测试 ${testFile} 失败:`, error.message)
      unitResults.failed++
      unitResults.details.push({ file: testFile, passed: false, error: error.message })
    }
  })

  allResults.unit = unitResults
  allResults.summary.totalTests += unitResults.total
  allResults.summary.passedTests += unitResults.passed
  allResults.summary.failedTests += unitResults.failed

  return unitResults.passed === unitResults.total
}

// 提供功能测试指南
function provideFunctionalTestGuide() {
  console.log('\n📋 第3部分: 功能测试')
  console.log('-' .repeat(40))
  console.log('功能测试需要手动在浏览器中完成。')
  console.log('\n请运行以下命令进行功能测试:')
  console.log('  node functional-test.js')
  console.log('\n或者按照以下步骤手动测试:')
  console.log('1. 启动开发服务器: npm run dev')
  console.log('2. 访问 http://localhost:5174')
  console.log('3. 按照 BROWSER_TEST_GUIDE.md 中的步骤测试')

  // 检查是否有功能测试报告
  const funcReportPath = path.join(__dirname, 'functional-test-report.json')
  if (fs.existsSync(funcReportPath)) {
    console.log('\n📊 发现已有的功能测试报告:')
    const report = JSON.parse(fs.readFileSync(funcReportPath, 'utf8'))
    allResults.functional = report
    allResults.summary.totalTests += report.summary.total
    allResults.summary.passedTests += report.summary.passed
    allResults.summary.failedTests += report.summary.failed

    console.log(`   测试总数: ${report.summary.total}`)
    console.log(`   通过: ${report.summary.passed}`)
    console.log(`   失败: ${report.summary.failed}`)
    console.log(`   成功率: ${report.summary.successRate.toFixed(1)}%`)
  }

  console.log('\n⚠️  功能测试需要手动完成。完成后，结果将保存在 functional-test-report.json')
}

// 生成最终报告
function generateFinalReport() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 完整测试报告')
  console.log('='.repeat(60))

  // 各部分结果
  console.log('\n各部分测试结果:')

  if (allResults.validation) {
    const v = allResults.validation.summary
    console.log(`✅ 项目验证: ${v.passed}/${v.total} 通过 (${v.successRate.toFixed(1)}%)`)
  }

  if (allResults.unit) {
    const u = allResults.unit
    console.log(`✅ 单元测试: ${u.passed}/${u.total} 通过 (${((u.passed / u.total) * 100).toFixed(1)}%)`)
  }

  if (allResults.functional) {
    const f = allResults.functional.summary
    console.log(`✅ 功能测试: ${f.passed}/${f.total} 通过 (${f.successRate.toFixed(1)}%)`)
  }

  // 汇总
  const s = allResults.summary
  const successRate = s.totalTests > 0 ? (s.passedTests / s.totalTests) * 100 : 0

  console.log('\n' + '-'.repeat(60))
  console.log('📈 汇总统计:')
  console.log(`   总测试数: ${s.totalTests}`)
  console.log(`   通过测试: ${s.passedTests}`)
  console.log(`   失败测试: ${s.failedTests}`)
  console.log(`   总成功率: ${successRate.toFixed(1)}%`)
  console.log('-'.repeat(60))

  // 保存完整报告
  const finalReport = {
    timestamp: new Date().toISOString(),
    summary: s,
    details: allResults,
    recommendations: getFinalRecommendations()
  }

  fs.writeFileSync(
    path.join(__dirname, 'complete-test-report.json'),
    JSON.stringify(finalReport, null, 2)
  )

  console.log(`\n📁 完整报告已保存到: complete-test-report.json`)

  // 最终建议
  console.log('\n' + '='.repeat(60))
  console.log('🎯 下一步建议')
  console.log('='.repeat(60))

  const recommendations = getFinalRecommendations()
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`)
  })

  // 退出代码
  if (s.failedTests > 0) {
    console.log('\n⚠️  有测试失败，请检查并修复。')
    process.exit(1)
  } else {
    console.log('\n🎉 所有测试通过！项目质量优秀。')
    process.exit(0)
  }
}

// 获取最终建议
function getFinalRecommendations() {
  const recommendations = []

  // 检查各部分测试状态
  if (!allResults.validation || allResults.validation.summary.failed > 0) {
    recommendations.push('修复项目验证问题，确保所有文件存在且结构正确')
  }

  if (!allResults.unit || allResults.unit.failed > 0) {
    recommendations.push('修复单元测试失败，确保核心逻辑正确')
  }

  if (!allResults.functional) {
    recommendations.push('完成手动功能测试: node functional-test.js')
  } else if (allResults.functional.summary.failed > 0) {
    recommendations.push('修复功能测试中发现的问题')
  }

  // 如果所有测试都通过
  if (allResults.summary.failedTests === 0) {
    recommendations.push('项目测试完成，可以考虑:')
    recommendations.push('  - 发布到npm')
    recommendations.push('  - 添加更多边缘情况测试')
    recommendations.push('  - 进行性能基准测试')
  }

  // 通用建议
  recommendations.push('定期运行测试以确保质量')
  recommendations.push('考虑添加持续集成(CI)流程')

  return recommendations
}

// 主函数
async function runAllTests() {
  try {
    console.log('开始运行完整测试套件...')

    // 1. 运行验证测试
    const validationPassed = runValidationTests()

    // 2. 运行单元测试
    const unitPassed = runUnitTests()

    // 3. 功能测试指南
    provideFunctionalTestGuide()

    // 4. 生成报告
    generateFinalReport()

  } catch (error) {
    console.error('测试套件执行失败:', error)
    process.exit(1)
  }
}

// 运行测试
if (require.main === module) {
  runAllTests()
}

module.exports = {
  runAllTests,
  allResults
}