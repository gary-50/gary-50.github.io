// 笔记列表页面逻辑
(function() {
    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');

    let allNotes = [];

    // 初始化
    function init() {
        if (typeof notesConfig === 'undefined') {
            showEmptyState();
            return;
        }

        allNotes = notesConfig;
        renderNotes(allNotes);
        setupSearch();
    }

    // 渲染笔记列表
    function renderNotes(notes) {
        if (!notesList) return;

        if (notes.length === 0) {
            showEmptyState();
            return;
        }

        notesList.innerHTML = notes.map(note => `
            <a href="view.html?id=${note.id}" class="note-card">
                <span class="note-icon">${note.icon || '📝'}</span>
                <h3 class="note-title">${note.title}</h3>
                <p class="note-description">${note.description || ''}</p>
                ${note.tags && note.tags.length > 0 ? `
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="note-meta">
                    <span class="note-date">📅 ${note.date || '未知日期'}</span>
                </div>
            </a>
        `).join('');

        emptyState.style.display = 'none';
        notesList.style.display = 'grid';
    }

    // 显示空状态
    function showEmptyState() {
        if (notesList && emptyState) {
            notesList.style.display = 'none';
            emptyState.style.display = 'block';
        }
    }

    // 设置搜索功能
    function setupSearch() {
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            if (!searchTerm) {
                renderNotes(allNotes);
                return;
            }

            const filteredNotes = allNotes.filter(note => {
                const titleMatch = note.title.toLowerCase().includes(searchTerm);
                const descMatch = note.description && note.description.toLowerCase().includes(searchTerm);
                const tagsMatch = note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm));

                return titleMatch || descMatch || tagsMatch;
            });

            renderNotes(filteredNotes);
        });
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
