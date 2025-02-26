/**
 * 黑暗模式管理工具
 * 确保在页面加载时始终应用正确的主题设置
 */

// 立即执行函数，确保尽早应用主题，避免白屏闪烁
(function() {
    // 立即检查并应用主题，防止FOUC (Flash of Unstyled Content)
    const darkMode = localStorage.getItem('darkMode') === 'true';
    
    // 添加类到html元素而非body，确保能在DOM构建早期应用
    if (darkMode) {
        document.documentElement.classList.add('dark-mode');
    }

    // 创建一个样式元素来防止闪烁
    const style = document.createElement('style');
    style.textContent = `
        html.dark-mode body { 
            background-color: #0f172a; 
            color: #f1f5f9;
        }
    `;
    document.head.appendChild(style);
})();

// DOM加载完成后，初始化图标和事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 确保body元素也同步暗黑模式状态
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode'); // 确保html元素状态一致
    }
    
    // 初始化图标并设置事件监听
    initThemeUI();
    
    // 监听存储变化，确保多标签页同步
    window.addEventListener('storage', function(e) {
        if (e.key === 'darkMode') {
            applyTheme(e.newValue === 'true');
        }
    });
});

/**
 * 初始化主题UI元素
 */
function initThemeUI() {
    // 等待feather库加载完成
    waitForFeather().then(() => {
        // 更新主题图标
        updateThemeIcon();
        
        // 设置主题切换按钮事件
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const isDarkMode = !document.body.classList.contains('dark-mode');
                toggleTheme(isDarkMode);
            });
        }
    });
}

/**
 * 等待Feather图标库加载完成
 */
function waitForFeather() {
    return new Promise((resolve) => {
        if (typeof feather !== 'undefined') {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof feather !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
            
            // 设置超时，防止无限等待
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('Feather icons not loaded after timeout');
                resolve();
            }, 3000);
        }
    });
}

/**
 * 切换主题
 * @param {boolean} enableDark - 是否启用暗色主题
 */
function toggleTheme(enableDark) {
    // 保存到localStorage
    localStorage.setItem('darkMode', enableDark);
    
    // 应用主题
    applyTheme(enableDark);
}

/**
 * 应用主题到当前页面
 * @param {boolean} isDarkMode - 是否为暗色主题
 */
function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
    }
    
    updateThemeIcon();
}

/**
 * 更新主题图标
 */
function updateThemeIcon() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const themeIcon = document.querySelector('#themeToggle i');
    
    if (themeIcon) {
        themeIcon.setAttribute('data-feather', isDarkMode ? 'sun' : 'moon');
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}
