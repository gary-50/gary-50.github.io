(() => {
    'use strict';

    let timer = null;
    let timeLeft = 25 * 60;
    let isRunning = false;
    let currentMode = 'work';
    let pomodoroCount = 0;

    const modes = {
        work: { duration: 25, label: '工作时间', nextMode: 'shortBreak', color: '#ff6b6b' },
        shortBreak: { duration: 5, label: '短休息', nextMode: 'work', color: '#4ecdc4' },
        longBreak: { duration: 15, label: '长休息', nextMode: 'work', color: '#95e1d3' },
    };

    let settings = {
        autoStartBreak: true,
        autoStartWork: false,
        soundEnabled: true,
        notificationEnabled: true,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
    };

    let tasks = [];
    let history = [];
    let currentTask = null;

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        loadSettings();
        loadTasks();
        loadHistory();
        pomodoroCount = getTodayWorkCount();
        bindUIEvents();
        updateDisplay();
        updateProgressRing();
        updateStatsDisplay();
        renderTasks();
        renderHistory();
        initSettings();
        requestNotificationPermission();
    }

    function bindUIEvents() {
        document.querySelectorAll('.mode-btn').forEach((btn) => {
            btn.addEventListener('click', () => switchMode(btn.dataset.mode));
        });

        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', startTimer);
        }

        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetTimer);
        }

        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', addTask);
        }

        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', clearHistory);
        }

        const taskInput = document.getElementById('taskInput');
        if (taskInput) {
            taskInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTask();
                }
            });
        }

        const taskList = document.getElementById('taskList');
        if (taskList) {
            taskList.addEventListener('click', handleTaskListClick);
            taskList.addEventListener('change', handleTaskListChange);
        }
    }

    function getTaskIdFromTarget(target) {
        const taskItem = target.closest('.task-item');
        if (!taskItem) {
            return null;
        }

        const id = Number(taskItem.dataset.taskId);
        return Number.isFinite(id) ? id : null;
    }

    function handleTaskListClick(event) {
        const taskId = getTaskIdFromTarget(event.target);
        if (taskId === null) {
            return;
        }

        if (event.target.closest('.task-delete')) {
            deleteTask(taskId);
            return;
        }

        if (event.target.matches('.task-checkbox')) {
            return;
        }

        selectTask(taskId);
    }

    function handleTaskListChange(event) {
        if (!event.target.matches('.task-checkbox')) {
            return;
        }

        const taskId = getTaskIdFromTarget(event.target);
        if (taskId === null) {
            return;
        }

        toggleTask(taskId);
    }

    function safeParseJSON(json, fallback) {
        if (!json) {
            return fallback;
        }

        try {
            return JSON.parse(json);
        } catch {
            return fallback;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }

    function loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            settings = { ...settings, ...safeParseJSON(saved, {}) };
        }

        modes.work.duration = settings.workDuration;
        modes.shortBreak.duration = settings.shortBreakDuration;
        modes.longBreak.duration = settings.longBreakDuration;
    }

    function saveSettings() {
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }

    function initSettings() {
        document.getElementById('autoStartBreak').checked = settings.autoStartBreak;
        document.getElementById('autoStartWork').checked = settings.autoStartWork;
        document.getElementById('soundEnabled').checked = settings.soundEnabled;
        document.getElementById('notificationEnabled').checked = settings.notificationEnabled;
        document.getElementById('workDuration').value = settings.workDuration;
        document.getElementById('shortBreakDuration').value = settings.shortBreakDuration;
        document.getElementById('longBreakDuration').value = settings.longBreakDuration;

        ['autoStartBreak', 'autoStartWork', 'soundEnabled', 'notificationEnabled'].forEach((id) => {
            document.getElementById(id).addEventListener('change', (e) => {
                settings[id] = e.target.checked;
                saveSettings();
            });
        });

        ['workDuration', 'shortBreakDuration', 'longBreakDuration'].forEach((id) => {
            document.getElementById(id).addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 60) {
                    settings[id] = value;
                    const mode = id.replace('Duration', '');
                    modes[mode].duration = value;
                    saveSettings();

                    if (mode === currentMode && !isRunning) {
                        timeLeft = value * 60;
                        updateDisplay();
                    }
                }
            });
        });
    }

    function switchMode(mode) {
        if (isRunning) {
            return;
        }

        currentMode = mode;
        timeLeft = modes[mode].duration * 60;

        document.querySelectorAll('.mode-btn').forEach((btn) => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        updateDisplay();
        updateProgressRing();
    }

    function startTimer() {
        if (isRunning) {
            pauseTimer();
            return;
        }

        isRunning = true;
        const startBtn = document.getElementById('startBtn');
        startBtn.classList.add('active');
        startBtn.querySelector('.btn-text').textContent = '暂停';
        startBtn.querySelector('.btn-icon').textContent = '⏸️';

        document.getElementById('modeLabel').textContent = modes[currentMode].label;

        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();
            updateProgressRing();

            if (timeLeft <= 0) {
                completePomodoro();
            }
        }, 1000);
    }

    function pauseTimer() {
        isRunning = false;
        clearInterval(timer);

        const startBtn = document.getElementById('startBtn');
        startBtn.classList.remove('active');
        startBtn.querySelector('.btn-text').textContent = '开始';
        startBtn.querySelector('.btn-icon').textContent = '▶️';
    }

    function resetTimer() {
        pauseTimer();
        timeLeft = modes[currentMode].duration * 60;
        updateDisplay();
        updateProgressRing();
        document.getElementById('modeLabel').textContent = '准备开始' + modes[currentMode].label;
    }

    function completePomodoro() {
        pauseTimer();
        const completedMode = currentMode;

        if (completedMode === 'work') {
            addToHistory('work');
            recordWorkCompletion();
            pomodoroCount = getTodayWorkCount();

            if (currentTask) {
                currentTask.pomodoros++;
                saveTasks();
                renderTasks();
            }

            updateStatsDisplay();

            if (pomodoroCount % 4 === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }

            if (settings.autoStartBreak) {
                setTimeout(() => startTimer(), 1000);
            }
        } else {
            addToHistory('break');
            switchMode('work');

            if (settings.autoStartWork) {
                setTimeout(() => startTimer(), 1000);
            }
        }

        playSound();
        showNotification(completedMode);
    }

    function updateDisplay() {
        const timerText = document.getElementById('timerText');
        if (!timerText) {
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateProgressRing() {
        const circle = document.getElementById('progressCircle');
        if (!circle) {
            return;
        }

        const radius = 140;
        const circumference = 2 * Math.PI * radius;
        const totalTime = modes[currentMode].duration * 60;
        const progress = timeLeft / totalTime;
        const offset = circumference * (1 - progress);

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
        circle.style.stroke = modes[currentMode].color;
    }

    function loadTasks() {
        const saved = localStorage.getItem('pomodoroTasks');
        const parsed = safeParseJSON(saved, []);
        tasks = Array.isArray(parsed) ? parsed : [];
    }

    function saveTasks() {
        localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
    }

    function addTask() {
        const input = document.getElementById('taskInput');
        if (!input) {
            return;
        }
        const text = input.value.trim();

        if (text) {
            tasks.push({
                id: Date.now(),
                text: text,
                completed: false,
                pomodoros: 0,
                createdAt: new Date().toISOString(),
            });

            input.value = '';
            saveTasks();
            renderTasks();
        }
    }

    function renderTasks() {
        const taskList = document.getElementById('taskList');
        if (!taskList) {
            return;
        }

        if (tasks.length === 0) {
            taskList.innerHTML = '<p class="empty-message">暂无任务</p>';
            return;
        }

        taskList.innerHTML = tasks
            .map((task) => {
                const classes = ['task-item'];
                if (task.completed) {
                    classes.push('completed');
                }
                if (currentTask && currentTask.id === task.id) {
                    classes.push('selected');
                }

                const checkboxLabel = task.completed ? '标记为未完成' : '标记为已完成';

                return `
            <div class="${classes.join(' ')}" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="${checkboxLabel}">
                <span class="task-text">${escapeHtml(task.text)}</span>
                <div class="task-pomodoro">
                    <span>🍅 ${task.pomodoros || 0}</span>
                </div>
                <button class="task-delete" type="button" aria-label="删除任务">🗑️</button>
            </div>
        `;
            })
            .join('');
    }

    function selectTask(id) {
        const task = tasks.find((t) => t.id === id);
        if (task && !task.completed) {
            currentTask = task;
            renderTasks();
        }
    }

    function toggleTask(id) {
        const task = tasks.find((t) => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (task.completed && currentTask && currentTask.id === id) {
                currentTask = null;
            }
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter((t) => t.id !== id);
        if (currentTask && currentTask.id === id) {
            currentTask = null;
        }
        saveTasks();
        renderTasks();
    }

    function loadHistory() {
        const saved = localStorage.getItem('pomodoroHistory');
        const parsed = safeParseJSON(saved, []);
        history = Array.isArray(parsed) ? parsed : [];
        cleanOldHistory();
    }

    function cleanOldHistory() {
        const today = new Date().toDateString();
        history = history.filter((item) => new Date(item.timestamp).toDateString() === today);
        saveHistory();
    }

    function saveHistory() {
        localStorage.setItem('pomodoroHistory', JSON.stringify(history));
    }

    function addToHistory(type) {
        history.push({
            type: type,
            mode: currentMode,
            timestamp: new Date().toISOString(),
        });
        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        const historyList = document.getElementById('historyList');

        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-message">暂无记录</p>';
            return;
        }

        historyList.innerHTML = history
            .slice()
            .reverse()
            .map((item) => {
                const date = new Date(item.timestamp);
                const time = date.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const modeText =
                    item.mode === 'work'
                        ? '工作'
                        : item.mode === 'shortBreak'
                          ? '短休息'
                          : '长休息';

                return `
            <div class="history-item">
                <span class="history-time">${time}</span>
                <span class="history-mode ${item.type}">${modeText}</span>
            </div>
        `;
            })
            .join('');
    }

    function clearHistory() {
        if (confirm('确定要清除今日历史记录吗？')) {
            history = [];
            saveHistory();
            renderHistory();
        }
    }

    const STATS_KEY = 'pomodoroStats';

    function getTodayWorkCount() {
        return history.filter((h) => h.type === 'work').length;
    }

    function getSavedStats() {
        const saved = safeParseJSON(localStorage.getItem(STATS_KEY), {});

        return {
            totalCount: Number(saved.totalCount) || 0,
            maxStreak: Number(saved.maxStreak) || 0,
            currentStreak: Number(saved.currentStreak) || 0,
            lastDate: typeof saved.lastDate === 'string' ? saved.lastDate : null,
        };
    }

    function saveStats(stats) {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }

    function recordWorkCompletion() {
        const stats = getSavedStats();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (stats.lastDate !== today) {
            stats.currentStreak = stats.lastDate === yesterday ? stats.currentStreak + 1 : 1;
            stats.lastDate = today;
        }

        stats.totalCount += 1;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

        saveStats(stats);
    }

    function getDisplayStreak(stats) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (stats.lastDate === today || stats.lastDate === yesterday) {
            return stats.currentStreak;
        }

        return 0;
    }

    function updateStatsDisplay() {
        const todayWorkCount = getTodayWorkCount();
        const stats = getSavedStats();

        const todayCountEl = document.getElementById('todayCount');
        const totalCountEl = document.getElementById('totalCount');
        const streakCountEl = document.getElementById('streakCount');

        if (todayCountEl) {
            todayCountEl.textContent = todayWorkCount;
        }
        if (totalCountEl) {
            totalCountEl.textContent = stats.totalCount;
        }
        if (streakCountEl) {
            streakCountEl.textContent = getDisplayStreak(stats);
        }
    }

    function playSound() {
        if (!settings.soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch {
            // 某些浏览器会限制非用户交互触发声音，忽略即可
        }
    }

    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    function showNotification(completedMode) {
        if (!settings.notificationEnabled) return;
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        const isWorkCompletion = completedMode === 'work';
        const title = isWorkCompletion ? '🎉 工作完成!' : '✨ 休息结束!';
        const body = isWorkCompletion
            ? '干得好！是时候休息一下了。'
            : '休息结束，准备开始新的工作吧！';

        new Notification(title, {
            body: body,
            icon: '🍅',
            badge: '🍅',
            tag: 'pomodoro',
        });
    }
})();
