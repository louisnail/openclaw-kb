#!/bin/bash

# 文档配置
docs=(
  "01-安装指南:📦 安装指南:15 分钟|难度 ⭐:零基础安装教程，15 分钟快速部署 OpenClaw 环境"
  "02-快速开始:🚀 快速开始:30 分钟|难度 ⭐:发送第一条消息，理解基本概念，配置常用功能"
  "03-配置详解:⚙️ 配置详解:1 小时|难度 ⭐⭐:完全掌握配置文件，渠道接入，模型配置，环境变量"
  "04-提示词工程:💬 提示词工程:1 小时|难度 ⭐⭐:设计更好的提示词，获得更好的 AI 回复质量"
  "05-Skills 开发:🛠️ Skills 开发:2 小时|难度 ⭐⭐⭐:从 0 到 1 创建自定义 Skills，扩展 AI 能力"
  "06-定时任务:⏰ 定时任务:45 分钟|难度 ⭐⭐:配置 Cron Jobs，让 AI 自动执行定时任务"
  "07-Token 优化:💰 Token 优化:1 小时|难度 ⭐⭐⭐:省钱就是赚钱，优化 Token 使用降低 30-60% 成本"
  "08-最佳实践:🏆 最佳实践:1 小时|难度 ⭐⭐:来自社区的经验总结，架构、开发、运维全涵盖"
)

for doc in "${docs[@]}"; do
  IFS=':' read -r filename title meta description <<< "$doc"
  
  # 读取 Markdown 内容
  md_content=$(cat "docs/${filename}.md" 2>/dev/null || echo "# ${title}\n\n${description}")
  
  # 创建 HTML（简化版，实际应该用 pandoc 转换）
  cat > "docs/${filename}.html" << HTMLEOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - OpenClaw 知识库</title>
  <style>
    :root { --primary: #2563eb; --secondary: #64748b; --bg: #f1f5f9; --card-bg: #ffffff; --text: #0f172a; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: var(--text); line-height: 1.6; }
    .navbar { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }
    .navbar-content { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .navbar-brand { font-size: 1.5rem; font-weight: 700; color: var(--primary); text-decoration: none; }
    .navbar-nav { display: flex; gap: 2rem; list-style: none; }
    .navbar-nav a { color: var(--secondary); text-decoration: none; font-weight: 500; }
    .navbar-nav a:hover { color: var(--primary); }
    .container { max-width: 1000px; margin: 0 auto; padding: 3rem 2rem; }
    .doc-content { background: var(--card-bg); border-radius: 16px; padding: 3rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .doc-content h1 { color: var(--primary); font-size: 2.5rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 3px solid var(--primary); }
    .doc-content h2 { color: var(--primary); font-size: 1.8rem; margin: 2.5rem 0 1rem; }
    .doc-content h3 { color: var(--text); font-size: 1.4rem; margin: 2rem 0 0.8rem; }
    .doc-content p { margin: 1rem 0; color: #475569; font-size: 1.05rem; }
    .doc-content ul, .doc-content ol { margin: 1rem 0; padding-left: 2rem; color: #475569; }
    .doc-content code { background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px; font-family: 'Monaco', 'Consolas', monospace; font-size: 0.9em; color: #e11d48; }
    .doc-content pre { background: #1e293b; color: #f1f5f9; padding: 1.5rem; border-radius: 8px; overflow-x: auto; margin: 1.5rem 0; }
    .doc-content pre code { background: transparent; color: inherit; padding: 0; }
    .doc-content blockquote { border-left: 4px solid var(--primary); padding-left: 1.5rem; margin: 1.5rem 0; color: var(--secondary); font-style: italic; }
    .doc-content a { color: var(--primary); text-decoration: none; }
    .doc-content a:hover { text-decoration: underline; }
    .doc-nav { margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between; }
    .doc-nav a { color: var(--primary); font-weight: 600; }
    footer { background: rgba(0,0,0,0.2); color: white; text-align: center; padding: 2rem; margin-top: 4rem; }
    footer a { color: white; text-decoration: underline; }
    @media (max-width: 768px) { .navbar-nav { display: none; } .doc-content { padding: 2rem 1.5rem; } }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="navbar-content">
      <a href="../index.html" class="navbar-brand">🐾 OpenClaw 知识库</a>
      <ul class="navbar-nav">
        <li><a href="../index.html">首页</a></li>
        <li><a href="docs.html">文档中心</a></li>
        <li><a href="../skills.html">Skills 示例</a></li>
        <li><a href="../mindmaps.html">知识脑图</a></li>
        <li><a href="../videos.html">视频资源</a></li>
      </ul>
    </div>
  </nav>
  <div class="container">
    <article class="doc-content">
      <h1>${title}</h1>
      <p style="font-size: 1.2rem; color: var(--secondary); margin-bottom: 2rem;">⏱️ ${meta}</p>
      <blockquote><p>${description}</p></blockquote>
      <div style="margin-top: 2rem; padding: 2rem; background: #f1f5f9; border-radius: 8px; text-align: center;">
        <h2 style="color: var(--primary);">📝 文档内容</h2>
        <p>本文档完整内容请查看 Markdown 源文件或等待后续完善</p>
        <p style="margin-top: 1rem;"><a href="${filename}.md" style="color: var(--primary);">查看 Markdown 原文 →</a></p>
      </div>
      <div class="doc-nav">
        <a href="../docs.html">← 返回文档中心</a>
        <a href="../index.html">返回首页 →</a>
      </div>
    </article>
  </div>
  <footer>
    <p>🐾 OpenClaw 知识库 | MIT License</p>
    <p style="margin-top: 0.5rem;"><a href="https://github.com/cchen1-08/openclaw-kb">GitHub</a> · <a href="https://docs.openclaw.ai">官方文档</a> · <a href="https://discord.com/invite/clawd">Discord 社区</a></p>
  </footer>
</body>
</html>
HTMLEOF
  
  echo "✅ Created: docs/${filename}.html"
done

echo "🎉 All docs created!"
