class Tile {
    constructor(position, value) {
        this.id = Date.now() + Math.random();
        this.position = position; // {row, col}
        this.value = value;
        this.previousPosition = null;
        this.mergedFrom = null;
        this.isNew = true;
    }
}

class Game2048 {
    constructor() {
        this.size = 4;
        this.tiles = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessage = document.getElementById('game-message');
        this.messageText = document.getElementById('message-text');
        this.isMoving = false;

        // 触摸滑动支持
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;

        // 自动模式
        this.autoPlayMode = false;
        this.autoPlayTimer = null;
        this.autoPlaySpeed = 600; // 毫秒，控制自动游戏速度
        this.speedSettings = {
            1: { delay: 1000, label: '很慢' },
            2: { delay: 600, label: '慢速' },
            3: { delay: 300, label: '快速' }
        };

        this.init();
    }

    init() {
        this.bestScoreElement.textContent = this.bestScore;
        this.setupEventListeners();
        this.addRandomTile();
        this.addRandomTile();
        this.renderTiles();
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key.startsWith('Arrow')) {
                e.preventDefault();
                if (!this.isMoving) {
                    this.handleKeyPress(e.key);
                }
            }
        });

        // 新游戏按钮
        document.getElementById('new-game').addEventListener('click', () => {
            this.restart();
        });

        // 重试按钮
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.restart();
        });

        // 自动模式按钮
        document.getElementById('auto-play').addEventListener('click', () => {
            this.toggleAutoPlay();
        });

        // 速度滑块
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');

        speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            this.autoPlaySpeed = this.speedSettings[speed].delay;
            speedValue.textContent = this.speedSettings[speed].label;
        });

        // 触摸事件
        this.tileContainer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        this.tileContainer.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.touchEndY = e.changedTouches[0].screenY;
            if (!this.isMoving) {
                this.handleSwipe();
            }
        }, { passive: true });
    }

    handleSwipe() {
        const diffX = this.touchEndX - this.touchStartX;
        const diffY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 30;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            }
        } else {
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }
        }
    }

    handleKeyPress(key) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        const direction = keyMap[key];
        if (direction) {
            this.move(direction);
        }
    }

    move(direction) {
        if (this.isMoving) return;

        this.prepareTiles();

        const vectors = {
            'up': { row: -1, col: 0 },
            'down': { row: 1, col: 0 },
            'left': { row: 0, col: -1 },
            'right': { row: 0, col: 1 }
        };

        const vector = vectors[direction];
        const traversals = this.buildTraversals(vector);

        let moved = false;

        traversals.row.forEach(row => {
            traversals.col.forEach(col => {
                const tile = this.getTileAt({ row, col });

                if (tile) {
                    const positions = this.findFarthestPosition({ row, col }, vector);
                    const next = this.getTileAt(positions.next);

                    if (next && next.value === tile.value && !next.mergedFrom) {
                        // 合并方块
                        const merged = new Tile(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next];
                        merged.isNew = false;

                        this.tiles.push(merged);
                        this.removeTile(tile);
                        this.removeTile(next);

                        tile.position = positions.next;

                        this.score += merged.value;
                        this.updateScore();

                        moved = true;
                    } else {
                        // 移动方块
                        if (positions.farthest.row !== tile.position.row ||
                            positions.farthest.col !== tile.position.col) {
                            tile.position = positions.farthest;
                            moved = true;
                        }
                    }
                }
            });
        });

        if (moved) {
            this.isMoving = true;
            this.renderTiles();

            setTimeout(() => {
                this.addRandomTile();
                this.renderTiles();
                this.isMoving = false;
                this.checkGameOver();
            }, 250);
        }
    }

    prepareTiles() {
        this.tiles.forEach(tile => {
            tile.previousPosition = null;
            tile.mergedFrom = null;
            tile.isNew = false;
        });
    }

    buildTraversals(vector) {
        const traversals = { row: [], col: [] };

        for (let pos = 0; pos < this.size; pos++) {
            traversals.row.push(pos);
            traversals.col.push(pos);
        }

        if (vector.row === 1) traversals.row = traversals.row.reverse();
        if (vector.col === 1) traversals.col = traversals.col.reverse();

        return traversals;
    }

    findFarthestPosition(position, vector) {
        let previous;

        do {
            previous = position;
            position = {
                row: previous.row + vector.row,
                col: previous.col + vector.col
            };
        } while (this.withinBounds(position) && !this.getTileAt(position));

        return {
            farthest: previous,
            next: position
        };
    }

    withinBounds(position) {
        return position.row >= 0 && position.row < this.size &&
               position.col >= 0 && position.col < this.size;
    }

    getTileAt(position) {
        return this.tiles.find(tile =>
            tile.position.row === position.row &&
            tile.position.col === position.col
        );
    }

    removeTile(tile) {
        const index = this.tiles.indexOf(tile);
        if (index !== -1) {
            this.tiles.splice(index, 1);
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (!this.getTileAt({ row, col })) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length > 0) {
            const position = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            const tile = new Tile(position, value);
            this.tiles.push(tile);
        }
    }

    renderTiles() {
        // 清除所有已删除的方块
        const tileElements = this.tileContainer.querySelectorAll('.tile');
        tileElements.forEach(element => {
            const tileId = parseFloat(element.dataset.tileId);
            const tileExists = this.tiles.some(tile => tile.id === tileId);

            if (!tileExists) {
                element.classList.add('tile-removed');
                setTimeout(() => element.remove(), 250);
            }
        });

        // 渲染所有方块
        this.tiles.forEach(tile => {
            let tileElement = this.tileContainer.querySelector(`[data-tile-id="${tile.id}"]`);
            const isNewElement = !tileElement;

            if (isNewElement) {
                // 创建新方块
                tileElement = this.createTileElement(tile);
                this.tileContainer.appendChild(tileElement);

                // 强制浏览器重排，确保初始位置被渲染
                void tileElement.offsetHeight;
            } else {
                // 更新现有方块
                this.updateTileElement(tileElement, tile);

                // 设置位置
                const position = this.getTilePosition(tile.position.row, tile.position.col);

                // 更新CSS变量
                tileElement.style.setProperty('--tile-x', `${position.x}px`);
                tileElement.style.setProperty('--tile-y', `${position.y}px`);

                // 已存在的方块使用 requestAnimationFrame 确保动画触发
                requestAnimationFrame(() => {
                    tileElement.style.transform = `translate(${position.x}px, ${position.y}px)`;
                });
            }
        });
    }

    createTileElement(tile) {
        const element = document.createElement('div');
        element.className = 'tile';
        element.dataset.tileId = tile.id;

        // 添加颜色类
        if (tile.value <= 2048) {
            element.classList.add(`tile-${tile.value}`);
        } else {
            element.classList.add('tile-super');
        }

        element.textContent = tile.value;

        // 初始位置
        const position = this.getTilePosition(tile.position.row, tile.position.col);

        // 设置CSS变量用于动画
        element.style.setProperty('--tile-x', `${position.x}px`);
        element.style.setProperty('--tile-y', `${position.y}px`);
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;

        // 新方块动画
        if (tile.isNew) {
            element.classList.add('tile-new');
        }

        // 合并动画
        if (tile.mergedFrom) {
            element.classList.add('tile-merged');
        }

        return element;
    }

    updateTileElement(element, tile) {
        // 更新值和颜色
        if (parseInt(element.textContent) !== tile.value) {
            element.textContent = tile.value;

            // 移除旧的颜色类
            element.className = 'tile';

            // 添加新的颜色类
            if (tile.value <= 2048) {
                element.classList.add(`tile-${tile.value}`);
            } else {
                element.classList.add('tile-super');
            }

            // 添加合并动画
            if (tile.mergedFrom) {
                element.classList.add('tile-merged');
                setTimeout(() => {
                    element.classList.remove('tile-merged');
                }, 200);
            }
        }
    }

    getTilePosition(row, col) {
        const cellSize = 106.25;
        const gap = 15;

        // 在小屏幕上调整大小
        const screenWidth = window.innerWidth;
        if (screenWidth <= 520) {
            const adjustedCellSize = 70;
            const adjustedGap = 10;
            return {
                x: col * (adjustedCellSize + adjustedGap),
                y: row * (adjustedCellSize + adjustedGap)
            };
        }

        return {
            x: col * (cellSize + gap),
            y: row * (cellSize + gap)
        };
    }

    updateScore() {
        this.scoreElement.textContent = this.score;

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreElement.textContent = this.bestScore;
            localStorage.setItem('bestScore', this.bestScore);
        }
    }

    checkGameOver() {
        // 检查是否赢了
        if (this.tiles.some(tile => tile.value === 2048)) {
            this.showMessage('你赢了！');
            return;
        }

        // 检查是否还有空格
        if (this.tiles.length < this.size * this.size) {
            return;
        }

        // 检查是否还能合并
        for (let tile of this.tiles) {
            const directions = [
                { row: 0, col: 1 },  // 右
                { row: 1, col: 0 }   // 下
            ];

            for (let direction of directions) {
                const neighbor = {
                    row: tile.position.row + direction.row,
                    col: tile.position.col + direction.col
                };

                if (this.withinBounds(neighbor)) {
                    const neighborTile = this.getTileAt(neighbor);
                    if (neighborTile && neighborTile.value === tile.value) {
                        return;
                    }
                }
            }
        }

        // 游戏结束
        this.showMessage('游戏结束！');
    }

    showMessage(message) {
        this.messageText.textContent = message;
        this.gameMessage.classList.add('show');

        // 游戏结束时停止自动模式
        if (this.autoPlayMode) {
            this.stopAutoPlay();
        }
    }

    restart() {
        this.tiles = [];
        this.score = 0;
        this.isMoving = false;
        this.scoreElement.textContent = this.score;
        this.gameMessage.classList.remove('show');
        this.tileContainer.innerHTML = '';
        this.addRandomTile();
        this.addRandomTile();
        this.renderTiles();

        // 如果是自动模式，重新开始自动游戏
        if (this.autoPlayMode) {
            setTimeout(() => {
                this.startAutoPlay();
            }, 500);
        }
    }

    // ============= 自动模式相关方法 =============

    toggleAutoPlay() {
        this.autoPlayMode = !this.autoPlayMode;
        const autoPlayBtn = document.getElementById('auto-play');

        if (this.autoPlayMode) {
            autoPlayBtn.textContent = '停止自动';
            autoPlayBtn.classList.add('active');
            this.startAutoPlay();
        } else {
            autoPlayBtn.textContent = '自动模式';
            autoPlayBtn.classList.remove('active');
            this.stopAutoPlay();
        }
    }

    startAutoPlay() {
        if (this.autoPlayMode && !this.gameMessage.classList.contains('show')) {
            this.executeAIMove();
        }
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearTimeout(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    executeAIMove() {
        if (!this.autoPlayMode || this.isMoving) {
            return;
        }

        const bestDirection = this.getBestMove();

        if (bestDirection) {
            this.move(bestDirection);

            // 等待移动完成后继续
            this.autoPlayTimer = setTimeout(() => {
                if (this.autoPlayMode && !this.gameMessage.classList.contains('show')) {
                    this.executeAIMove();
                }
            }, this.autoPlaySpeed);
        } else {
            // 没有可用的移动，游戏结束
            this.stopAutoPlay();
        }
    }

    // AI算法：基于期望值的贪心策略
    getBestMove() {
        const directions = ['up', 'down', 'left', 'right'];
        let bestDirection = null;
        let bestScore = -1;

        for (let direction of directions) {
            const simulation = this.simulateMove(direction);

            if (simulation.moved) {
                // 评估这个移动的质量
                const score = this.evaluateBoard(simulation.tiles, simulation.scoreGain);

                if (score > bestScore) {
                    bestScore = score;
                    bestDirection = direction;
                }
            }
        }

        return bestDirection;
    }

    // 模拟一次移动
    simulateMove(direction) {
        // 保存当前状态
        const originalTiles = JSON.parse(JSON.stringify(
            this.tiles.map(t => ({ position: t.position, value: t.value }))
        ));

        const vectors = {
            'up': { row: -1, col: 0 },
            'down': { row: 1, col: 0 },
            'left': { row: 0, col: -1 },
            'right': { row: 0, col: 1 }
        };

        const vector = vectors[direction];
        const traversals = this.buildTraversals(vector);

        let moved = false;
        let scoreGain = 0;
        let simulatedTiles = JSON.parse(JSON.stringify(originalTiles));

        // 创建一个辅助函数来获取模拟的方块
        const getTileAt = (tiles, position) => {
            return tiles.find(tile =>
                tile.position.row === position.row &&
                tile.position.col === position.col
            );
        };

        traversals.row.forEach(row => {
            traversals.col.forEach(col => {
                const tileIndex = simulatedTiles.findIndex(t =>
                    t.position.row === row && t.position.col === col
                );

                if (tileIndex !== -1) {
                    const tile = simulatedTiles[tileIndex];
                    const positions = this.findFarthestPositionSimulation(tile.position, vector, simulatedTiles);
                    const next = getTileAt(simulatedTiles, positions.next);

                    if (next && next.value === tile.value && !next.merged) {
                        // 合并
                        const mergedValue = tile.value * 2;
                        scoreGain += mergedValue;

                        // 移除两个方块，添加合并后的方块
                        simulatedTiles = simulatedTiles.filter(t =>
                            !(t.position.row === tile.position.row && t.position.col === tile.position.col) &&
                            !(t.position.row === next.position.row && t.position.col === next.position.col)
                        );

                        simulatedTiles.push({
                            position: positions.next,
                            value: mergedValue,
                            merged: true
                        });

                        moved = true;
                    } else {
                        // 移动
                        if (positions.farthest.row !== tile.position.row ||
                            positions.farthest.col !== tile.position.col) {
                            tile.position = positions.farthest;
                            moved = true;
                        }
                    }
                }
            });
        });

        return {
            moved: moved,
            tiles: simulatedTiles,
            scoreGain: scoreGain
        };
    }

    findFarthestPositionSimulation(position, vector, tiles) {
        let previous;

        const getTileAt = (pos) => {
            return tiles.find(tile =>
                tile.position.row === pos.row &&
                tile.position.col === pos.col
            );
        };

        do {
            previous = position;
            position = {
                row: previous.row + vector.row,
                col: previous.col + vector.col
            };
        } while (this.withinBounds(position) && !getTileAt(position));

        return {
            farthest: previous,
            next: position
        };
    }

    // 评估棋盘状态
    evaluateBoard(tiles, scoreGain) {
        let score = 0;

        // 1. 分数增益（最重要）
        score += scoreGain * 10;

        // 2. 空格数量（越多越好）
        const emptySpaces = this.countEmptySpaces(tiles);
        score += emptySpaces * 100;

        // 3. 单调性（大的数字应该在角落/边缘）
        score += this.calculateMonotonicity(tiles) * 50;

        // 4. 最大值的位置（靠近角落更好）
        score += this.evaluateMaxTilePosition(tiles) * 30;

        // 5. 相邻相同数字（可以合并）
        score += this.countMergePotential(tiles) * 20;

        return score;
    }

    countEmptySpaces(tiles) {
        return this.size * this.size - tiles.length;
    }

    calculateMonotonicity(tiles) {
        // 检查行和列的单调性
        let score = 0;

        // 创建二维数组
        const grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        tiles.forEach(tile => {
            grid[tile.position.row][tile.position.col] = tile.value;
        });

        // 检查行
        for (let row = 0; row < this.size; row++) {
            let increasing = 0;
            let decreasing = 0;
            for (let col = 0; col < this.size - 1; col++) {
                if (grid[row][col] > 0 && grid[row][col + 1] > 0) {
                    if (grid[row][col] < grid[row][col + 1]) increasing++;
                    if (grid[row][col] > grid[row][col + 1]) decreasing++;
                }
            }
            score += Math.max(increasing, decreasing);
        }

        // 检查列
        for (let col = 0; col < this.size; col++) {
            let increasing = 0;
            let decreasing = 0;
            for (let row = 0; row < this.size - 1; row++) {
                if (grid[row][col] > 0 && grid[row + 1][col] > 0) {
                    if (grid[row][col] < grid[row + 1][col]) increasing++;
                    if (grid[row][col] > grid[row + 1][col]) decreasing++;
                }
            }
            score += Math.max(increasing, decreasing);
        }

        return score;
    }

    evaluateMaxTilePosition(tiles) {
        if (tiles.length === 0) return 0;

        const maxTile = tiles.reduce((max, tile) =>
            tile.value > max.value ? tile : max
        );

        // 角落位置得分最高
        const corners = [
            { row: 0, col: 0 },
            { row: 0, col: 3 },
            { row: 3, col: 0 },
            { row: 3, col: 3 }
        ];

        for (let corner of corners) {
            if (maxTile.position.row === corner.row &&
                maxTile.position.col === corner.col) {
                return 100;
            }
        }

        // 边缘位置得分次之
        if (maxTile.position.row === 0 || maxTile.position.row === 3 ||
            maxTile.position.col === 0 || maxTile.position.col === 3) {
            return 50;
        }

        return 0;
    }

    countMergePotential(tiles) {
        let potential = 0;

        const getTileAt = (position) => {
            return tiles.find(tile =>
                tile.position.row === position.row &&
                tile.position.col === position.col
            );
        };

        tiles.forEach(tile => {
            const neighbors = [
                { row: tile.position.row - 1, col: tile.position.col },
                { row: tile.position.row + 1, col: tile.position.col },
                { row: tile.position.row, col: tile.position.col - 1 },
                { row: tile.position.row, col: tile.position.col + 1 }
            ];

            neighbors.forEach(pos => {
                if (this.withinBounds(pos)) {
                    const neighbor = getTileAt(pos);
                    if (neighbor && neighbor.value === tile.value) {
                        potential++;
                    }
                }
            });
        });

        return potential;
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
