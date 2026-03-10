# GitHub 账号创建与项目 Fork 指南

## 一、创建 GitHub 账号

### 1. 访问官网
打开 https://github.com

### 2. 点击注册
点击右上角的 **"Sign up"** 按钮

### 3. 填写信息
```
Username: luolipu（或你喜欢的名字）
Email: 你的邮箱地址
Password: 强密码（至少8位，包含大小写+数字）
```

### 4. 验证邮箱
- 登录你的邮箱
- 查找来自 GitHub 的验证邮件
- 点击邮件中的验证链接

### 5. 选择计划
选择 **"Free"**（免费版）

---

## 二、Fork 项目

### 方法 A：网页 Fork（推荐）

1. 登录 GitHub
2. 访问 https://github.com/cchen1-08/openclaw-kb
3. 点击右上角的 **"Fork"** 按钮
4. 选择你的账号
5. 等待 Fork 完成

### 方法 B：命令行 Fork

```bash
# 安装 GitHub CLI
sudo apt install gh

# 登录 GitHub
gh auth login

# Fork 项目
gh repo fork cchen1-08/openclaw-kb --clone=true
```

---

## 三、本地配置

### 1. 克隆你的 Fork

```bash
# 替换 YOUR_USERNAME 为你的 GitHub 用户名
git clone https://github.com/YOUR_USERNAME/openclaw-kb.git
cd openclaw-kb
```

### 2. 配置上游仓库

```bash
# 添加原始仓库作为上游
git remote add upstream https://github.com/cchen1-08/openclaw-kb.git

# 验证远程仓库
git remote -v
```

### 3. 配置 Git 用户信息

```bash
git config user.name "你的名字"
git config user.email "你的邮箱"
```

---

## 四、开发工作流

### 日常开发流程

```bash
# 1. 获取上游更新
git fetch upstream
git checkout main
git merge upstream/main

# 2. 创建功能分支
git checkout -b feature/ui-redesign

# 3. 进行修改
# ... 编辑文件 ...

# 4. 提交更改
git add .
git commit -m "feat: 优化首页 UI 设计"

# 5. 推送到你的 Fork
git push origin feature/ui-redesign

# 6. 在 GitHub 上创建 Pull Request（可选）
```

---

## 五、GitHub Pages 部署

### 启用 GitHub Pages

1. 进入你的 Fork 仓库
2. 点击 **Settings** → **Pages**
3. **Source** 选择 "Deploy from a branch"
4. **Branch** 选择 "main" → "/ (root)"
5. 点击 **Save**

### 访问你的站点

```
https://YOUR_USERNAME.github.io/openclaw-kb/
```

---

## 六、常见问题

### Q1: 忘记密码怎么办？
访问 https://github.com/password_reset

### Q2: 如何启用双重验证？
Settings → Security → Two-factor authentication

### Q3: 如何删除 Fork？
仓库 Settings → Danger Zone → Delete this repository

### Q4: 如何同步上游更新？
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## 七、推荐工具

### Git 客户端
- **GitHub Desktop**（图形界面，适合新手）
- **VS Code + Git 插件**（代码编辑器内置）
- **SourceTree**（高级图形界面）

### 浏览器插件
- **Octotree**（GitHub 文件树）
- **Refined GitHub**（增强功能）

---

## 八、完成检查清单

- [ ] 创建 GitHub 账号
- [ ] 验证邮箱
- [ ] Fork openclaw-kb 项目
- [ ] 克隆到本地
- [ ] 配置上游仓库
- [ ] 启用 GitHub Pages
- [ ] 访问你的站点确认正常

---

**需要帮助？** 随时告诉我你的 GitHub 用户名，我可以协助后续配置！
