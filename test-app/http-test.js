#!/usr/bin/env node

/**
 * HTTP测试 - 使用Node.js原生HTTP模块测试服务器响应
 * 不依赖WebFetch，可以在Claude Code中运行
 */

const http = require('http')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🌐 HTTP服务器测试')
console.log('='.repeat(50))

let serverProcess = null
const PORT = 5175
const TEST_TIMEOUT = 10000

// 启动测试服务器
function startTestServer() {
  return new Promise((resolve, reject) => {
    console.log('启动测试服务器...')

    // 使用静态文件服务器
    const serverCode = `
      const http = require('http');
      const fs = require('fs');
      const path = require('path');

      const server = http.createServer((req, res) => {
        const filePath = req.url === '/' ? 'index.html' : req.url.substring(1);
        const fullPath = path.join(__dirname, 'dist', filePath);

        fs.readFile(fullPath, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200);
            res.end(data);
          }
        });
      });

      server.listen(${PORT}, () => {
        console.log('Test server running on port ${PORT}');
      });
    `

    // 将服务器代码写入临时文件
    const serverFile = path.join(__dirname, 'temp-server.js')
    fs.writeFileSync(serverFile, serverCode)

    serverProcess = spawn('node', [serverFile], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    // 等待服务器启动
    setTimeout(() => {
      resolve(true)
    }, 2000)

    serverProcess.stderr.on('data', (data) => {
      console.error('服务器错误:', data.toString())
    })

    serverProcess.on('error', (err) => {
      reject(err)
    })
  })
}

// 停止服务器
function stopTestServer() {
  if (serverProcess) {
    serverProcess.kill()
    // 清理临时文件
    const serverFile = path.join(__dirname, 'temp-server.js')
    if (fs.existsSync(serverFile)) {
      fs.unlinkSync(serverFile)
    }
  }
}

// HTTP请求测试
function makeHttpRequest() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: 5000
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        })
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('请求超时'))
    })

    req.end()
  })
}

// 分析HTML内容
function analyzeHTML(html) {
  const checks = []

  // 检查标题
  const hasTitle = html.includes('YzsKeepAlive Test App')
  checks.push({
    name: '页面标题',
    passed: hasTitle,
    message: hasTitle ? '标题正确' : '标题不正确或缺失'
  })

  // 检查Vue挂载点
  const hasVueMount = html.includes('id="app"')
  checks.push({
    name: 'Vue挂载点',
    passed: hasVueMount,
    message: hasVueMount ? '挂载点存在' : '缺少Vue挂载点'
  })

  // 检查JavaScript引用
  const hasScript = html.includes('<script type="module"')
  checks.push({
    name: 'JavaScript引用',
    passed: hasScript,
    message: hasScript ? 'JS引用存在' : '缺少JS引用'
  })

  // 检查CSS引用
  const hasCss = html.includes('rel="stylesheet"')
  checks.push({
    name: 'CSS引用',
    passed: hasCss,
    message: hasCss ? 'CSS引用存在' : '缺少CSS引用'
  })

  // 检查是否包含测试应用内容
  const hasTestApp = html.includes('YzsKeepAlive') || html.includes('ComponentA') || html.includes('ComponentB')
  checks.push({
    name: '测试应用内容',
    passed: hasTestApp,
    message: hasTestApp ? '包含测试应用内容' : '可能不是测试应用'
  })

  return checks
}

// 运行测试
async function runHttpTest() {
  console.log('运行HTTP测试...\n')

  try {
    // 1. 检查dist目录
    const distDir = path.join(__dirname, 'dist')
    if (!fs.existsSync(distDir)) {
      console.log('❌ dist目录不存在，请先运行 npm run build')
      return false
    }

    // 2. 检查index.html
    const indexPath = path.join(distDir, 'index.html')
    if (!fs.existsSync(indexPath)) {
      console.log('❌ index.html不存在')
      return false
    }

    console.log('✅ 构建文件检查通过')

    // 3. 启动服务器
    await startTestServer()
    console.log('✅ 测试服务器启动成功')

    // 4. 发送HTTP请求
    console.log('发送HTTP请求...')
    const response = await makeHttpRequest()

    console.log(`✅ HTTP响应状态码: ${response.statusCode}`)

    // 5. 分析HTML
    const checks = analyzeHTML(response.data)

    console.log('\n📊 HTML分析结果:')
    console.log('-' .repeat(40))

    let allPassed = true
    checks.forEach((check, index) => {
      const icon = check.passed ? '✅' : '❌'
      console.log(`${icon} ${index + 1}. ${check.name}: ${check.message}`)
      if (!check.passed) {
        allPassed = false
      }
    })

    // 6. 显示HTML片段（调试用）
    if (!allPassed) {
      console.log('\n🔍 HTML片段（前500字符）:')
      console.log('-' .repeat(40))
      console.log(response.data.substring(0, 500))
    }

    return allPassed

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    return false
  } finally {
    // 清理
    stopTestServer()
  }
}

// 主函数
async function main() {
  console.log('开始HTTP服务器测试...\n')

  const passed = await runHttpTest()

  console.log('\n' + '='.repeat(50))
  if (passed) {
    console.log('🎉 HTTP测试通过！服务器响应正常，HTML结构正确。')
    console.log('\n下一步:')
    console.log('1. 运行完整功能测试: node functional-test.js')
    console.log('2. 或直接启动开发服务器: npm run dev')
    console.log('3. 访问 http://localhost:5174 进行手动测试')
  } else {
    console.log('⚠️  HTTP测试失败，请检查构建和服务器配置。')
    console.log('\n建议:')
    console.log('1. 运行构建: npm run build')
    console.log('2. 检查dist目录内容')
    console.log('3. 查看上述错误信息')
  }

  console.log('='.repeat(50))
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    console.error('测试过程错误:', error)
    process.exit(1)
  })
}

module.exports = {
  runHttpTest,
  startTestServer,
  stopTestServer
}