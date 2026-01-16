/**
 * 统一主题管理脚本
 * 所有页面共享，使用 data-theme 属性和统一的 localStorage 键
 */

(() => {
    'use strict';

    const THEME_KEY = 'site-theme';
    const THEMES = {
        dark: 'dark',
        light: 'light',
    };

    function safeGetItem(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function safeSetItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch {
            // ignore
        }
    }

    function getSystemTheme() {
        if (!window.matchMedia) {
            return THEMES.dark;
        }

        return window.matchMedia('(prefers-color-scheme: light)').matches
            ? THEMES.light
            : THEMES.dark;
    }

    function getInitialTheme() {
        return safeGetItem(THEME_KEY) || getSystemTheme();
    }

    function getDocumentTheme() {
        return document.documentElement.getAttribute('data-theme') || THEMES.dark;
    }

    function setDocumentTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    function updateThemeToggleUI(theme) {
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.textContent = theme === THEMES.dark ? '☀️' : '🌙';
        }

        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            const nextThemeLabel = theme === THEMES.dark ? '切换到浅色主题' : '切换到深色主题';
            toggleButton.setAttribute('aria-label', nextThemeLabel);
            toggleButton.setAttribute('title', nextThemeLabel);
        }
    }

    function applyTheme(theme) {
        setDocumentTheme(theme);
        updateThemeToggleUI(theme);
    }

    function toggleTheme() {
        const current = getDocumentTheme();
        const nextTheme = current === THEMES.dark ? THEMES.light : THEMES.dark;
        applyTheme(nextTheme);
        safeSetItem(THEME_KEY, nextTheme);
    }

    function bindThemeToggleButton() {
        const toggleButton = document.getElementById('themeToggle');
        if (!toggleButton) {
            return;
        }

        toggleButton.addEventListener('click', toggleTheme);
        updateThemeToggleUI(getDocumentTheme());
    }

    // 在 DOM 加载前尽早应用主题，避免闪烁
    applyTheme(getInitialTheme());

    document.addEventListener('DOMContentLoaded', () => {
        bindThemeToggleButton();
    });

    // 监听系统主题变化（仅当用户未手动设置过主题时）
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        const onChange = (event) => {
            if (safeGetItem(THEME_KEY)) {
                return;
            }
            applyTheme(event.matches ? THEMES.light : THEMES.dark);
        };

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', onChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(onChange);
        }
    }
})();
