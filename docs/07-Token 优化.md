# 💰 Token 优化指南 - 省钱就是赚钱

> 用更少的 Token 做更多的事

## 🤔 为什么需要优化 Token？

Token = 钱 💸

| 模型 | 输入价格 | 输出价格 |
|------|----------|----------|
| GPT-4 | $0.03/1K | $0.06/1K |
| Claude | $0.015/1K | $0.075/1K |
| Qwen | ¥0.004/1K | ¥0.012/1K |

**优化 50% = 直接省钱 50%**

## 🎯 优化策略总览

```
1. 提示词优化 ────────→ 减少 30-50%
2. 上下文管理 ────────→ 减少 20-40%
3. 响应控制 ──────────→ 减少 10-30%
4. 缓存复用 ──────────→ 减少 40-60%
```

## 📝 策略 1: 提示词优化

### ❌ 冗长的提示词
```
你好，我希望你能帮我分析一下这个问题。
这是一个关于市场营销的问题，我想知道如何更好地推广我们的产品。
我们的产品是一款新的智能手机应用，主要功能是帮助用户管理时间。
请给我一些建议，越详细越好，最好能分点说明。
谢谢！
```
**Token 数**: ~150

### ✅ 精简的提示词
```
时间管理 APP 的市场推广策略，分点列出
```
**Token 数**: ~15  
**节省**: 90%

### 💡 提示词模板

```markdown
# 角色设定（一次性）
你是资深营销专家

# 任务
{具体任务}

# 约束
- 输出格式：{格式}
- 长度限制：{字数}
- 重点：{关键点}

# 示例（可选）
输入：...
输出：...
```

## 📦 策略 2: 上下文管理

### 问题：上下文越积越多

```
对话 1: 你好 → 20 tokens
对话 2: 今天天气如何？ → 50 tokens
对话 3: 帮我写个邮件... → 200 tokens
...
对话 20: 总计 5000+ tokens 💸
```

### 解决方案 1: 定期清理
```javascript
// 保留最近 N 条消息
const recentMessages = messages.slice(-10);
```

### 解决方案 2: 摘要压缩
```javascript
// 将旧对话压缩成摘要
const summary = await summarize(oldMessages);
context = [summary, ...recentMessages];
```

### 解决方案 3: 分层记忆
```
┌─────────────────┐
│   长期记忆      │ ← 关键信息（少量 tokens）
│   MEMORY.md     │
├─────────────────┤
│   短期记忆      │ ← 最近对话（中等 tokens）
│   last_10_msgs  │
├─────────────────┤
│   工作记忆      │ ← 当前任务（动态清理）
│   current_task  │
└─────────────────┘
```

## 🎛️ 策略 3: 响应控制

### 限制输出长度
```
请用 50 字以内回答
请用 3 个要点总结
输出 JSON 格式，不要多余解释
```

### 指定输出格式
```
❌ "请详细解释..." → 可能输出 1000+ tokens
✅ "用表格列出..." → 结构化，可控
✅ "JSON 格式..." → 精确控制
```

### 使用思维链开关
```javascript
// 简单问题：关闭深度思考
thinking: 'off'

// 复杂问题：开启
thinking: 'on'
```

## 💾 策略 4: 缓存复用

### 相同问题，直接复用
```javascript
const cache = new Map();

async function query(question) {
  if (cache.has(question)) {
    return cache.get(question); // 0 tokens!
  }
  
  const answer = await ai.ask(question);
  cache.set(question, answer);
  return answer;
}
```

### 模板化重复内容
```
❌ 每次都重新生成欢迎语
✅ 预生成，直接复用
```

## 🔧 OpenClaw 内置优化

### 1. memory_search
```javascript
// 语义搜索，只加载相关内容
const results = await memory_search({
  query: "股票分析",
  maxResults: 3  // 只取 top3
});
```

### 2. memory_get
```javascript
// 精确读取，避免加载整个文件
const snippet = await memory_get({
  path: "MEMORY.md",
  from: 10,
  lines: 5  // 只读 5 行
});
```

### 3. sessions_spawn
```javascript
// 复杂任务交给子 agent，主 session 保持轻量
const result = await sessions_spawn({
  task: "分析这份 100 页的报告",
  cleanup: "delete"  // 完成后清理
});
```

## 📊 实战对比

### 场景：分析长文档

**优化前**:
```
1. 读取整个文档 (5000 tokens)
2. 发送完整内容给 AI (5000 tokens)
3. AI 分析输出 (2000 tokens)
总计：12000 tokens
```

**优化后**:
```
1. 提取关键段落 (500 tokens)
2. 发送摘要给 AI (500 tokens)
3. AI 分析输出 (500 tokens)
总计：1500 tokens
节省：87.5% 💰
```

## 🎯 快速检查清单

- [ ] 提示词是否精简？
- [ ] 上下文是否定期清理？
- [ ] 输出格式是否指定？
- [ ] 是否有缓存机制？
- [ ] 是否使用语义搜索？
- [ ] 复杂任务是否拆分？

## 📈 监控建议

```javascript
// 记录每次调用的 token 数
const metrics = {
  totalTokens: 0,
  avgTokens: 0,
  costEstimate: 0
};

function track(tokens) {
  metrics.totalTokens += tokens;
  metrics.avgTokens = metrics.totalTokens / count;
  metrics.costEstimate = metrics.totalTokens * pricePerToken;
}
```

## 💡 高级技巧

### 1. 动态温度调节
```
简单查询 → temperature: 0.3 (省 tokens)
创意写作 → temperature: 0.8 (质量优先)
```

### 2. 流式响应
```javascript
// 提前终止不需要的内容
for await (const chunk of stream) {
  if (enough(chunk)) break; // 及时停止
}
```

### 3. 批量处理
```
❌ 100 个问题单独问 → 100 次 API 调用
✅ 合并成 1 个问题 → 1 次 API 调用
```

---

**最后更新**: 2026-03-08  
**难度**: ⭐⭐  
**预计时间**: 1 小时  
**预计节省**: 30-60% Token
