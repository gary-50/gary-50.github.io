# 代码助手工具集

## 项目概述

代码助手工具集是一个功能强大的Web应用，为开发者提供多种编程辅助工具。核心功能包括多语言代码转换、智能代码生成，以及全面的AI服务导航站。本工具集支持主流编程语言，并集成了Google Gemini和DeepSeek AI的大语言模型能力。

## 主要功能

### 多语言代码转换器
- 支持六种主流编程语言的相互转换：Python、C++、C、Java、Rust和Go
- 提供详细的代码转换解释，包括语法差异和实现逻辑分析
- 增强的代码编辑体验：语法高亮、行号显示、Tab键支持
- 可折叠的输入区域，优化屏幕空间利用
- 双标签页查看（代码和解释）

### 智能代码生成器
- 根据自然语言描述生成七种编程语言的代码：Python、C++、C、Java、Rust、Go和MATLAB
- 附带详细的代码实现解释和使用说明
- 适用于算法实现、功能开发和常见编程任务
- 同样支持增强的代码查看体验

### AI导航站
- 提供全面的AI对话模型服务导航，包括：
  - 官方平台：ChatGPT、Claude、Grok、Google AI Studio等
  - 第三方平台：GitHub Copilot models、GenSpark、XUB等
- API服务导航，覆盖：
  - 官方API：Deepseek API、OAIPro、xAI API、Google AI Studio API等
  - 第三方API：Free40、PoloAI等
- 特色工具推荐：Cherry Studio、Dify、Silly Tavern
- 详细对比各AI模型的优缺点和适用场景
- 提供官方链接和使用注意事项

### AI服务集成
- **Google AI (Gemini) API**
  - 支持多API密钥轮换使用，避免单密钥限制
  - 多种Gemini模型选择，包括：
    - gemini-2.0-pro-exp-02-05（默认）
    - gemini-2.0-flash-thinking-exp-01-21
    - gemini-2.0-flash

- **DeepSeek AI API**
  - 支持DeepSeek的高级语言模型：
    - DeepSeek-Reasoner（默认）
    - DeepSeek-Chat

### 用户体验功能
- 深色/浅色主题切换，自动记忆用户偏好
- 响应式设计，适配桌面和移动设备
- 直观的标签页界面，便于在代码和解释之间切换
- 友好的设置界面，轻松配置API服务
- AI导航站的移动端适配和目录快捷导航

## 技术栈

- **前端技术**：HTML5, CSS3, JavaScript (ES6+)
- **UI组件**：
  - Feather Icons：轻量级矢量图标库
  - Highlight.js：代码语法高亮
  - Marked：Markdown解析与渲染
  - Google Fonts：Web字体（Inter和Fira Code）
- **API集成**：
  - Google Generative Language API (Gemini)
  - DeepSeek AI API

## 使用指南

### 使用前准备

1. **API密钥获取**：
   - Google AI (Gemini) API密钥 [获取地址](https://aistudio.google.com/)
   - 或 DeepSeek AI API密钥 [获取地址](https://platform.deepseek.com/)

2. **开始使用**：
   - 确保使用现代浏览器（Chrome、Firefox、Edge等）

### 功能配置

1. 打开"设置"页面
2. 选择API提供商（Google AI或DeepSeek AI）
3. 添加API密钥：
   - Google AI：最多可添加5个API密钥进行轮换使用
   - DeepSeek AI：添加单个API密钥
4. 选择合适的AI模型
5. 保存设置

### 使用代码转换器

1. 导航至"代码转换器"页面
2. 在输入区域粘贴或输入源代码
3. 选择源代码语言和目标转换语言
4. 点击"转换代码"按钮
5. 查看转换结果：
   - "代码"标签页：显示转换后的代码
   - "详细解释"标签页：查看转换解释和语言特性对比

### 使用代码生成器

1. 导航至"代码生成器"页面
2. 在需求描述区域详细说明您需要的代码功能
3. 选择目标编程语言
4. 点击"生成代码"按钮
5. 查看生成结果：
   - "代码"标签页：显示生成的代码
   - "详细解释"标签页：查看代码实现原理和使用说明

### 使用AI导航站

1. 导航至"AI导航站"页面
2. 浏览不同类别的AI服务：
   - 对话模型服务（官方平台和第三方平台）
   - API服务（官方API和第三方API）
   - 特色工具
3. 点击相应链接访问所需服务
4. 移动设备用户可点击左上角菜单按钮展开导航目录

## 项目结构

```
/
├── index.html              # 主页面
├── pages/                  # 功能页面目录
│   ├── code-converter.html # 代码转换器页面
│   ├── code-generator.html # 代码生成器页面
│   ├── ai_navigation.html  # AI导航站页面
│   └── settings.html       # 设置页面
├── assets/                 # 资源文件目录
│   ├── css/
│   │   └── style.css       # 全局样式表
│   └── js/
│       ├── common.js       # 共享功能（主题、UI等）
│       ├── code-converter.js # 代码转换逻辑
│       ├── code-generator.js # 代码生成逻辑
│       └── settings.js     # 设置管理逻辑
└── README.md               # 项目文档
```

## 核心特性与实现原理

### API提供商灵活切换

系统支持在Google AI和DeepSeek AI之间无缝切换，通过统一的接口封装，根据不同的API提供商动态调整请求格式和参数，实现对用户透明的服务切换。

### API密钥轮换机制

针对Google AI的使用频率限制，系统实现了智能API密钥轮换功能：
- 支持配置多达5个API密钥
- 自动循环使用所有可用密钥
- 均衡分配请求负载，避免单个密钥超出使用限制

### 增强的代码编辑体验

- 实时语法高亮：支持7种编程语言的实时高亮显示
- 行号显示与同步：编辑和滚动时保持行号对齐
- Tab键智能缩进：支持4空格缩进
- 代码折叠：优化屏幕空间利用

### 智能主题系统

- 支持深色和浅色两种主题
- 记忆用户主题偏好（LocalStorage存储）
- 跨页面和会话保持主题一致性
- 平滑过渡动画，提升视觉体验

### 响应式设计实现

针对不同屏幕尺寸优化的界面布局：
- 桌面设备：并排双栏布局，高效利用宽屏空间
- 移动设备：自适应单列布局，优先展示核心功能
- 动态调整元素大小和位置，保证各种设备上的良好体验

## 计划功能

未来版本计划实现的功能：

- **正则表达式生成器**：通过自然语言描述生成正则表达式
- **更多编程语言支持**：扩展对更多编程语言的支持
- **AI导航站增强**：添加更多AI服务评测和使用指南，实现服务状态监控
- **个人收藏功能**：允许用户收藏和组织常用的AI服务

## 使用注意事项

- 本工具需要有效的API密钥才能运行，请确保配置正确的API凭据
- 生成和转换结果的质量取决于所使用的AI模型能力
- 对于非常复杂的代码，可能需要手动调整AI生成的结果
- AI导航站中列出的服务可能会随时变化，使用前建议检查服务状态
- 使用第三方AI服务时请注意账号和数据安全
- 建议在本地或私有环境中使用，避免API密钥泄露
- 对于生产环境代码，请始终进行人工审查和测试

## 许可证

[MIT](https://opensource.org/licenses/MIT)