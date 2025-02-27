document.addEventListener('DOMContentLoaded', () => {
    // 加载必要库
    loadMarkedLibrary();
    
    // 初始化界面交互
    initTabs();
    initInputToggle();
    initRequirementEditor();
    initLanguageSelector();
    
    // 绑定生成按钮事件
    document.getElementById('generateBtn').addEventListener('click', generateCode);
    
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
    
    // 初始化需求编辑器增强功能
    function initRequirementEditor() {
        const requirementTextArea = document.getElementById('requirementInput');
        const requirementCodeElement = document.getElementById('requirementCode');
        const requirementLineNumbers = document.getElementById('requirementLineNumbers');
        
        // 确保元素存在
        if (!requirementTextArea || !requirementCodeElement || !requirementLineNumbers) {
            console.error("找不到必要的DOM元素");
            return;
        }
        
        // 初始化行号
        updateLineNumbers(requirementTextArea, requirementLineNumbers);
        
        // 绑定输入事件以更新行号
        requirementTextArea.addEventListener('input', function() {
            updateInputHighlighting(this.value);
            updateLineNumbers(requirementTextArea, requirementLineNumbers);
            // 确保宽度足够
            adjustTextWidth(this, requirementCodeElement);
        });
        
        // 滚动同步
        requirementTextArea.addEventListener('scroll', function() {
            const overlay = requirementCodeElement.parentElement;
            if (overlay) {
                overlay.scrollTop = this.scrollTop;
                overlay.scrollLeft = this.scrollLeft;
            }
            
            if (requirementLineNumbers) {
                requirementLineNumbers.style.transform = `translateY(-${this.scrollTop}px)`;
            }
        });
        
        // 添加Tab键处理
        requirementTextArea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                
                // 获取光标位置
                const start = this.selectionStart;
                const end = this.selectionEnd;
                
                // 在光标位置插入Tab
                this.value = this.value.substring(0, start) + 
                              '    ' + 
                              this.value.substring(end);
                
                // 重新定位光标
                this.selectionStart = this.selectionEnd = start + 4;
                
                // 手动触发更新
                const inputEvent = new Event('input');
                this.dispatchEvent(inputEvent);
            }
        });
        
        // 加载示例需求
        setTimeout(() => {
            loadExampleRequirement();
        }, 100);
        
        // 初始化语法高亮库
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        } else {
            console.warn("highlight.js库尚未加载完成");
        }
    }
    
    // 强化版示例需求加载
    function loadExampleRequirement() {
        console.log("加载示例需求...");
        const requirementTextArea = document.getElementById('requirementInput');
        const requirementCodeElement = document.getElementById('requirementCode');
        const requirementLineNumbers = document.getElementById('requirementLineNumbers');
        
        if (!requirementTextArea || !requirementCodeElement) {
            console.error("找不到需求输入区域必要元素");
            return;
        }
        
        // 如果输入区域为空，加载示例需求
        if (!requirementTextArea.value || requirementTextArea.value.trim() === '') {
            const targetLang = document.getElementById('targetLanguage').value;
            const defaultRequirement = getDefaultRequirement(targetLang);
            console.log("设置默认需求示例...");
            requirementTextArea.value = defaultRequirement;
            
            // 确保高亮更新
            try {
                updateInputHighlighting(defaultRequirement);
                console.log("需求高亮已更新");
            } catch (e) {
                console.error("更新需求高亮时出错:", e);
            }
            
            // 更新行号
            if (requirementLineNumbers) {
                updateLineNumbers(requirementTextArea, requirementLineNumbers);
                console.log("需求行号已更新");
            }
        }
        
        // 初始化时调整一次宽度
        if (requirementTextArea.value) {
            adjustTextWidth(requirementTextArea, requirementCodeElement);
        }
    }
    
    // 获取默认示例需求
    function getDefaultRequirement(lang) {
        // 语言显示名称映射
        const languageNames = {
            'cpp': 'C++',
            'c': 'C',
            'python': 'Python',
            'java': 'Java',
            'rust': 'Rust',
            'go': 'Go',
            'matlab': 'MATLAB'
        };
        
        // 根据选择的语言返回不同的示例需求
        return `请为我生成一个${languageNames[lang]}程序，实现以下功能：

1. 创建一个简单的计算器程序，支持基本的数学运算（加、减、乘、除）
2. 程序应该从用户输入中读取两个数值和一个操作符
3. 根据操作符执行相应的运算，并显示结果
4. 对除以零的情况进行错误处理
5. 代码需要有清晰的注释和良好的结构
6. 如果可能，请实现一个循环让用户可以继续输入新的计算

请提供完整的代码实现，并确保代码风格符合${languageNames[lang]}的最佳实践。`;
    }
    
    // 初始化语言选择器
    function initLanguageSelector() {
        const targetLanguage = document.getElementById('targetLanguage');
        const outputLanguageLabel = document.getElementById('outputLanguageLabel');
        const requirementTextArea = document.getElementById('requirementInput');
        
        // 语言显示名称映射
        const languageNames = {
            'cpp': 'C++',
            'c': 'C',
            'python': 'Python',
            'java': 'Java',
            'rust': 'Rust',
            'go': 'Go',
            'matlab': 'MATLAB'
        };
        
        // 当目标语言改变时更新标签和示例需求
        targetLanguage.addEventListener('change', function() {
            const lang = this.value;
            outputLanguageLabel.textContent = languageNames[lang];
            
            // 更新语法高亮
            document.getElementById('generatedCode').className = `language-${lang}`;
            
            // 询问是否更新示例需求
            if (requirementTextArea.value === '' || 
                requirementTextArea.value === getDefaultRequirement(document.getElementById('targetLanguage').value.toLowerCase()) || 
                confirm('是否更新需求描述示例？')) {
                requirementTextArea.value = getDefaultRequirement(lang);
                updateInputHighlighting(requirementTextArea.value);
                updateLineNumbers(requirementTextArea, document.getElementById('requirementLineNumbers'));
            }
        });
    }
    
    // 更新需求输入高亮 - 修复版本
    function updateInputHighlighting(text) {
        const requirementCodeElement = document.getElementById('requirementCode');
        if (!requirementCodeElement) return;
        
        requirementCodeElement.textContent = text || '';
        // 使用plaintext语法高亮
        requirementCodeElement.className = 'language-plaintext';
        
        if (typeof hljs !== 'undefined') {
            try {
                hljs.highlightElement(requirementCodeElement);
            } catch (e) {
                console.error("高亮处理失败:", e);
            }
        }
    }
    
    // 根据内容调整文本宽度
    function adjustTextWidth(textArea, codeElement) {
        // 计算最长行的宽度
        const lines = textArea.value.split('\n');
        let maxLineLength = 0;
        
        for (const line of lines) {
            if (line.length > maxLineLength) {
                maxLineLength = line.length;
            }
        }
        
        // 设置最小宽度以适应最长的行
        if (maxLineLength > 80) {  // 只有当行长度超过标准宽度时才调整
            const minWidth = `${maxLineLength}ch`;
            codeElement.style.minWidth = minWidth;
        }
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
        
        // 重置transform以避免之前的滚动影响
        lineNumbersElement.style.transform = 'translateY(0)';
        
        // 计算行号容器的实际高度 - 添加额外空间确保底部行号显示
        const lineHeight = 1.6; // 1.6em 是我们在CSS中设置的行高
        const totalHeight = lineCount * lineHeight + 2; // 添加额外边距确保底部显示
        lineNumbersElement.style.height = `${totalHeight}em`;
        
        // 确保有足够宽度显示行号
        const maxDigits = Math.max(2, String(lineCount).length); // 至少2位数的宽度
        lineNumbersElement.style.minWidth = `${maxDigits * 8 + 16}px`; // 8px每数字 + 16px内边距
        
        // 更新后微调第一行垂直位置，确保精确对齐
        setTimeout(() => {
            const firstCodeLine = textArea.value.split('\n')[0] || '';
            const firstLineHeight = textArea.scrollHeight / lineCount;
            
            // 微调垂直位置以完美对齐
            if (firstCodeLine && lineNumbersElement.children.length > 0) {
                // 使用极小的padding调整来确保对齐
                lineNumbersElement.style.paddingTop = 
                    (parseInt(getComputedStyle(textArea).paddingTop) + 1) + 'px';
            }
        }, 10);
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

    // 代码生成核心功能
    async function generateCode() {
        const requirementInput = document.getElementById('requirementInput').value.trim();
        if (!requirementInput) {
            alert('请输入代码需求');
            return;
        }

        const targetLang = document.getElementById('targetLanguage').value;
        
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i data-feather="loader" class="icon spin"></i> 生成中...';
        feather.replace();

        try {
            const apiKey = getNextApiKey();
            const apiProvider = localStorage.getItem('apiProvider') || 'google';
            const selectedModel = getSelectedModel();
            
            // 获取语言的正式名称用于提示词
            const languageNames = {
                'cpp': 'C++',
                'c': 'C',
                'python': 'Python',
                'java': 'Java',
                'rust': 'Rust',
                'go': 'Go',
                'matlab': 'MATLAB'
            };
            
            const targetLangName = languageNames[targetLang];
            
            // 构建提示词，让模型分开输出纯代码和解释
            const prompt = `你是一位专业的${targetLangName}开发者。根据以下需求，请生成高质量、可运行的${targetLangName}代码。
请确保代码遵循最佳实践、有适当的错误处理和完整的功能实现。

请按照以下格式回复：
1. 首先用三个反引号加${targetLang}标识符包裹完整的代码（不要在代码中添加解释性文字）
2. 代码后另起一行，提供详细的代码解释，包括算法思路、关键函数解析和使用说明

以下是需求:
${requirementInput}`;
            
            let responseData;
            
            if (apiProvider === 'google') {
                // 使用Google Gemini API
                const response = await fetch(`https://api-proxy.me/gemini/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    })
                });
                
                responseData = await response.json();
                
                if (responseData.error) {
                    throw new Error(responseData.error.message);
                }
                
                const result = responseData.candidates[0].content.parts[0].text;
                processResponse(result, targetLang);
                
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
                                content: `你是一位精通${targetLangName}的专业开发者。`
                            },
                            {
                                role: "user",
                                content: prompt
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
                processResponse(result, targetLang);
            }

        } catch (error) {
            console.error("API调用错误:", error);
            alert('代码生成错误：' + error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i data-feather="cpu"></i> 生成代码';
            feather.replace();
        }
    }

    // 处理API响应
    function processResponse(text, targetLang) {
        // 从响应中提取代码和解释
        const [generatedCode, explanation] = processGenerateResponse(text, targetLang);

        // 更新生成代码显示区域
        const codeElement = document.getElementById('generatedCode');
        codeElement.textContent = generatedCode;
        codeElement.className = `language-${targetLang}`;
        
        // 更新行号
        updateGeneratedLineNumbers(generatedCode);
        
        // 应用语法高亮
        hljs.highlightElement(codeElement);

        // 更新解释内容，使用marked渲染Markdown
        const explanationEl = document.getElementById('explanation');
        explanationEl.innerHTML = marked.parse(explanation);
        
        // 自动激活"代码"标签页
        const codeBtn = document.querySelector('.tab-btn[data-tab="code"]');
        codeBtn.click();
    }

    // 处理生成的响应文本
    function processGenerateResponse(text, targetLang) {
        const codeRegex = new RegExp(`\`\`\`${targetLang}([\\s\\S]*?)\`\`\``);
        const codeMatch = text.match(codeRegex);
        const generatedCode = codeMatch ? codeMatch[1].trim() : '';

        const explanation = text.replace(codeRegex, '').trim();

        return [generatedCode, explanation];
    }

    // 更新生成代码的行号
    function updateGeneratedLineNumbers(generatedCode) {
        const lines = generatedCode.split('\n');
        const lineCount = lines.length;
        
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHTML += `<div>${i}</div>`;
        }
        
        const lineNumbersElement = document.getElementById('generatedLineNumbers');
        lineNumbersElement.innerHTML = lineNumbersHTML;
        
        // 重置transform以避免之前的滚动影响
        lineNumbersElement.style.transform = 'translateY(0)';
        
        // 计算行号容器的实际高度 - 添加额外空间确保底部行号显示
        const lineHeight = 1.6; // 1.6em 是我们在CSS中设置的行高
        const totalHeight = lineCount * lineHeight + 2; // 添加额外边距确保底部显示
        lineNumbersElement.style.height = `${totalHeight}em`;
        
        // 确保有足够宽度显示行号
        const maxDigits = Math.max(2, String(lineCount).length); // 至少2位数的宽度
        lineNumbersElement.style.minWidth = `${maxDigits * 8 + 16}px`; // 8px每数字 + 16px内边距
    }
});
