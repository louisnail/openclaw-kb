# 🛠️ Skills 开发指南 - 打造你的专属技能

> 从 0 到 1 创建 OpenClaw Skills

## 📖 什么是 Skill？

Skill 是 OpenClaw 的**扩展能力包**，让 AI 能够：
- 调用外部 API（天气、股票、搜索）
- 操作文件（读写、处理图片、PDF）
- 控制浏览器（自动化任务）
- 连接第三方服务（Feishu、Notion、GitHub）

## 🏗️ Skill 结构

```
my-skill/
├── SKILL.md           # 技能描述（必填）
├── index.js          # 主逻辑代码
├── package.json      # 依赖配置
└── assets/           # 资源文件（可选）
```

## 📝 步骤 1: 创建 SKILL.md

```markdown
# 技能名称

## 描述
一句话说明这个技能做什么

## 触发条件
什么情况下应该激活这个技能

## 使用示例
用户怎么说会触发这个技能
```

**示例** - 天气技能：
```markdown
<skill>
  <name>weather</name>
  <description>获取当前天气和预报（无需 API 密钥）</description>
  <location>/path/to/weather/SKILL.md</location>
</skill>
```

## 💻 步骤 2: 编写主逻辑

```javascript
// index.js 示例 - 天气查询

export async function getWeather(city) {
  // 1. 调用天气 API
  const response = await fetch(`https://api.weather.com/${city}`);
  const data = await response.json();
  
  // 2. 格式化结果
  const result = {
    temp: data.temperature,
    condition: data.condition,
    humidity: data.humidity
  };
  
  // 3. 返回给用户
  return `🌤️ ${city} 当前温度：${result.temp}°C，${result.condition}`;
}
```

## 🔌 步骤 3: 注册 Skill

在 OpenClaw 配置中添加：

```json
{
  "skills": [
    {
      "name": "weather",
      "path": "./skills/weather/SKILL.md",
      "enabled": true
    }
  ]
}
```

## 🎯 完整示例：股票查询 Skill

### SKILL.md
```markdown
<skill>
  <name>stock-watcher</name>
  <description>管理个人股票观察列表，获取实时行情</description>
  <location>/home/user/openclaw/skills/stock-watcher/SKILL.md</location>
</skill>
```

### index.js
```javascript
import { fetch } from 'undici';

// 添加股票到观察列表
export async function addStock(symbol) {
  const watchlist = await loadWatchlist();
  watchlist.push(symbol);
  await saveWatchlist(watchlist);
  return `✅ 已添加 ${symbol} 到观察列表`;
}

// 获取股票价格
export async function getStockPrice(symbol) {
  const response = await fetch(
    `https://api.example.com/stock/${symbol}`
  );
  const data = await response.json();
  return `📈 ${symbol}: ¥${data.price} (${data.change}%)`;
}

// 列出所有观察股票
export async function listStocks() {
  const watchlist = await loadWatchlist();
  const prices = await Promise.all(
    watchlist.map(getStockPrice)
  );
  return prices.join('\n');
}
```

## 🧪 调试技巧

### 1. 本地测试
```bash
# 运行技能测试
node test-skill.js
```

### 2. 日志输出
```javascript
console.log('[DEBUG] 当前状态:', state);
```

### 3. 错误处理
```javascript
try {
  const result = await doSomething();
} catch (error) {
  console.error('技能执行失败:', error);
  return '抱歉，暂时无法完成这个操作';
}
```

## 📚 最佳实践

### ✅ 应该做的
- 保持技能单一职责
- 提供清晰的错误提示
- 添加使用示例
- 处理边界情况

### ❌ 避免的
- 技能过于复杂（拆分成多个）
- 硬编码敏感信息（用环境变量）
- 忽略错误处理
- 没有文档说明

## 🎓 练习任务

1. **入门**: 创建一个"名言警句"Skill，随机返回励志名言
2. **进阶**: 创建一个"待办事项"Skill，支持添加/删除/列出任务
3. **挑战**: 创建一个"新闻摘要"Skill，抓取并总结当日新闻

## 🔗 参考资源

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [示例 Skills 仓库](https://github.com/openclaw/skills)
- [社区贡献指南](CONTRIBUTING.md)

---

**最后更新**: 2026-03-08  
**难度**: ⭐⭐⭐  
**预计时间**: 2 小时
