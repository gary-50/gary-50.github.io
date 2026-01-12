# 我的工具箱

一个集合了游戏和实用工具的个人网站项目。

## 项目结构

```
my_website/
├── index.html          # 主页导航
├── main.css           # 全局样式
├── theme.js           # 统一主题切换脚本
├── games/             # 游戏目录
│   └── 2048/         # 2048游戏
│       ├── index.html
│       ├── game.js
│       ├── style.css
│       └── README.md
├── tools/             # 工具目录
│   ├── api-tester/   # API Key测试工具
│   │   ├── index.html
│   │   ├── script.js
│   │   ├── styles.css
│   │   └── README.md
│   └── pomodoro/     # 番茄钟
│       ├── index.html
│       ├── script.js
│       └── styles.css
└── README.md         # 本文件
```

## 功能模块

### 游戏娱乐

#### 2048 游戏
- 经典的数字合并游戏
- 支持键盘方向键和触摸滑动操作
- 内置AI自动模式，可调节速度
- 精美的UI设计和流畅的动画效果
- 本地存储最高分记录
- 支持深色/浅色主题切换

### 效率工具

#### 番茄钟
- 专注工作的时间管理工具
- 支持工作、短休息、长休息三种模式
- 可自定义各模式时长
- 任务列表管理
- 今日历史记录
- 统计功能（今日完成、总计、连击）
- 声音提醒和桌面通知
- 支持深色/浅色主题切换

### 开发工具

#### API Key 测试工具
- 批量测试 OpenAI 格式的 API 密钥
- 支持自定义 API 地址和模型名称
- 并行测试功能，可调节并发数量
- 支持从文件导入密钥
- 自动去重和分类显示结果
- 支持深色/浅色主题切换

## 特性

- **统一主题系统**：所有页面支持深色/浅色模式切换，设置自动同步
- **统一导航**：每个工具页面都有返回主页按钮
- **响应式设计**：适配桌面和移动设备
- **无依赖**：纯 HTML/CSS/JavaScript 实现

## 使用方法

1. 直接在浏览器中打开 `index.html` 文件
2. 点击相应的卡片进入对应的工具或游戏
3. 每个模块都可以独立使用
4. 点击右上角按钮切换深色/浅色主题
5. 点击左上角按钮返回主页（工具页面）

## 本地运行

### 方式一：直接打开
直接双击 `index.html` 文件在浏览器中打开

### 方式二：使用本地服务器
```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js (需要安装 http-server)
npx http-server

# 使用 PHP
php -S localhost:8000
```

然后在浏览器中访问 `http://localhost:8000`

## 扩展说明

项目采用模块化设计，便于后续扩展：

- **添加新游戏**：在 `games/` 目录下创建新文件夹，并在主页添加对应卡片
- **添加新工具**：在 `tools/` 目录下创建新文件夹，并在主页添加对应卡片
- **修改样式**：编辑 `main.css` 文件可以统一调整主页样式
- **主题支持**：新页面引入 `theme.js` 并添加主题切换按钮即可支持主题切换

### 添加新模块示例

在 `index.html` 的对应 section 中添加新卡片：

```html
<a href="tools/your-tool/index.html" class="card tool-card">
    <div class="card-icon">🔧</div>
    <h3 class="card-title">工具名称</h3>
    <p class="card-description">工具描述</p>
    <div class="card-tags">
        <span class="tag">标签1</span>
        <span class="tag">标签2</span>
    </div>
</a>
```

## 技术栈

- 纯 HTML/CSS/JavaScript
- 无需任何框架或构建工具
- 响应式设计，支持移动端
- CSS 变量实现主题切换
- 使用 Google Fonts (Poppins)

## 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari
- 移动端浏览器

## 许可

本项目仅供个人学习和使用。

## 更新日志

### 2025-01-13
- 添加统一的深色/浅色主题切换系统
- 所有页面支持主题同步
- 添加返回主页按钮到所有工具页面
- 优化 2048 游戏浅色模式下的棋子配色
- 修复自动模式速度控制显示问题

### 2025-10-23
- 初始版本发布
- 集成 2048 游戏
- 集成 API Key 测试工具
- 添加番茄钟工具
- 创建统一的导航主页
