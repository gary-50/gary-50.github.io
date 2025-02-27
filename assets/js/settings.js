document.addEventListener('DOMContentLoaded', function() {
    initSettings();
    
    function initSettings() {
        loadSavedSettings();
        setupEventListeners();
    }
    
    function loadSavedSettings() {
        // 默认API密钥已移除，无需保留以下注释和空数组
        const defaultApiKeys = [];

        // 加载API提供商设置
        const savedProvider = localStorage.getItem('apiProvider') || 'google';
        document.querySelector(`input[value="${savedProvider}"]`).checked = true;
        
        // 根据API提供商显示/隐藏相关区域
        toggleApiSections(savedProvider);

        // 加载Google API密钥
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

        // 加载DeepSeek API密钥
        const savedDeepseekKey = localStorage.getItem('deepseekApiKey');
        if (savedDeepseekKey) {
            document.getElementById('deepseekApiKey').value = savedDeepseekKey;
        }

        // 加载Google模型选择
        const savedModel = localStorage.getItem('selectedModel') || 'gemini-2.0-pro-exp-02-05';
        document.querySelector(`input[value="${savedModel}"]`).checked = true;
        
        // 加载DeepSeek模型选择
        const savedDeepseekModel = localStorage.getItem('selectedDeepseekModel') || 'deepseek-reasoner';
        document.querySelector(`input[value="${savedDeepseekModel}"]`).checked = true;
    }
    
    function setupEventListeners() {
        // API提供商切换
        document.querySelectorAll('input[name="apiProvider"]').forEach(radio => {
            radio.addEventListener('change', function() {
                toggleApiSections(this.value);
            });
        });

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
    
    function toggleApiSections(provider) {
        if (provider === 'google') {
            document.getElementById('googleApiSection').style.display = 'block';
            document.getElementById('deepseekApiSection').style.display = 'none';
            document.getElementById('deepseekModelSection').style.display = 'none';
        } else if (provider === 'deepseek') {
            document.getElementById('googleApiSection').style.display = 'none';
            document.getElementById('deepseekApiSection').style.display = 'block';
            document.getElementById('deepseekModelSection').style.display = 'block';
        }
    }
    
    function saveSettings() {
        // 保存API提供商选择
        const selectedProvider = document.querySelector('input[name="apiProvider"]:checked').value;
        localStorage.setItem('apiProvider', selectedProvider);
        
        // 保存Google API密钥
        for (let i = 1; i <= 5; i++) {
            const key = document.getElementById(`apiKey${i}`).value.trim();
            if (key) {
                localStorage.setItem(`apiKey${i}`, key);
            } else {
                localStorage.removeItem(`apiKey${i}`);
            }
        }
        
        // 保存DeepSeek API密钥
        const deepseekKey = document.getElementById('deepseekApiKey').value.trim();
        if (deepseekKey) {
            localStorage.setItem('deepseekApiKey', deepseekKey);
        } else {
            localStorage.removeItem('deepseekApiKey');
        }
        
        // 保存选择的Google模型
        const selectedModel = document.querySelector('input[name="modelChoice"]:checked').value;
        localStorage.setItem('selectedModel', selectedModel);
        
        // 保存选择的DeepSeek模型
        const selectedDeepseekModel = document.querySelector('input[name="deepseekModelChoice"]:checked').value;
        localStorage.setItem('selectedDeepseekModel', selectedDeepseekModel);
        
        alert('设置已保存！');
    }
});
