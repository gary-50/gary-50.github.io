# 2048 游戏

一个功能完整的网页版 2048 游戏，支持手动游戏和 AI 自动模式。

## 功能特性

- **经典游戏玩法**：通过合并相同数字的方块，最终获得 2048 方块
- **流畅动画**：精心设计的方块移动、合并和出现动画
- **AI 自动模式**：内置智能 AI 算法，可自动进行游戏
- **速度控制**：5 档速度调节，从"很慢"到"极快"
- **触摸支持**：完美支持移动设备的滑动操作
- **响应式设计**：自适应不同屏幕尺寸
- **分数记录**：自动保存最高分记录到本地存储

## 在线预览

直接在浏览器中打开 [index.html](index.html) 即可开始游戏。

## 游戏玩法

### 手动模式

- 使用**方向键**（↑ ↓ ← →）控制方块移动
- 在移动设备上，可以**滑动屏幕**控制方向
- 相同数字的方块相遇时会**合并**
- 每次移动后会随机生成一个新方块（2 或 4）
- 达成 2048 方块即为胜利

### 自动模式

1. 点击**"自动模式"**按钮启动 AI 游戏
2. 使用**速度滑块**调节 AI 游戏速度（5 档可选）
3. 点击**"停止自动"**按钮可随时停止

## AI 算法说明

本游戏采用基于**期望值的贪心策略**算法，综合评估以下因素：

- **分数增益**：优先选择能获得更多分数的移动
- **空格数量**：保持棋盘有更多空闲位置
- **单调性**：将大数字排列在一侧，形成有序结构
- **最大值位置**：将最大的方块保持在角落或边缘
- **合并潜力**：考虑相邻相同数字的合并机会

AI 通过模拟所有可能的移动方向，评估每个方向的得分，选择最优解。

## 项目结构

```
2048/
├── index.html      # 主 HTML 文件
├── style.css       # 样式表
├── game.js         # 游戏逻辑和 AI 算法
└── README.md       # 项目文档
```

## 技术实现

### 核心类

#### `Tile` 类

表示游戏中的单个方块，包含：

- 位置信息（行、列）
- 数值
- 合并状态
- 动画状态

#### `Game2048` 类

游戏主控制器，主要方法：

- `init()`: 初始化游戏
- `move(direction)`: 处理方块移动逻辑
- `addRandomTile()`: 随机生成新方块
- `renderTiles()`: 渲染方块到 DOM
- `checkGameOver()`: 检查游戏结束条件
- `getBestMove()`: AI 算法核心，选择最佳移动
- `simulateMove(direction)`: 模拟移动以评估结果
- `evaluateBoard(tiles, scoreGain)`: 评估棋盘状态

### 关键特性实现

**动画系统**

- 使用 CSS `transform` 和 `transition` 实现流畅的移动动画
- CSS 变量 `--tile-x` 和 `--tile-y` 控制方块位置
- 关键帧动画处理出现、合并和移除效果

**触摸支持**

- 监听 `touchstart` 和 `touchend` 事件
- 计算滑动距离和方向
- 最小滑动距离阈值防止误触

**本地存储**

- 使用 `localStorage` 保存最高分
- 页面刷新后自动恢复历史最高分

## 浏览器兼容性

- Chrome/Edge（推荐）
- Firefox
- Safari
- 移动端浏览器

需要支持以下特性：

- ES6 类语法
- CSS Grid 和 Flexbox
- CSS 变量
- Touch Events API
- LocalStorage API

## 自定义修改

### 修改游戏速度

在 [game.js](game.js#L35-L41) 中调整速度设置：

```javascript
this.speedSettings = {
    1: { delay: 1000, label: '很慢' },
    2: { delay: 600, label: '慢速' },
    3: { delay: 300, label: '中速' },
    4: { delay: 150, label: '快速' },
    5: { delay: 50, label: '极快' },
};
```

### 修改方块颜色

在 [style.css](style.css#L327-L393) 中修改不同数值的方块样式：

```css
.tile-2 {
    background: #eee4da;
    color: #776e65;
}
```

### 调整 AI 评估权重

在 [game.js](game.js#L664-L684) 的 `evaluateBoard` 方法中调整各项权重：

```javascript
score += scoreGain * 10; // 分数增益权重
score += emptySpaces * 100; // 空格数量权重
score += this.calculateMonotonicity(tiles) * 50; // 单调性权重
```

## 许可证

本项目仅供学习和研究使用。

## 致谢

- 游戏灵感来自原版 [2048](https://github.com/gabrielecirulli/2048) by Gabriele Cirulli
- AI 算法参考了多种启发式搜索策略

---

享受游戏！如有问题或建议，欢迎反馈。
