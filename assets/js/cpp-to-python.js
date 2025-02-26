document.addEventListener('DOMContentLoaded', () => {
    // 加载必要库
    loadMarkedLibrary();
    
    // 初始化界面交互
    initTabs();
    initInputToggle();
    initCodeEditor();
    
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
    
    // 初始化代码编辑器增强功能
    function initCodeEditor() {
        const cppTextArea = document.getElementById('cppCodeInput');
        const cppCodeElement = document.getElementById('cppCode');
        const cppLineNumbers = document.getElementById('cppLineNumbers');
        const pythonLineNumbers = document.getElementById('pythonLineNumbers');
        
        // 初始化行号
        updateLineNumbers(cppTextArea, cppLineNumbers);
        
        // 绑定输入事件以更新代码高亮和行号
        cppTextArea.addEventListener('input', function() {
            updateCppHighlighting(this.value);
            updateLineNumbers(cppTextArea, cppLineNumbers);
        });
        
        // 绑定滚动同步事件
        cppTextArea.addEventListener('scroll', function() {
            const overlay = cppCodeElement.parentElement;
            overlay.scrollTop = this.scrollTop;
            cppLineNumbers.scrollTop = this.scrollTop;
        });
        
        // 添加Tab键支持
        cppTextArea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                
                // 获取光标位置
                const start = this.selectionStart;
                const end = this.selectionEnd;
                
                // 在光标位置插入Tab
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                
                // 将光标位置移动到插入后的位置
                this.selectionStart = this.selectionEnd = start + 4;
                
                // 更新代码高亮和行号
                updateCppHighlighting(this.value);
                updateLineNumbers(cppTextArea, cppLineNumbers);
            }
        });
        
        // 设置初始内容示例（可选）
        if (!cppTextArea.value) {
            const defaultCode = `#include <iostream>
#include <vector>
using namespace std;

// 冒泡排序函数
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
            }
        }
    }
}

int main() {
    vector<int> numbers = {64, 34, 25, 12, 22, 11, 90};
    
    cout << "排序前: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    bubbleSort(numbers);
    
    cout << "排序后: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    return 0;
}`;
            cppTextArea.value = defaultCode;
            updateCppHighlighting(defaultCode);
            updateLineNumbers(cppTextArea, cppLineNumbers);
        }
        
        // 初始化语法高亮库
        hljs.highlightAll();
    }
    
    // 更新C++代码高亮
    function updateCppHighlighting(code) {
        const cppCodeElement = document.getElementById('cppCode');
        cppCodeElement.textContent = code;
        hljs.highlightElement(cppCodeElement);
    }
    
    // 更新行号
    function updateLineNumbers(textArea, lineNumbersElement) {
        const lines = textArea.value.split('\n');
        const lineCount = lines.length;
        
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHTML += `<div>${i}</div>`;
        }
        
        lineNumbersElement.innerHTML = lineNumbersHTML;
        
        // 调整行号容器的高度以匹配文本区域
        lineNumbersElement.style.height = `${textArea.scrollHeight}px`;
    }
    
    // 加载marked库
    function loadMarkedLibrary() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        document.head.appendChild(script);
        
        // 配置marked选项，优化代码块渲染
        script.onload = function() {
            marked.setOptions({
                highlight: function(code, lang) {
                    // 使用highlight.js进行代码高亮
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, {language: lang}).value;
                        } catch (e) {}
                    }
                    return hljs.highlightAuto(code).value;
                },
                gfm: true,
                breaks: true,
                pedantic: false,
                sanitize: false,
                smartLists: true,
                smartypants: false
            });
        };
    }

    // API密钥管理
    let currentApiKeyIndex = -1;
    
    function getNextApiKey() {
        // 获取选中的API提供商
        const apiProvider = localStorage.getItem('apiProvider') || 'google';
        
        if (apiProvider === 'google') {
            const keys = [];
            for (let i = 1; i <= 5; i++) {
                const key = localStorage.getItem(`apiKey${i}`);
                if (key) keys.push(key);
            }
            
            if (keys.length === 0) throw new Error('请先在设置页面配置Google API密钥');
            
            currentApiKeyIndex = (currentApiKeyIndex + 1) % keys.length;
            return keys[currentApiKeyIndex];
        } else if (apiProvider === 'deepseek') {
            const key = localStorage.getItem('deepseekApiKey');
            if (!key) throw new Error('请先在设置页面配置DeepSeek API密钥');
            return key;
        }
        
        throw new Error('未配置有效的API提供商');
    }
    
    function getSelectedModel() {
        // 获取选中的API提供商
        const apiProvider = localStorage.getItem('apiProvider') || 'google';
        
        if (apiProvider === 'google') {
            return localStorage.getItem('selectedModel') || 'gemini-2.0-pro-exp-02-05';
        } else if (apiProvider === 'deepseek') {
            return localStorage.getItem('selectedDeepseekModel') || 'deepseek-coder';
        }
        
        return 'gemini-2.0-pro-exp-02-05'; // 默认返回
    }

    // 代码转换核心功能
    async function convertCode() {
        const cppCode = document.getElementById('cppCodeInput').value.trim();
        if (!cppCode) {
            alert('请输入C++代码');
            return;
        }

        const convertBtn = document.getElementById('convertBtn');
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<i data-feather="loader" class="icon spin"></i> 转换中...';
        feather.replace();

        try {
            const apiKey = getNextApiKey();
            const apiProvider = localStorage.getItem('apiProvider') || 'google';
            const selectedModel = getSelectedModel();
            
            let responseData;
            
            if (apiProvider === 'google') {
                // 使用Google Gemini API
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
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
                
                responseData = await response.json();
                
                if (responseData.error) {
                    throw new Error(responseData.error.message);
                }
                
                const result = responseData.candidates[0].content.parts[0].text;
                processResponse(result);
                
            } else if (apiProvider === 'deepseek') {
                // 使用DeepSeek API
                const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: selectedModel,
                        messages: [
                            {
                                role: "system",
                                content: "你是编程大师，精通c++和python两种编程语言。"
                            },
                            {
                                role: "user",
                                content: `请将以下C++代码转换为Python代码。在解释部分，请专注于解释转换后的Python代码的语法特点和执行逻辑，不需要对比两种语言的差异：\n${cppCode}`
                            }
                        ],
                        max_tokens: 8192
                    })
                });
                
                responseData = await response.json();
                
                if (responseData.error) {
                    throw new Error(responseData.error.message || "调用DeepSeek API失败");
                }
                
                const result = responseData.choices[0].message.content;
                processResponse(result);
            }

        } catch (error) {
            console.error("API调用错误:", error);
            alert('转换错误：' + error.message);
        } finally {
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<i data-feather="refresh-cw"></i> 转换代码';
            feather.replace();
        }
    }

    // 处理API响应
    function processResponse(text) {
        const [pythonCode, explanation] = processChatResponse(text);

        // 更新Python代码显示区域
        const pythonCodeElement = document.getElementById('pythonCode');
        pythonCodeElement.textContent = pythonCode;
        
        // 更新行号
        updatePythonLineNumbers(pythonCode);
        
        // 应用语法高亮
        hljs.highlightElement(pythonCodeElement);

        // 更新解释内容，使用marked渲染Markdown，不再对代码块应用语法高亮
        const explanationEl = document.getElementById('explanation');
        explanationEl.innerHTML = marked.parse(explanation);
        
        // 移除对解释内容中代码块的语法高亮处理
        // explanationEl.querySelectorAll('pre code').forEach(block => {
        //     hljs.highlightElement(block);
        // });

        // 自动激活"代码"标签页
        const codeBtn = document.querySelector('.tab-btn[data-tab="code"]');
        const codeTab = document.getElementById('codeTab');
        
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        codeBtn.classList.add('active');
        codeTab.classList.add('active');
    }
    
    // 更新Python代码行号
    function updatePythonLineNumbers(pythonCode) {
        const lines = pythonCode.split('\n');
        const lineCount = lines.length;
        const pythonLineNumbers = document.getElementById('pythonLineNumbers');
        
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHTML += `<div>${i}</div>`;
        }
        
        pythonLineNumbers.innerHTML = lineNumbersHTML;
    }

    // 处理API响应
    function processChatResponse(text) {
        const codeMatch = text.match(/```python\n([\s\S]*?)```/);
        const pythonCode = codeMatch ? codeMatch[1].trim() : '';
        const explanation = text.replace(/```python\n[\s\S]*?```/, '').trim();
        
        return [pythonCode, explanation];
    }
});
