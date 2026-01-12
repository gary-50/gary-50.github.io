/**
 * API Key 测试工具 - JavaScript
 */

// 存储测试结果
let testResults = {
    valid: [],
    invalid: {}
};

// 用于取消测试的控制器
let testAbortController = null;

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    initFileUpload();
});

/**
 * 初始化文件上传功能
 */
function initFileUpload() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const content = event.target.result;
                const apiKeysTextarea = document.getElementById('apiKeys');

                // 如果文本框已有内容，追加到末尾
                if (apiKeysTextarea.value.trim()) {
                    apiKeysTextarea.value += '\n' + content;
                } else {
                    apiKeysTextarea.value = content;
                }

                alert(`成功导入文件: ${file.name}`);

                // 清空文件选择器
                fileInput.value = '';
            };
            reader.onerror = function() {
                alert('读取文件失败，请重试！');
            };
            reader.readAsText(file);
        }
    });
}

/**
 * 密钥去重功能
 */
function deduplicateKeys() {
    const apiKeysTextarea = document.getElementById('apiKeys');
    const input = apiKeysTextarea.value;

    if (!input.trim()) {
        alert('密钥文本框为空，无需去重！');
        return;
    }

    // 解析所有密钥
    const keys = parseApiKeys(input);
    const originalCount = keys.length;

    // 使用 Set 去重
    const uniqueKeys = [...new Set(keys)];
    const duplicateCount = originalCount - uniqueKeys.length;

    if (duplicateCount === 0) {
        alert('没有发现重复的密钥！');
        return;
    }

    // 更新文本框内容（每行一个密钥）
    apiKeysTextarea.value = uniqueKeys.join('\n');

    alert(`去重完成！\n原密钥数: ${originalCount}\n去重后: ${uniqueKeys.length}\n移除重复: ${duplicateCount}`);
}

/**
 * 清空密钥功能
 */
function clearKeys() {
    const apiKeysTextarea = document.getElementById('apiKeys');
    if (!apiKeysTextarea.value.trim()) {
        alert('密钥文本框已经是空的！');
        return;
    }

    if (confirm('确定要清空所有密钥吗？')) {
        apiKeysTextarea.value = '';
        alert('已清空所有密钥！');
    }
}

/**
 * 解析API密钥
 * @param {string} input - 输入的密钥字符串
 * @returns {Array<string>} - 解析后的密钥数组
 */
function parseApiKeys(input) {
    // 使用正则表达式分割输入，支持逗号、空格、换行符
    return input
        .split(/[,\s\n]+/)
        .map(key => key.trim())
        .filter(key => key.length > 0);
}

/**
 * 测试单个API密钥
 * @param {string} apiUrl - API地址
 * @param {string} apiKey - API密钥
 * @param {string} modelName - 模型名称
 * @returns {Promise<Object>} - 测试结果
 */
async function testApiKey(apiUrl, apiKey, modelName) {
    let responseText = null; // 优化：及时释放内存
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    { role: 'user', content: 'Hi' }
                ],
                max_tokens: 5,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 读取响应体以进行更详细的验证
        let responseData;
        try {
            responseText = await response.text();
            responseData = JSON.parse(responseText);
            responseText = null; // 立即释放大字符串内存
        } catch (e) {
            responseText = null; // 释放内存
            // 如果无法解析JSON，说明响应格式不正确，API 地址可能有误
            return {
                key: apiKey,
                status: response.status,
                statusText: response.statusText,
                valid: false,
                error: `响应格式无效：无法解析 JSON (状态码: ${response.status})`
            };
        }

        // 检查是否返回了有效的响应
        // OpenAI格式的API应该返回包含choices或者error的响应
        if (response.ok) {
            // 状态码200-299，进一步验证响应内容
            if (responseData && (responseData.choices || responseData.id)) {
                return {
                    key: apiKey,
                    status: response.status,
                    statusText: response.statusText,
                    valid: true,
                    error: null
                };
            } else if (responseData && responseData.error) {
                // 虽然状态码是200，但返回了错误
                return {
                    key: apiKey,
                    status: response.status,
                    statusText: response.statusText,
                    valid: false,
                    error: responseData.error.message || JSON.stringify(responseData.error)
                };
            } else {
                // 状态码200但响应格式不符合OpenAI API预期，API地址可能错误
                return {
                    key: apiKey,
                    status: response.status,
                    statusText: response.statusText,
                    valid: false,
                    error: '响应格式不符合 OpenAI API 规范，请检查 API 地址是否正确'
                };
            }
        } else {
            // 非200状态码
            let errorMessage = response.statusText;
            if (responseData && responseData.error) {
                if (typeof responseData.error === 'string') {
                    errorMessage = responseData.error;
                } else if (responseData.error.message) {
                    errorMessage = responseData.error.message;
                }
            }

            return {
                key: apiKey,
                status: response.status,
                statusText: response.statusText,
                valid: false,
                error: errorMessage
            };
        }
    } catch (error) {
        responseText = null; // 释放内存
        if (error.name === 'AbortError') {
            return {
                key: apiKey,
                status: 0,
                statusText: 'Timeout',
                valid: false,
                error: '请求超时 (60秒)'
            };
        }
        return {
            key: apiKey,
            status: 0,
            statusText: 'Network Error',
            valid: false,
            error: error.message
        };
    }
}

/**
 * 获取错误分类
 * @param {number} status - HTTP状态码
 * @param {string} statusText - 状态文本
 * @param {string} error - 错误信息
 * @returns {string} - 错误分类
 */
function getErrorCategory(status, statusText, error) {
    if (error) {
        if (error.includes('超时')) return '请求超时';
        return '网络错误';
    }

    switch (status) {
        case 401:
            return '401 - 未授权 (Key 无效)';
        case 403:
            return '403 - 禁止访问';
        case 429:
            return '429 - 请求过多 (限流)';
        case 500:
            return '500 - 服务器错误';
        case 502:
            return '502 - 网关错误';
        case 503:
            return '503 - 服务不可用';
        default:
            return `${status} - ${statusText}`;
    }
}

/**
 * 开始测试所有API密钥
 */
async function startTest() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const modelName = document.getElementById('modelName').value.trim();
    const apiKeysInput = document.getElementById('apiKeys').value;
    const concurrency = parseInt(document.getElementById('concurrency').value) || 3;

    if (!apiUrl) {
        alert('请输入 API 地址！');
        return;
    }

    if (!modelName) {
        alert('请输入模型名称！');
        return;
    }

    if (concurrency < 1 || concurrency > 20) {
        alert('并行测试数量必须在 1-20 之间！');
        return;
    }

    const apiKeys = parseApiKeys(apiKeysInput);

    if (apiKeys.length === 0) {
        alert('请输入至少一个 API Key！');
        return;
    }

    // 重置结果
    testResults = { valid: [], invalid: {} };

    // 创建新的中止控制器
    testAbortController = new AbortController();

    // 显示进度条
    const progressDiv = document.getElementById('progress');
    const progressFill = document.getElementById('progressFill');
    const resultsDiv = document.getElementById('results');
    const testBtn = document.getElementById('testBtn');

    progressDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    testBtn.disabled = false;
    testBtn.innerHTML = '<span class="spinner"></span> 测试中... <button onclick="stopTest()" style="margin-left: 10px; padding: 5px 15px; background: #f44336; border: none; border-radius: 4px; color: white; cursor: pointer;">取消</button>';

    let completed = 0;
    const total = apiKeys.length;

    // 使用限制并发数的方式测试所有 Keys，避免请求过快被限流
    const results = [];

    try {
        // 性能优化：使用 requestIdleCallback 批量更新进度，避免频繁 DOM 操作
        let pendingProgressUpdate = false;
        const updateProgress = () => {
            if (!pendingProgressUpdate) {
                pendingProgressUpdate = true;
                requestAnimationFrame(() => {
                    const percentage = Math.round((completed / total) * 100);
                    progressFill.style.width = percentage + '%';
                    progressFill.textContent = `${completed}/${total} (${percentage}%)`;
                    pendingProgressUpdate = false;
                });
            }
        };

        for (let i = 0; i < apiKeys.length; i += concurrency) {
            // 检查是否被取消
            if (testAbortController.signal.aborted) {
                break;
            }

            const batch = apiKeys.slice(i, i + concurrency);
            const batchPromises = batch.map(async (key) => {
                // 检查是否被取消
                if (testAbortController.signal.aborted) {
                    return null;
                }

                const result = await testApiKey(apiUrl, key, modelName);
                completed++;

                // 使用优化后的进度更新
                updateProgress();

                return result;
            });

            const batchResults = await Promise.all(batchPromises);

            // 过滤掉被取消的结果
            results.push(...batchResults.filter(r => r !== null));

            // 每批次之间添加短暂延迟，避免请求过快
            if (i + concurrency < apiKeys.length && !testAbortController.signal.aborted) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // 分类结果 - 性能优化：减少对象查找
        const validKeys = [];
        const invalidKeys = {};

        results.forEach(result => {
            if (result.valid) {
                validKeys.push(result.key);
            } else {
                const category = getErrorCategory(result.status, result.statusText, result.error);
                if (!invalidKeys[category]) {
                    invalidKeys[category] = [];
                }
                invalidKeys[category].push({
                    key: result.key,
                    error: result.error || result.statusText
                });
            }
        });

        testResults.valid = validKeys;
        testResults.invalid = invalidKeys;

        // 显示结果
        displayResults();

    } catch (error) {
        console.error('测试过程出错:', error);
        alert('测试过程出错: ' + error.message);
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = '开始测试';
        testAbortController = null;
    }
}

/**
 * 停止测试
 */
function stopTest() {
    if (testAbortController) {
        testAbortController.abort();
        alert('测试已取消');
    }
}

/**
 * 显示测试结果
 */
function displayResults() {
    const resultsDiv = document.getElementById('results');
    const statsDiv = document.getElementById('stats');
    const validSection = document.getElementById('validSection');
    const validBody = document.getElementById('validBody');
    const validCount = document.getElementById('validCount');
    const invalidSections = document.getElementById('invalidSections');

    resultsDiv.style.display = 'block';

    // 显示统计
    const totalInvalid = Object.values(testResults.invalid).reduce((sum, arr) => sum + arr.length, 0);
    statsDiv.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${testResults.valid.length + totalInvalid}</div>
            <div class="stat-label">总测试数</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
            <div class="stat-number">${testResults.valid.length}</div>
            <div class="stat-label">有效 Keys</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);">
            <div class="stat-number">${totalInvalid}</div>
            <div class="stat-label">无效 Keys</div>
        </div>
    `;

    // 显示有效的 Keys - 性能优化：使用 DocumentFragment 和虚拟滚动
    if (testResults.valid.length > 0) {
        validSection.style.display = 'block';
        validCount.textContent = testResults.valid.length;

        // 性能优化：大量数据时使用虚拟滚动
        if (testResults.valid.length > 100) {
            renderVirtualList(validBody, testResults.valid, (key) => {
                const escapedKey = escapeHtml(key);
                return `<div class="key-item">
                    <div class="key-text">${escapedKey}</div>
                </div>`;
            });
        } else {
            // 少量数据直接渲染
            renderSimpleList(validBody, testResults.valid, (key) => {
                const escapedKey = escapeHtml(key);
                return `<div class="key-item">
                    <div class="key-text">${escapedKey}</div>
                </div>`;
            });
        }
    } else {
        validSection.style.display = 'none';
    }

    // 显示无效的 Keys（按错误类型分组）- 性能优化
    invalidSections.innerHTML = '';

    // 使用 DocumentFragment 减少 DOM 操作
    const fragment = document.createDocumentFragment();

    Object.entries(testResults.invalid).forEach(([category, keys]) => {
        const sectionId = 'invalid_' + category.replace(/[^a-zA-Z0-9]/g, '_');
        const section = document.createElement('div');
        section.className = 'result-section';

        const header = document.createElement('div');
        header.className = 'result-header invalid';
        header.onclick = () => toggleSection(sectionId);
        header.innerHTML = `<span><span class="toggle-icon" id="${sectionId}_icon">▼</span> ${escapeHtml(category)} (${keys.length})</span>`;

        const body = document.createElement('div');
        body.className = 'result-body';
        body.id = sectionId;

        // 大量数据使用虚拟滚动
        if (keys.length > 100) {
            renderVirtualList(body, keys, (item) => {
                const escapedKey = escapeHtml(item.key);
                const escapedError = item.error ? escapeHtml(item.error) : '';
                return `<div class="key-item">
                    <div class="key-text">
                        ${escapedKey}
                        ${item.error ? `<br><small style="color: #d32f2f;">错误: ${escapedError}</small>` : ''}
                    </div>
                </div>`;
            });
        } else {
            renderSimpleList(body, keys, (item) => {
                const escapedKey = escapeHtml(item.key);
                const escapedError = item.error ? escapeHtml(item.error) : '';
                return `<div class="key-item">
                    <div class="key-text">
                        ${escapedKey}
                        ${item.error ? `<br><small style="color: #d32f2f;">错误: ${escapedError}</small>` : ''}
                    </div>
                </div>`;
            });
        }

        section.appendChild(header);
        section.appendChild(body);
        fragment.appendChild(section);
    });

    invalidSections.appendChild(fragment);
}

/**
 * 简单列表渲染（使用 DocumentFragment 优化）
 * @param {HTMLElement} container - 容器元素
 * @param {Array} items - 数据数组
 * @param {Function} renderItem - 渲染单个项目的函数
 */
function renderSimpleList(container, items, renderItem) {
    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');

    // 批量构建 HTML
    div.innerHTML = items.map(renderItem).join('');

    // 一次性添加所有子元素
    while (div.firstChild) {
        fragment.appendChild(div.firstChild);
    }

    container.innerHTML = '';
    container.appendChild(fragment);
}

/**
 * 虚拟滚动渲染（处理大量数据）
 * @param {HTMLElement} container - 容器元素
 * @param {Array} items - 数据数组
 * @param {Function} renderItem - 渲染单个项目的函数
 */
function renderVirtualList(container, items, renderItem) {
    const itemHeight = 60; // 每个项目的估计高度
    const visibleCount = 50; // 一次渲染的数量
    let currentPage = 0;

    container.innerHTML = '';
    container.style.position = 'relative';

    // 创建提示信息
    const infoDiv = document.createElement('div');
    infoDiv.className = 'virtual-list-info';
    infoDiv.innerHTML = `<strong>性能优化:</strong> 检测到大量数据 (${items.length} 项)，采用分页显示。<br>当前显示: <span id="${container.id}_pageInfo">1-${Math.min(visibleCount, items.length)}</span>`;
    container.appendChild(infoDiv);

    // 创建内容容器
    const contentDiv = document.createElement('div');
    contentDiv.id = container.id + '_content';
    container.appendChild(contentDiv);

    // 渲染函数
    const renderPage = (page) => {
        const start = page * visibleCount;
        const end = Math.min(start + visibleCount, items.length);
        const pageItems = items.slice(start, end);

        const fragment = document.createDocumentFragment();
        const div = document.createElement('div');
        div.innerHTML = pageItems.map(renderItem).join('');

        while (div.firstChild) {
            fragment.appendChild(div.firstChild);
        }

        contentDiv.innerHTML = '';
        contentDiv.appendChild(fragment);

        // 更新分页信息
        const pageInfo = document.getElementById(container.id + '_pageInfo');
        if (pageInfo) {
            pageInfo.textContent = `${start + 1}-${end}`;
        }

        // 移除旧的分页按钮
        const oldPagination = container.querySelector('.pagination');
        if (oldPagination) {
            oldPagination.remove();
        }

        // 添加分页按钮
        if (items.length > visibleCount) {
            const pagination = document.createElement('div');
            pagination.className = 'pagination';
            pagination.style.cssText = 'display: flex; justify-content: center; gap: 10px; margin-top: 15px; padding: 10px;';

            const totalPages = Math.ceil(items.length / visibleCount);

            if (page > 0) {
                const prevBtn = document.createElement('button');
                prevBtn.textContent = '上一页';
                prevBtn.style.cssText = 'padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;';
                prevBtn.onclick = () => {
                    currentPage = page - 1;
                    renderPage(currentPage);
                    contentDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
                pagination.appendChild(prevBtn);
            }

            const pageText = document.createElement('span');
            pageText.textContent = `第 ${page + 1} / ${totalPages} 页`;
            pageText.style.cssText = 'display: flex; align-items: center; padding: 0 10px;';
            pagination.appendChild(pageText);

            if (end < items.length) {
                const nextBtn = document.createElement('button');
                nextBtn.textContent = '下一页';
                nextBtn.style.cssText = 'padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;';
                nextBtn.onclick = () => {
                    currentPage = page + 1;
                    renderPage(currentPage);
                    contentDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
                pagination.appendChild(nextBtn);
            }

            container.appendChild(pagination);
        }
    };

    // 初始渲染
    renderPage(0);
}

/**
 * 转义HTML字符，防止XSS
 * @param {string} text - 需要转义的文本
 * @returns {string} - 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 切换结果区域的展开/折叠状态
 * @param {string} bodyId - 结果区域的ID
 */
function toggleSection(bodyId) {
    const body = document.getElementById(bodyId);
    const icon = document.getElementById(bodyId.replace('Body', 'Icon') || bodyId + '_icon');

    body.classList.toggle('collapsed');
    icon.classList.toggle('collapsed');
}

/**
 * 复制所有有效的API密钥
 * @param {Event} event - 点击事件
 */
function copyAllValidKeys(event) {
    // 阻止事件冒泡，避免触发父元素的toggleSection
    event.stopPropagation();

    if (testResults.valid.length === 0) {
        alert('没有有效的 Key 可以复制！');
        return;
    }

    // 将所有有效的keys用换行符连接
    const keysText = testResults.valid.join('\n');

    // 复制到剪贴板
    navigator.clipboard.writeText(keysText).then(() => {
        const btn = document.getElementById('copyAllBtn');
        const originalText = btn.textContent;
        btn.textContent = '已复制!';
        btn.classList.add('copied');

        // 2秒后恢复按钮文本
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制。错误: ' + err.message);
    });
}
