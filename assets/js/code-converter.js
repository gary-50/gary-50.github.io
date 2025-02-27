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
        
        // 绑定滚动同步事件，同时支持垂直和水平滚动
        sourceTextArea.addEventListener('scroll', function() {
            const overlay = sourceCodeElement.parentElement;
            overlay.scrollTop = this.scrollTop;
            overlay.scrollLeft = this.scrollLeft;  // 同步水平滚动
            sourceLineNumbers.scrollTop = this.scrollTop;
        });
        
        // 添加Tab键支持
        sourceTextArea.addEventListener('keydown', function(e) {
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
                const inputLang = document.getElementById('inputLanguage').value;
                updateInputHighlighting(this.value, inputLang);
                updateLineNumbers(sourceTextArea, sourceLineNumbers);
            }
        });
        
        // 加载示例代码（根据选择的语言）
        loadExampleCode();
        
        // 初始化语法高亮库
        hljs.highlightAll();
    }

    // 加载示例代码
    function loadExampleCode() {
        const sourceTextArea = document.getElementById('sourceCodeInput');
        const sourceCodeElement = document.getElementById('sourceCode');
        const sourceLineNumbers = document.getElementById('sourceLineNumbers');
        const inputLang = document.getElementById('inputLanguage').value;
        
        // 如果代码区域为空，加载示例代码
        if (!sourceTextArea.value) {
            const defaultCode = getDefaultCode(inputLang);
            sourceTextArea.value = defaultCode;
            updateInputHighlighting(defaultCode, inputLang);
            updateLineNumbers(sourceTextArea, sourceLineNumbers);
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
    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\n");
    
    bubbleSort(numbers, n);
    
    printf("排序后: ");
    for (int i = 0; i < n; i++) {
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
            
            // 构建提示词
            const prompt = `你是编程大师，精通多种编程语言。请将以下${inputLangName}代码转换为${outputLangName}代码。在解释部分，请专注于解释转换后的${outputLangName}代码的语法特点和执行逻辑：

${codeInput}`;
            
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
    }
    
    // 更新输出代码行号
    function updateTargetLineNumbers(outputCode) {
        const lines = outputCode.split('\n');
        const lineCount = lines.length;
        const targetLineNumbers = document.getElementById('targetLineNumbers');
        
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHTML += `<div>${i}</div>`;
        }
        
        targetLineNumbers.innerHTML = lineNumbersHTML;
    }

    // 处理API响应，根据输出语言提取正确的代码块
    function processChatResponse(text, outputLang) {
        // 尝试匹配输出语言的代码块
        const codeRegex = new RegExp("```" + outputLang + "\\n([\\s\\S]*?)```");
        let codeMatch = text.match(codeRegex);
        
        // 如果没找到特定语言的代码块，尝试查找任意代码块
        if (!codeMatch) {
            codeMatch = text.match(/```(?:\w*)\n([\s\S]*?)```/);
        }
        
        const outputCode = codeMatch ? codeMatch[1].trim() : '';
        
        // 移除所有代码块后的文本作为解释
        let explanation = text.replace(/```[\s\S]*?```/g, '').trim();
        
        return [outputCode, explanation];
    }
});
