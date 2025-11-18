let timer = null;
let timeLeft = 25 * 60;
let isRunning = false;
let currentMode = 'work';
let pomodoroCount = 0;

const modes = {
    work: { duration: 25, label: '工作时间', nextMode: 'shortBreak', color: '#ff6b6b' },
    shortBreak: { duration: 5, label: '短休息', nextMode: 'work', color: '#4ecdc4' },
    longBreak: { duration: 15, label: '长休息', nextMode: 'work', color: '#95e1d3' }
};

let settings = {
    autoStartBreak: true,
    autoStartWork: false,
    soundEnabled: true,
    notificationEnabled: true,
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15
};

let tasks = [];
let history = [];
let currentTask = null;

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadTasks();
    loadHistory();
    loadStats();
    updateDisplay();
    updateStats();
    renderTasks();
    renderHistory();
    initSettings();
    requestNotificationPermission();
    loadTheme();
});

function loadTheme() {
    const theme = localStorage.getItem('pomodoroTheme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pomodoroTheme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function loadSettings() {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
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
    
    ['autoStartBreak', 'autoStartWork', 'soundEnabled', 'notificationEnabled'].forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            settings[id] = e.target.checked;
            saveSettings();
        });
    });
    
    ['workDuration', 'shortBreakDuration', 'longBreakDuration'].forEach(id => {
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
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
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
    
    if (currentMode === 'work') {
        pomodoroCount++;
        addToHistory('work');
        
        if (currentTask) {
            currentTask.pomodoros++;
            saveTasks();
            renderTasks();
        }
        
        updateStats();
        
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
    showNotification();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timerText').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateProgressRing() {
    const circle = document.getElementById('progressCircle');
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
    if (saved) {
        tasks = JSON.parse(saved);
    }
}

function saveTasks() {
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    
    if (text) {
        tasks.push({
            id: Date.now(),
            text: text,
            completed: false,
            pomodoros: 0,
            createdAt: new Date().toISOString()
        });
        
        input.value = '';
        saveTasks();
        renderTasks();
    }
}

document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

function renderTasks() {
    const taskList = document.getElementById('taskList');
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<p class="empty-message">暂无任务</p>';
        return;
    }
    
    taskList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" ${!task.completed ? `onclick="selectTask(${task.id})"` : ''} style="${currentTask && currentTask.id === task.id ? 'border-left-color: #ffe66d; border-left-width: 6px;' : ''}">
            <input type="checkbox" class="task-checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   onclick="event.stopPropagation(); toggleTask(${task.id})">
            <span class="task-text">${task.text}</span>
            <div class="task-pomodoro">
                <span>🍅 ${task.pomodoros}</span>
            </div>
            <button class="task-delete" onclick="event.stopPropagation(); deleteTask(${task.id})">🗑️</button>
        </div>
    `).join('');
}

function selectTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
        currentTask = task;
        renderTasks();
    }
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
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
    tasks = tasks.filter(t => t.id !== id);
    if (currentTask && currentTask.id === id) {
        currentTask = null;
    }
    saveTasks();
    renderTasks();
}

function loadHistory() {
    const saved = localStorage.getItem('pomodoroHistory');
    if (saved) {
        history = JSON.parse(saved);
        cleanOldHistory();
    }
}

function cleanOldHistory() {
    const today = new Date().toDateString();
    history = history.filter(item => new Date(item.timestamp).toDateString() === today);
    saveHistory();
}

function saveHistory() {
    localStorage.setItem('pomodoroHistory', JSON.stringify(history));
}

function addToHistory(type) {
    history.push({
        type: type,
        mode: currentMode,
        timestamp: new Date().toISOString()
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
    
    historyList.innerHTML = history.slice().reverse().map(item => {
        const date = new Date(item.timestamp);
        const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const modeText = item.mode === 'work' ? '工作' : item.mode === 'shortBreak' ? '短休息' : '长休息';
        
        return `
            <div class="history-item">
                <span class="history-time">${time}</span>
                <span class="history-mode ${item.type}">${modeText}</span>
            </div>
        `;
    }).join('');
}

function clearHistory() {
    if (confirm('确定要清除今日历史记录吗？')) {
        history = [];
        saveHistory();
        renderHistory();
    }
}

function loadStats() {
    const saved = localStorage.getItem('pomodoroStats');
    if (saved) {
        const stats = JSON.parse(saved);
        const today = new Date().toDateString();
        
        if (stats.lastDate === today) {
            pomodoroCount = stats.todayCount || 0;
        } else {
            pomodoroCount = 0;
        }
    }
}

function updateStats() {
    const today = new Date().toDateString();
    const todayWorkCount = history.filter(h => h.type === 'work').length;
    
    const saved = localStorage.getItem('pomodoroStats');
    let stats = saved ? JSON.parse(saved) : { totalCount: 0, maxStreak: 0, currentStreak: 0 };
    
    if (stats.lastDate !== today) {
        if (stats.lastDate === new Date(Date.now() - 86400000).toDateString()) {
            stats.currentStreak++;
        } else {
            stats.currentStreak = 1;
        }
        stats.lastDate = today;
    }
    
    stats.todayCount = todayWorkCount;
    stats.totalCount = (stats.totalCount || 0) + 1;
    stats.maxStreak = Math.max(stats.maxStreak || 0, stats.currentStreak);
    
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    
    document.getElementById('todayCount').textContent = todayWorkCount;
    document.getElementById('totalCount').textContent = stats.totalCount;
    document.getElementById('streakCount').textContent = stats.currentStreak;
}

function playSound() {
    if (!settings.soundEnabled) return;
    
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
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showNotification() {
    if (!settings.notificationEnabled) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    
    const title = currentMode === 'work' ? '🎉 工作完成!' : '✨ 休息结束!';
    const body = currentMode === 'work' 
        ? '干得好！是时候休息一下了。' 
        : '休息结束，准备开始新的工作吧！';
    
    new Notification(title, {
        body: body,
        icon: '🍅',
        badge: '🍅',
        tag: 'pomodoro'
    });
}

updateProgressRing();
