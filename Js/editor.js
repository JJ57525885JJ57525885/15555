// ============================================================
//  editor.js
//  功能：代码编辑器（选择文件 / 加载 / 编辑 / 保存为模组）
//  依赖：config.js, storage.js, mods.js
// ============================================================

// ============================================================
//  打开 / 关闭编辑器
// ============================================================
function openCodeEditor() {
    var modal = document.getElementById('code-editor-modal');
    if (!modal) return;

    // 关闭其他弹窗
    var ids = ['settings-modal', 'mod-manager-modal', 'mod-maker-modal', 'about-modal', 'tutorial-modal'];
    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) el.classList.remove('show');
    }

    // 初始化下拉
    initEditorFileSelect();

    // 默认加载第一个文件
    var select = document.getElementById('code-editor-file-select');
    if (select && select.options.length > 0) {
        if (!editorCurrentFile) {
            select.value = select.options[0].value;
        } else {
            select.value = editorCurrentFile;
        }
        onEditorFileChange(select.value);
    }

    modal.classList.add('show');
}

function closeCodeEditor() {
    var modal = document.getElementById('code-editor-modal');
    if (modal) modal.classList.remove('show');

    // 恢复设置面板
    var sm = document.getElementById('settings-modal');
    if (sm) sm.classList.add('show');
}

// ============================================================
//  初始化文件下拉
// ============================================================
function initEditorFileSelect() {
    var select = document.getElementById('code-editor-file-select');
    if (!select) return;

    // 长度一致说明已经初始化过
    if (select.options.length === EDITABLE_CODE_FILES.length) {
        // 只刷新文案
        refreshEditorLanguage();
        return;
    }

    select.innerHTML = '';
    for (var i = 0; i < EDITABLE_CODE_FILES.length; i++) {
        var f = EDITABLE_CODE_FILES[i];
        var opt = document.createElement('option');
        opt.value = f.file;
        var desc = (f.desc && (f.desc[currentLang] || f.desc.zh)) || '';
        opt.textContent = f.file + ' —— ' + desc;
        select.appendChild(opt);
    }
}

// ============================================================
//  切换文件
// ============================================================
function onEditorFileChange(filename) {
    if (!filename) return;

    // 有未保存的修改，先确认
    if (editorIsDirty) {
        if (!confirm(t('code-editor-unsaved-confirm'))) {
            var select = document.getElementById('code-editor-file-select');
            if (select && editorCurrentFile) select.value = editorCurrentFile;
            return;
        }
    }

    loadEditorFile(filename);
}

// ============================================================
//  重新加载当前文件
// ============================================================
function reloadEditorFile() {
    if (!editorCurrentFile) return;
    if (editorIsDirty) {
        if (!confirm(t('code-editor-unsaved-confirm'))) return;
    }
    loadEditorFile(editorCurrentFile);
}

// ============================================================
//  加载文件内容（异步）
//  优先级：已装备的模组里替换的内容 > 服务器 fetch > document 回退
// ============================================================
async function loadEditorFile(filename) {
    var textarea = document.getElementById('code-editor-textarea');
    var info = document.getElementById('code-editor-info');
    var saveBtn = document.getElementById('code-editor-save-btn');
    if (!textarea) return;

    editorCurrentFile = filename;
    editorIsDirty = false;

    if (info) {
        info.textContent = t('code-editor-loading');
        info.classList.remove('warning');
    }
    textarea.value = '';
    textarea.disabled = true;
    if (saveBtn) saveBtn.disabled = true;

    var content = null;

    // 1. 优先从已装备的模组读取（用户之前修改过的版本）
    try {
        if (typeof modList !== 'undefined' && modList) {
            for (var i = modList.length - 1; i >= 0; i--) {
                var mod = modList[i];
                if (!mod.equipped) continue;
                if (mod.assets && mod.assets[filename]) {
                    var val = mod.assets[filename];
                    if (typeof val === 'string' && val.indexOf('data:') !== 0) {
                        content = val;
                        break;
                    }
                }
            }
        }
    } catch (e) {}

    // 2. 从服务器 fetch 原始文件
    if (content === null) {
        try {
            var fetchPath = filename;
if (filename.endsWith('.js')) fetchPath = FOLDER_JS + filename;
else if (filename.endsWith('.css')) fetchPath = FOLDER_CSS + filename;
var resp = await fetch(fetchPath, { cache: 'no-store' });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            content = await resp.text();
        } catch (e) {
            // 3. index.html 特殊回退：从当前 DOM 拿
            if (filename === 'index.html') {
                content = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
            } else {
                if (info) {
                    info.textContent = t('code-editor-fetch-fail');
                    info.classList.add('warning');
                }
                if (saveBtn) saveBtn.disabled = false;
                textarea.disabled = false;
                return;
            }
        }
    }

    editorCurrentContent = content;
    textarea.value = content;
    textarea.disabled = false;

    if (info) {
        info.textContent = tFormat('code-editor-loaded', {
            file: filename,
            size: content.length
        });
        info.classList.remove('warning');
    }
    if (saveBtn) saveBtn.disabled = false;
}

// ============================================================
//  保存为模组
// ============================================================
async function saveEditorFile() {
    var textarea = document.getElementById('code-editor-textarea');
    var saveBtn = document.getElementById('code-editor-save-btn');
    if (!textarea || !editorCurrentFile) return;

    var content = textarea.value;
    if (!content || !content.trim()) {
        alert(t('code-editor-save-empty'));
        return;
    }

    // 内容没变化，也没必要保存
    if (content === editorCurrentContent) {
        alert(t('code-editor-unsaved-confirm'));  // 其实用同一句话提示没改
        return;
    }

    // 确认保存
    if (!confirm(tFormat('code-editor-confirm-save', { file: editorCurrentFile }))) {
        return;
    }

    if (saveBtn) saveBtn.disabled = true;

    try {
        var modName = tFormat('code-editor-save-name', { file: editorCurrentFile });
        var newMod = {
            id: 'mod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: modName,
            assets: {},
            equipped: false
        };
        newMod.assets[editorCurrentFile] = content;

        modList.push(newMod);

        try {
            await saveModListToStorage();
        } catch (e) {
            modList.pop();
            throw e;
        }

        // 刷新列表显示
        if (typeof renderModList === 'function') renderModList();
        if (typeof updateModStatus === 'function') updateModStatus();

        editorIsDirty = false;
        editorCurrentContent = content;

        alert(tFormat('code-editor-save-success', { name: modName }));

        // 询问是否前往模组管理
        if (confirm(t('code-editor-go-mod-manager'))) {
            closeCodeEditor();
            if (typeof openModManager === 'function') openModManager();
        }
    } catch (e) {
        console.warn('save editor file failed', e);
        alert(t('code-editor-save-fail') + (e && e.message ? e.message : e));
    } finally {
        if (saveBtn) saveBtn.disabled = false;
    }
}

// ============================================================
//  语言切换时刷新编辑器动态文案
// ============================================================
function refreshEditorLanguage() {
    var select = document.getElementById('code-editor-file-select');
    if (select && select.options.length > 0) {
        for (var i = 0; i < select.options.length; i++) {
            var file = select.options[i].value;
            var item = null;
            for (var j = 0; j < EDITABLE_CODE_FILES.length; j++) {
                if (EDITABLE_CODE_FILES[j].file === file) {
                    item = EDITABLE_CODE_FILES[j];
                    break;
                }
            }
            if (item) {
                var d = (item.desc && (item.desc[currentLang] || item.desc.zh)) || '';
                select.options[i].textContent = file + ' —— ' + d;
            }
        }
    }
}

// ============================================================
//  初始化编辑器事件
// ============================================================
function initCodeEditorEvents() {
    var textarea = document.getElementById('code-editor-textarea');

    if (textarea) {
        // 输入时标记为脏
        textarea.addEventListener('input', function() {
            if (editorCurrentContent !== null && this.value !== editorCurrentContent) {
                editorIsDirty = true;
            } else {
                editorIsDirty = false;
            }
        });

        // Tab 键插入四个空格（不跳出输入框）
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
                editorIsDirty = true;
            }
        });

        // 允许在编辑器里正常选中 / 复制 / 粘贴（避免被 body 的 user-select:none 影响）
        textarea.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        }, { passive: true });
        textarea.addEventListener('touchmove', function(e) {
            e.stopPropagation();
        }, { passive: true });
    }

    // 点击遮罩关闭
    var modal = document.getElementById('code-editor-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeCodeEditor();
        });
    }
}

// ============================================================
//  DOM 就绪后初始化
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeEditorEvents);
} else {
    initCodeEditorEvents();
}