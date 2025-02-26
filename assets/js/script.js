document.addEventListener('DOMContentLoaded', () => {
    // 加载必要库
    loadMarkedLibrary();
    
    // 初始化界面交互
    initTabs();
    initInputToggle();
    
    // 绑定转换按钮事件
    document.getElementById('convertBtn').addEventListener('click', convertCode);
    
    // 标签页系统
    function initTabs() {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`${button.dataset.tab}Tab`).classList.add('active');
            });
        });
    }
    
    // 输入区域切换
    function initInputToggle() {
        document.getElementById('toggleInput').addEventListener('click', function() {
            const inputSection = document.querySelector('.input-section');
            inputSection.classList.toggle('collapsed');
            
            if (inputSection.classList.contains('collapsed')) {
                // 折叠时显示双栏
                document.getElementById('codeTab').classList.add('active');
                document.getElementById('explanationTab').classList.add('active');
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.add('active'));
            } else {
                // 展开时恢复标签页
                const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                document.getElementById(activeTab + 'Tab').classList.add('active');
            }
        });
    }
    
    // 加载marked库
    function loadMarkedLibrary() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        document.head.appendChild(script);
    }

    // API密钥管理
    let currentApiKeyIndex = -1;
    
    function getNextApiKey() {
        const keys = [];
        for (let i = 1; i <= 5; i++) {
            const key = localStorage.getItem(`apiKey${i}`);
            if (key) keys.push(key);
        }
        
        if (keys.length === 0) throw new Error('请先在设置页面配置API密钥');
        
        currentApiKeyIndex = (currentApiKeyIndex + 1) % keys.length;
        return keys[currentApiKeyIndex];
    }
    
    function getSelectedModel() {
        return localStorage.getItem('selectedModel') || 'gemini-2.0-pro-exp-02-05';
    }

    // 代码转换核心功能
    async function convertCode() {
        const cppCode = document.getElementById('cppCode').value.trim();
        if (!cppCode) {
            alert('请输入C++代码');
            return;
        }

        const convertBtn = document.getElementById('convertBtn');
        convertBtn.disabled = true;
        convertBtn.textContent = '转换中...';

        try {
            const apiKey = getNextApiKey();
            const selectedModel = getSelectedModel();
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=` + apiKey, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `你是编程大师，精通c++和python两种编程语言，请将以下C++代码转换为Python代码。在解释部分，请专注于解释转换后的Python代码的语法特点和执行逻辑，不需要对比两种语言的差异：\n${cppCode}`
                        }]
                    }]
                })
            });

            const responseData = await response.json();
            
            if (responseData.error) {
                throw new Error(responseData.error.message);
            }

            // 解析响应
            const result = responseData.candidates[0].content.parts[0].text;
            const [pythonCode, explanation] = processChatResponse(result);

            // 更新输出
            document.getElementById('pythonCode').value = pythonCode;
            document.getElementById('explanation').innerHTML = marked.parse(explanation);

            // 自动激活"代码"标签页
            const codeBtn = document.querySelector('.tab-btn[data-tab="code"]');
            const codeTab = document.getElementById('codeTab');
            
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            codeBtn.classList.add('active');
            codeTab.classList.add('active');

        } catch (error) {
            alert('转换错误：' + error.message);
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = '转换代码';
        }
    }

    // 处理API响应
    function processChatResponse(text) {
        const codeMatch = text.match(/```python\n([\s\S]*?)```/);
        const pythonCode = codeMatch ? codeMatch[1].trim() : '';
        const explanation = text.replace(/```python\n[\s\S]*?```/, '').trim();
        
        return [pythonCode, explanation];
    }
});
