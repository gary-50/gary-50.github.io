document.addEventListener('DOMContentLoaded', function() {
    initSettings();
    
    function initSettings() {
        loadSavedSettings();
        setupEventListeners();
    }
    
    function loadSavedSettings() {
        // 默认API密钥（已移除）
        const defaultApiKeys = [
            '',
            '',
            '',
            '',
            ''
        ];

        // 加载API密钥
        for (let i = 1; i <= 5; i++) {
            const savedKey = localStorage.getItem(`apiKey${i}`);
            if (savedKey) {
                document.getElementById(`apiKey${i}`).value = savedKey;
            } else if (defaultApiKeys[i-1]) {
                // 如果没有保存的密钥，则使用默认密钥
                document.getElementById(`apiKey${i}`).value = defaultApiKeys[i-1];
                // 自动保存默认密钥到本地存储
                localStorage.setItem(`apiKey${i}`, defaultApiKeys[i-1]);
            }
        }

        // 加载模型选择
        const savedModel = localStorage.getItem('selectedModel') || 'gemini-2.0-pro-exp-02-05';
        document.querySelector(`input[value="${savedModel}"]`).checked = true;
    }
    
    function setupEventListeners() {
        // 显示/隐藏密钥按钮
        document.querySelectorAll('.show-hide-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.previousElementSibling;
                if (input.type === 'password') {
                    input.type = 'text';
                    this.querySelector('i').setAttribute('data-feather', 'eye-off');
                } else {
                    input.type = 'password';
                    this.querySelector('i').setAttribute('data-feather', 'eye');
                }
                feather.replace();
            });
        });

        // 保存按钮
        document.getElementById('saveApiKeys').addEventListener('click', saveSettings);
    }
    
    function saveSettings() {
        // 保存API密钥
        for (let i = 1; i <= 5; i++) {
            const key = document.getElementById(`apiKey${i}`).value.trim();
            if (key) {
                localStorage.setItem(`apiKey${i}`, key);
            } else {
                localStorage.removeItem(`apiKey${i}`);
            }
        }
        
        // 保存选择的模型
        const selectedModel = document.querySelector('input[name="modelChoice"]:checked').value;
        localStorage.setItem('selectedModel', selectedModel);
        
        alert('设置已保存！');
    }
});
