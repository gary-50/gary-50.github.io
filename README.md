# 代码助手工具集

## 项目概述

代码助手工具集是一个基于Web的应用程序，提供多种编程辅助工具，目前主要功能是将C++代码转换为Python代码。该工具支持Google的Generative Language API（Gemini模型）和DeepSeek AI的API来实现智能代码转换，并提供详细的代码解释。

![工具截图](https://placeholder-image.com/screenshot.png)

## 主要功能

- **C++到Python代码转换器**：
  - 将C++代码自动转换为等效的Python代码
  - 生成详细的代码解释，包括语法特点和执行逻辑
  - 支持代码高亮显示
  - 可折叠的输入区域，优化界面布局

- **多API提供商支持**：
  - Google AI (Gemini) API支持
  - DeepSeek AI API支持
  - 支持不同模型选择

- **设置管理**：
  - API密钥管理（支持配置多个Google API密钥，自动轮换使用）
  - DeepSeek API密钥配置
  - AI模型选择
  - 偏好设置持久化

- **界面功能**：
  - 明/暗主题切换
  - 响应式设计，适应不同尺寸的屏幕
  - 标签页系统，方便查看代码和解释

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **外部库**：
  - Feather Icons：轻量级图标库
  - Marked：Markdown解析库
  - Highlight.js：代码语法高亮
  - Google Fonts：字体资源
- **API**：
  - Google Generative Language API (Gemini)
  - DeepSeek AI API

## 使用指南

### 先决条件

要使用本工具，您需要：

1. 一个或多个Google AI（Gemini）API密钥，或者一个DeepSeek AI API密钥
2. 现代网页浏览器（Chrome, Firefox, Edge等）

### 安装

本应用为纯前端应用，无需安装，只需通过浏览器打开HTML文件即可使用。

### 配置

1. 打开"设置"页面
2. 选择API提供商（Google AI或DeepSeek AI）
3. 添加您的API密钥：
   - 对于Google AI，可以添加多个API密钥以轮换使用
   - 对于DeepSeek AI，添加您的API密钥
4. 选择您想要使用的AI模型
5. 点击"保存设置"按钮

### 使用C++到Python转换器

1. 打开"C++转Python"页面
2. 在左侧文本框中粘贴您的C++代码
3. 点击"转换代码"按钮
4. 在右侧查看生成的Python代码和详细解释
5. 可以通过标签页切换查看不同的内容
6. 可以通过折叠按钮优化界面布局

## 项目结构

```
/
├── index.html          # 主页
├── pages/              # 页面目录
│   ├── cpp-to-python.html  # C++到Python转换工具页面
│   └── settings.html       # 设置页面
├── assets/             # 资源目录
│   ├── css/
│   │   └── style.css      # 全局样式表 
│   └── js/
│       ├── common.js       # 共享JavaScript功能（主题等）
│       ├── cpp-to-python.js # C++到Python转换逻辑
│       └── settings.js     # 设置页面逻辑
└── README.md           # 项目文档
```

## 特性与原理

### API提供商切换

系统支持在Google AI和DeepSeek AI之间切换，以利用不同提供商的特性和优势。对于不同的提供商，系统会自动调整API请求格式和参数。

### API密钥轮换机制

为避免单个API密钥使用频率过高导致的限制，系统支持配置多个Google API密钥，并在每次请求时轮换使用不同的密钥。

### 代码高亮与编辑体验优化

系统使用Highlight.js提供实时代码高亮，支持行号显示，Tab键缩进，为用户提供更好的代码编辑体验。

### 响应式设计

界面采用响应式设计，可以自适应桌面和移动设备的不同屏幕尺寸。在小屏设备上会自动调整布局以优化用户体验。

### 暗色/亮色主题

系统支持暗色和亮色两种主题，并会记住用户的主题偏好。主题切换通过CSS变量实现，确保整体视觉一致性。

## 未来计划

以下功能计划在未来版本中实现：

- SQL优化助手
- 正则表达式生成器
- 代码注释生成器
- 更多语言之间的代码转换

## 注意事项

- 本工具需要有效的API密钥才能使用
- 转换结果的质量取决于所使用的AI模型
- 对于非常复杂的代码，可能需要手动调整转换结果
- 确保API密钥保密，不要在公共环境下使用或分享

## 许可证

[MIT](https://opensource.org/licenses/MIT)
