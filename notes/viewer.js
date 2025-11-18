// 笔记查看器逻辑
(function() {
    const noteHeader = document.getElementById('noteHeader');
    const noteContent = document.getElementById('noteContent');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');

    // 配置 marked
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.error('Highlight error:', err);
                    }
                }
                return code;
            }
        });
    }

    // 获取 URL 参数
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // 加载笔记
    async function loadNote() {
        const noteId = getQueryParam('id');

        if (!noteId) {
            showError('未指定笔记');
            return;
        }

        // 从配置中查找笔记信息
        const noteInfo = notesConfig.find(note => note.id === noteId);

        if (!noteInfo) {
            showError('找不到该笔记');
            return;
        }

        try {
            // 渲染笔记头部
            renderHeader(noteInfo);

            // 加载 Markdown 文件
            const response = await fetch(noteInfo.filename);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const markdownContent = await response.text();

            // 渲染 Markdown
            renderMarkdown(markdownContent);

        } catch (error) {
            console.error('Load note error:', error);

            // 检查是否是 file:// 协议导致的问题
            if (window.location.protocol === 'file:') {
                showError('请使用本地服务器打开此页面。<br><br>在项目目录运行: <code>npx serve</code> 或 <code>python -m http.server</code>');
            } else {
                showError(`加载笔记失败: ${error.message}`);
            }
        }
    }

    // 渲染笔记头部
    function renderHeader(noteInfo) {
        if (!noteHeader) return;

        noteHeader.innerHTML = `
            <h1 class="main-title">${noteInfo.icon || '📝'} ${noteInfo.title}</h1>
            ${noteInfo.description ? `<p class="subtitle">${noteInfo.description}</p>` : ''}
            ${noteInfo.tags && noteInfo.tags.length > 0 ? `
                <div class="note-tags" style="justify-content: center; margin-top: 1rem;">
                    ${noteInfo.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        `;
    }

    // 渲染 Markdown 内容
    function renderMarkdown(markdownText) {
        if (!noteContent || typeof marked === 'undefined') {
            showError('Markdown 渲染器未加载');
            return;
        }

        try {
            const htmlContent = marked.parse(markdownText);
            noteContent.innerHTML = htmlContent;

            // 应用代码高亮
            if (typeof hljs !== 'undefined') {
                noteContent.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }

            // 显示内容
            loadingState.style.display = 'none';
            noteContent.style.display = 'block';
            errorState.style.display = 'none';

        } catch (error) {
            console.error('Render markdown error:', error);
            showError('渲染笔记失败');
        }
    }

    // 显示错误
    function showError(message) {
        if (errorState && loadingState && noteContent) {
            loadingState.style.display = 'none';
            noteContent.style.display = 'none';
            errorState.style.display = 'block';
            errorState.innerHTML = `<p>${message}</p>`;
        }
    }

    // 初始化
    function init() {
        if (typeof notesConfig === 'undefined') {
            showError('配置文件未加载');
            return;
        }

        loadNote();
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
