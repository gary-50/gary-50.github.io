document.addEventListener('DOMContentLoaded', () => {
    // 加载必要库
    loadMarkedLibrary();
    
    // 初始化界面交互
    initTabs();
    initInputToggle();
    initCodeEditor();
    initLanguageSelectors();
    
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
        const sourceTextArea = document.getElementById('sourceCodeInput');
        const sourceCodeElement = document.getElementById('sourceCode');
        const sourceLineNumbers = document.getElementById('sourceLineNumbers');
        const targetLineNumbers = document.getElementById('targetLineNumbers');
        
        // 确保元素存在
        if (!sourceTextArea || !sourceCodeElement || !sourceLineNumbers) {
            console.error("找不到必要的DOM元素");
            return;
        }
        
        // 初始化行号
        updateLineNumbers(sourceTextArea, sourceLineNumbers);
        
        // 绑定输入事件以更新代码高亮和行号
        sourceTextArea.addEventListener('input', function() {
            const inputLang = document.getElementById('inputLanguage').value;
            updateInputHighlighting(this.value, inputLang);
            updateLineNumbers(sourceTextArea, sourceLineNumbers);
            // 确保代码高亮区域的宽度足够
            adjustCodeWidth(this, sourceCodeElement);
        });
        
        // 改进的滚动同步事件处理
        sourceTextArea.addEventListener('scroll', function() {
            const overlay = sourceCodeElement.parentElement;
            overlay.scrollTop = this.scrollTop;
            overlay.scrollLeft = this.scrollLeft;
            
            // 使用transform进行更准确的行号滚动同步
            if (sourceLineNumbers) {
                sourceLineNumbers.style.transform = `translateY(-${this.scrollTop}px)`;
            }
        });
        
        // 修复：目标代码行号同步
        const targetCode = document.getElementById('targetCode');
        if (targetCode) {
            targetCode.addEventListener('scroll', function() {
                // 使用transform进行滚动同步，比改变scrollTop更流畅
                if (targetLineNumbers) {
                    targetLineNumbers.style.transform = `translateY(-${this.scrollTop}px)`;
                }
            });
        }
        
        // 添加Tab键处理
        sourceTextArea.addEventListener('keydown', function(e) {
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
        
        // 加载示例代码（根据选择的语言）
        loadExampleCode();
        
        // 初始化语法高亮库
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        } else {
            console.warn("highlight.js库尚未加载完成");
        }
    }

    // 加载示例代码
    function loadExampleCode() {
        const sourceTextArea = document.getElementById('sourceCodeInput');
        const sourceCodeElement = document.getElementById('sourceCode');
        const sourceLineNumbers = document.getElementById('sourceLineNumbers');
        
        if (!sourceTextArea || !sourceCodeElement) {
            console.error("找不到代码编辑器必要元素");
            return;
        }
        
        const inputLang = document.getElementById('inputLanguage').value;
        console.log("当前选择的语言:", inputLang);
        
        // 如果代码区域为空，加载示例代码
        if (!sourceTextArea.value || sourceTextArea.value.trim() === '') {
            console.log("加载示例代码...");
            const defaultCode = getDefaultCode(inputLang);
            sourceTextArea.value = defaultCode;
            console.log("示例代码已设置");
            
            // 确保语法高亮更新
            try {
                updateInputHighlighting(defaultCode, inputLang);
                console.log("语法高亮已更新");
            } catch (e) {
                console.error("更新语法高亮时出错:", e);
            }
            
            // 更新行号
            if (sourceLineNumbers) {
                updateLineNumbers(sourceTextArea, sourceLineNumbers);
                console.log("行号已更新");
            }
        }
        
        // 初始化时调整一次宽度
        if (sourceTextArea.value) {
            adjustCodeWidth(sourceTextArea, sourceCodeElement);
        }
    }

    // 获取默认示例代码
    function getDefaultCode(lang) {
        // 语言显示名称映射
        const languageNames = {
            'cpp': 'C++',
            'c': 'C',
            'python': 'Python',
            'java': 'Java',
            'rust': 'Rust',
            'go': 'Go'
        };
        
        // 默认示例代码
        const defaultExamples = {
            'cpp': `#include <iostream>
#include <vector>
using namespace std;

// 冒泡排序函数
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
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
}`,
            'c': `#include <stdio.h>

// 交换两个元素
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// 冒泡排序函数
void bubbleSort(int arr[], int n) {
    for (int i = 0; n-1; i++) {
        for (int j = 0; n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(&arr[j], &arr[j+1]);
            }
        }
    }
}

int main() {
    int numbers[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("排序前: ");
    for (int i = 0; n; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\n");
    
    bubbleSort(numbers, n);
    
    printf("排序后: ");
    for (int i = 0; n; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\n");
    
    return 0;
}`,
            'python': `# 冒泡排序函数
def bubble_sort(arr):
    n = len(arr)
    for i in range(n-1):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]

def main():
    numbers = [64, 34, 25, 12, 22, 11, 90]
    
    print("排序前:", end=" ")
    for num in numbers:
        print(num, end=" ")
    print()
    
    bubble_sort(numbers)
    
    print("排序后:", end=" ")
    for num in numbers:
        print(num, end=" ")
    print()

if __name__ == "__main__":
    main()`,
            'java': `import java.util.Arrays;

public class BubbleSort {
    // 冒泡排序函数
    static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; n-1; i++) {
            for (int j = 0; n-i-1; j++) {
                if (arr[j] > arr[j+1]) {
                    // 交换 arr[j] 和 arr[j+1]
                    int temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
            }
        }
    }
    
    public static void main(String[] args) {
        int[] numbers = {64, 34, 25, 12, 22, 11, 90};
        
        System.out.print("排序前: ");
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println();
        
        bubbleSort(numbers);
        
        System.out.print("排序后: ");
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println();
    }
}`,
            'rust': `fn bubble_sort(arr: &mut [i32]) {
    let n = arr.len();
    for i in 0..n-1 {
        for j in 0..n-i-1 {
            if arr[j] > arr[j+1] {
                arr.swap(j, j+1);
            }
        }
    }
}

fn main() {
    let mut numbers = [64, 34, 25, 12, 22, 11, 90];
    
    print!("排序前: ");
    for num in &numbers {
        print!("{} ", num);
    }
    println!();
    
    bubble_sort(&mut numbers);
    
    print!("排序后: ");
    for num in &numbers {
        print!("{} ", num);
    }
    println!();
}`,
            'go': `package main

import "fmt"

func bubbleSort(arr []int) {
    n := len(arr)
    for i := 0; n-1; i++) {
        for j := 0; n-i-1; j++) {
            if arr[j] > arr[j+1]) {
                arr[j], arr[j+1] = arr[j+1], arr[j];
            }
        }
    }
}

func main() {
    numbers := []int{64, 34, 25, 12, 22, 11, 90};
    
    fmt.Print("排序前: ");
    for _, num := range numbers {
        fmt.Printf("%d ", num);
    }
    fmt.Println();
    
    bubbleSort(numbers);
    
    fmt.Print("排序后: ");
    for _, num := range numbers {
        fmt.Printf("%d ", num);
    }
    fmt.Println();
}`
        };
        
        return defaultExamples[lang];
    }

    // 初始化语言选择器
    function initLanguageSelectors() {
        const inputLanguage = document.getElementById('inputLanguage');
        const outputLanguage = document.getElementById('outputLanguage');
        const inputLanguageLabel = document.getElementById('inputLanguageLabel');
        const outputLanguageLabel = document.getElementById('outputLanguageLabel');
        const sourceTextArea = document.getElementById('sourceCodeInput');
        
        // 语言显示名称映射
        const languageNames = {
            'cpp': 'C++',
            'c': 'C',
            'python': 'Python',
            'java': 'Java',
            'rust': 'Rust',
            'go': 'Go'
        };
        
        // 当输入语言改变时更新示例代码和标签
        inputLanguage.addEventListener('change', function() {
            const lang = this.value;
            inputLanguageLabel.textContent = languageNames[lang];
            
            // 更新代码示例
            if (sourceTextArea.value === '' || confirm('是否替换当前代码为新语言的示例代码？')) {
                sourceTextArea.value = getDefaultCode(lang);
                updateInputHighlighting(sourceTextArea.value, lang);
                updateLineNumbers(sourceTextArea, document.getElementById('sourceLineNumbers'));
            } else {
                // 如果用户选择保留当前代码，仍然需要更新语法高亮
                updateInputHighlighting(sourceTextArea.value, lang);
            }
        });
        
        // 当输出语言改变时更新标签
        outputLanguage.addEventListener('change', function() {
            outputLanguageLabel.textContent = languageNames[this.value];
        });

        // 防止输入输出语言相同
        inputLanguage.addEventListener('change', function() {
            if (this.value === outputLanguage.value) {
                // 自动选择一个不同的输出语言
                const options = Array.from(outputLanguage.options).map(opt => opt.value);
                const differentLang = options.find(lang => lang !== this.value) || 'python';
                outputLanguage.value = differentLang;
                outputLanguageLabel.textContent = languageNames[differentLang];
            }
        });

        outputLanguage.addEventListener('change', function() {
            if (this.value === inputLanguage.value) {
                // 告知用户输入和输出语言不能相同
                alert('输入和输出语言不能相同');
                // 重置为之前的选择或默认值
                const options = Array.from(inputLanguage.options).map(opt => opt.value);
                const differentLang = options.find(lang => lang !== this.value) || 'cpp';
                inputLanguage.value = differentLang;
                inputLanguageLabel.textContent = languageNames[differentLang];
                
                // 更新代码示例
                if (sourceTextArea.value === '' || confirm('是否替换当前代码为新语言的示例代码？')) {
                    sourceTextArea.value = getDefaultCode(differentLang);
                    updateInputHighlighting(sourceTextArea.value, differentLang);
                    updateLineNumbers(sourceTextArea, document.getElementById('sourceLineNumbers'));
                }
            }
        });
    }
    
    // 根据内容调整代码宽度，确保长行可以水平滚动
    function adjustCodeWidth(textArea, codeElement) {
        // 计算最长行的宽度
        const lines = textArea.value.split('\n');
        let maxLineLength = 0;
        
        for (const line of lines) {
            if (line.length > maxLineLength) {
                maxLineLength = line.length;
            }
        }
        
        // 设置最小宽度以适应最长的行
        // 乘以字符宽度的近似值（以ch为单位）
        if (maxLineLength > 80) {  // 只有当行长度超过标准宽度时才调整
            const minWidth = `${maxLineLength}ch`;
            codeElement.style.minWidth = minWidth;
        }
    }
    
    // 更新输入代码高亮，支持多语言
    function updateInputHighlighting(code, language) {
        const sourceCodeElement = document.getElementById('sourceCode');
        sourceCodeElement.textContent = code;
        sourceCodeElement.className = `language-${language}`;
        hljs.highlightElement(sourceCodeElement);
        
        // 调整宽度以适应代码内容
        adjustCodeWidth(document.getElementById('sourceCodeInput'), sourceCodeElement);
    }
    
    // 更新行号 - 改进对齐版
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

    // 代码转换核心功能
    async function convertCode() {
        const codeInput = document.getElementById('sourceCodeInput').value.trim();
        if (!codeInput) {
            alert('请输入代码');
            return;
        }

        const inputLang = document.getElementById('inputLanguage').value;
        const outputLang = document.getElementById('outputLanguage').value;
        
        if (inputLang === outputLang) {
            alert('输入和输出语言不能相同');
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
            
            // 获取语言的正式名称用于提示词
            const langFullNames = {
                'cpp': 'C++',
                'c': 'C',
                'python': 'Python',
                'java': 'Java',
                'rust': 'Rust',
                'go': 'Go'
            };
            
            const inputLangName = langFullNames[inputLang];
            const outputLangName = langFullNames[outputLang];
            
            // 修改提示词，对C++进行特殊处理，让模型分开输出纯代码和解释
            let prompt;
            if (outputLang === 'cpp') {
                prompt = `你是编程大师，精通多种编程语言。请将以下${inputLangName}代码转换为${outputLangName}代码。
                
请按照以下格式回复：
1. 首先用三个反引号加cpp标识符包裹完整的、可以直接运行的C++代码，不要在代码中添加任何解释性文字
2. 在代码块之后，另起一行，提供对C++代码的详细解释，包括语法特点和执行逻辑

以下是需要转换的${inputLangName}代码：
${codeInput}`;
            } else {
                prompt = `你是编程大师，精通多种编程语言。请将以下${inputLangName}代码转换为${outputLangName}代码。在解释部分，请专注于解释转换后的${outputLangName}代码的语法特点和执行逻辑：

${codeInput}`;
            }
            
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
                processResponse(result, outputLang);
                
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
                                content: `你是编程大师，精通多种编程语言，尤其是${inputLangName}和${outputLangName}。`
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
                processResponse(result, outputLang);
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

    // 处理API响应，现在接收输出语言作为参数
    function processResponse(text, outputLang) {
        const [outputCode, explanation] = processChatResponse(text, outputLang);

        // 更新输出代码显示区域
        const outputCodeElement = document.getElementById('targetCode');
        outputCodeElement.textContent = outputCode;
        outputCodeElement.className = `language-${outputLang}`;
        
        // 更新行号
        updateTargetLineNumbers(outputCode);
        
        // 应用语法高亮
        hljs.highlightElement(outputCodeElement);

        // 更新解释内容，使用marked渲染Markdown
        const explanationEl = document.getElementById('explanation');
        explanationEl.innerHTML = marked.parse(explanation);
        
        // 自动激活"代码"标签页
        const codeBtn = document.querySelector('.tab-btn[data-tab="code"]');
        const codeTab = document.getElementById('codeTab');
        
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        codeBtn.classList.add('active');
        codeTab.classList.add('active');
        
        // 为目标代码区域添加滚动监听，确保行号同步 - 修复滚动同步问题
        const targetCode = document.getElementById('targetCode');
        const targetLineNumbers = document.getElementById('targetLineNumbers');
        if (targetCode && targetLineNumbers) {
            // 使用直接的事件处理而不是addEventListener，避免重复绑定
            targetCode.onscroll = function() {
                targetLineNumbers.style.transform = `translateY(-${this.scrollTop}px)`;
            };
        }
    }

    // 处理API响应，根据输出语言提取正确的代码块
    function processChatResponse(text, outputLang) {
        // 针对C++的特殊处理
        if (outputLang === 'cpp') {
            // 尝试查找C++代码块，使用更精确的正则表达式
            const cppCodeRegex = /```(?:cpp|c\+\+)\s*\n([\s\S]*?)```/;
            const cppMatch = text.match(cppCodeRegex);
            
            if (cppMatch) {
                let cppCode = cppMatch[1].trim();
                
                // 验证C++代码的完整性
                if (cppCode.includes('#include')) {
                    // 移除代码中可能混入的注释和解释
                    cppCode = cleanCppCode(cppCode);
                    
                    // 提取剩余文本作为解释
                    let explanation = text.replace(cppCodeRegex, '').trim();
                    
                    // 如果无法找到合适的解释，则默认生成一个基础解释
                    if (!explanation) {
                        explanation = "这是从其他语言转换为C++的代码。代码实现了相同的功能，但使用了C++的语法和特性。";
                    }
                    
                    return [cppCode, explanation];
                }
            }
        }
        
        // 常规代码处理逻辑（针对其他语言）
        // 尝试匹配输出语言的代码块
        const codeRegex = new RegExp("```(?:" + outputLang + "|" + outputLang.toLowerCase() + ")\\s*\\n([\\s\\S]*?)```");
        let codeMatch = text.match(codeRegex);
        
        // 如果没找到特定语言的代码块，尝试查找任意代码块
        if (!codeMatch) {
            codeMatch = text.match(/```(?:\w*)\s*\n([\s\S]*?)```/);
        }
        
        // 提取代码，如果没找到匹配则返回空字符串
        let outputCode = codeMatch ? codeMatch[1].trim() : '';
        
        // 移除所有代码块，保留解释文本
        let explanation = text.replace(/```[\s\S]*?```/g, '').trim();
        
        // 如果输出代码中包含大段解释文本，将其移到解释部分
        if (outputCode) {
            // 检查代码中是否包含大段解释文本（连续3行以上不包含代码特征的文本）
            const explanationMarkers = [
                /(?:解释|说明|注意|分析|理解)[:：]/i,
                /explanation:/i,
                /\/\*\s*(?:解释|说明|注意|分析)[\s\S]*?\*\//g  // 匹配多行注释块
            ];
            
            // 检查代码是否包含解释标记
            for (const marker of explanationMarkers) {
                if (marker.test(outputCode)) {
                    // 将这部分从代码中剥离，添加到解释中
                    const extractedExplanation = outputCode.match(marker);
                    if (extractedExplanation) {
                        // 如果是正则表达式组，将匹配结果从代码中移除
                        outputCode = outputCode.replace(extractedExplanation[0], '').trim();
                        
                        // 添加到解释部分
                        if (explanation) {
                            explanation += "\n\n" + extractedExplanation[0];
                        } else {
                            explanation = extractedExplanation[0];
                        }
                    }
                }
            }
            
            // 进一步清理代码，移除可能的解释段落
            // 将连续多行非代码特征文本（没有常见代码符号如{}[]();等）移至解释部分
            const codeLines = outputCode.split('\n');
            let cleanedCodeLines = [];
            let currentExplanation = [];
            let inExplanationBlock = false;
            
            for (let i = 0; i < codeLines.length; i++) {
                const line = codeLines[i];
                // 检测是否为代码行（包含常见代码符号或缩进+标识符）
                const isCodeLine = /[{}\[\]();:=<>!&|+\-*/%]|^\s*\w+/.test(line);
                
                if (isCodeLine || line.trim() === '') {
                    // 如果我们在一个解释块中并且遇到了代码行，结束解释块
                    if (inExplanationBlock && currentExplanation.length > 2) {
                        // 只有当解释超过2行时才视为真正的解释
                        if (explanation) {
                            explanation += "\n\n" + currentExplanation.join("\n");
                        } else {
                            explanation = currentExplanation.join("\n");
                        }
                        currentExplanation = [];
                    }
                    inExplanationBlock = false;
                    cleanedCodeLines.push(line);
                } else {
                    // 潜在的解释行
                    inExplanationBlock = true;
                    currentExplanation.push(line);
                }
            }
            
            // 检查是否在文件末尾有解释块
            if (inExplanationBlock && currentExplanation.length > 2) {
                if (explanation) {
                    explanation += "\n\n" + currentExplanation.join("\n");
                } else {
                    explanation = currentExplanation.join("\n");
                }
            } else {
                // 如果解释块太短，将其视为代码的一部分
                cleanedCodeLines = cleanedCodeLines.concat(currentExplanation);
            }
            
            // 更新处理后的代码
            outputCode = cleanedCodeLines.join('\n').trim();
        }
        
        return [outputCode, explanation];
    }
    
    // 更新目标代码行号 - 改进对齐版
    function updateTargetLineNumbers(code) {
        const lines = code.split('\n');
        const lineCount = lines.length;
        const targetLineNumbers = document.getElementById('targetLineNumbers');
        
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHTML += `<div>${i}</div>`;
        }
        
        targetLineNumbers.innerHTML = lineNumbersHTML;
        
        // 重置transform以避免之前的滚动影响
        targetLineNumbers.style.transform = 'translateY(0)';
        
        // 计算合适的总高度 - 添加额外空间确保底部行号显示
        const lineHeight = 1.6; // 1.6em 是行高
        const totalHeight = lineCount * lineHeight + 2; // 添加额外边距
        targetLineNumbers.style.height = `${totalHeight}em`;
        
        // 确保有足够宽度显示行号
        const maxDigits = Math.max(2, String(lineCount).length); // 至少2位数的宽度
        targetLineNumbers.style.minWidth = `${maxDigits * 8 + 16}px`; // 8px每数字 + 16px内边距
        
        // 获取目标代码元素并调整样式
        const targetCode = document.getElementById('targetCode');
        if (targetCode) {
            // 确保代码元素也有对应的行高
            targetCode.style.lineHeight = '1.6';
            
            // 微调行号容器的垂直位置以完美对齐
            setTimeout(() => {
                targetLineNumbers.style.paddingTop = 
                    (parseInt(getComputedStyle(targetCode).paddingTop) + 1) + 'px';
                
                // 重要：确保每次更新行号后重新绑定滚动事件
                targetCode.onscroll = function() {
                    targetLineNumbers.style.transform = `translateY(-${this.scrollTop}px)`;
                };
            }, 10);
        }
    }

    // 新增：清理C++代码的函数，移除混入的解释文本
    function cleanCppCode(code) {
        // 分析代码行
        const lines = code.split('\n');
        const cleanedLines = [];
        let inMultiLineComment = false;
        let inExplanationBlock = false;
        let explanationBuffer = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 处理多行注释
            if (line.includes('/*')) {
                inMultiLineComment = true;
            }
            
            if (inMultiLineComment) {
                if (line.includes('*/')) {
                    inMultiLineComment = false;
                }
                continue; // 跳过注释行
            }
            
            // 跳过单行注释
            if (line.startsWith('//')) {
                continue;
            }
            
            // 检测是否为非代码解释段
            if (line.match(/^解释|说明|注意|分析|理解|Note|Explanation|首先|然后|最后|这里/i)) {
                inExplanationBlock = true;
                explanationBuffer.push(line);
                continue;
            }
            
            // 检测代码特征
            const isCodeLine = /[{}\[\]();:=<>!&|+\-*/%#]|^\s*\w+/.test(line);
            
            if (inExplanationBlock) {
                if (isCodeLine) {
                    inExplanationBlock = false;
                } else {
                    explanationBuffer.push(line);
                    continue;
                }
            }
            
            // 添加有效代码行
            if (isCodeLine || line === '') {
                cleanedLines.push(lines[i]); // 使用原始行，保留缩进
            }
        }
        
        return cleanedLines.join('\n');
    }
});
