/**
 * 统一主题管理脚本
 * 所有页面共享，使用 data-theme 属性和统一的 localStorage 键
 */

(function() {
    const THEME_KEY = 'site-theme';

    /**
     * 获取保存的主题，如果没有则根据系统偏好返回默认值
     */
    function getSavedTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved) {
            return saved;
        }
        // 检测系统偏好
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    /**
     * 应用主题
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    }

    /**
     * 更新主题图标
     */
    function updateThemeIcon(theme) {
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    /**
     * 切换主题
     */
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
        updateThemeIcon(newTheme);
    }

    /**
     * 初始化主题
     */
    function initTheme() {
        const theme = getSavedTheme();
        applyTheme(theme);
    }

    // 在 DOM 加载前尽早应用主题，避免闪烁
    initTheme();

    // DOM 加载后再次确认图标更新
    document.addEventListener('DOMContentLoaded', function() {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        updateThemeIcon(theme);
    });

    // 监听系统主题变化
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // 只有在用户没有手动设置过主题时才跟随系统
            if (!localStorage.getItem(THEME_KEY)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // 暴露全局函数
    window.toggleTheme = toggleTheme;
    window.initTheme = initTheme;
})();
