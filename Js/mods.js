// ============================================================
//  mods.js
//  功能：模组数据转换 / 上传 / 导出 / 分享 / 装备 / 制作 / 彩蛋
//  依赖：config.js, storage.js
// ============================================================

// ============================================================
//  Blob <-> DataURL 转换
// ============================================================
function blobToDataURL(blob) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = function() { reject(reader.error || new Error('FileReader failed')); };
        reader.readAsDataURL(blob);
    });
}

function dataURLToBlob(dataUrl) {
    try {
        var parts = dataUrl.split(',');
        var meta = parts[0], body = parts[1];
        var mimeMatch = meta.match(/data:(.*?)(;base64)?$/);
        var mime = mimeMatch && mimeMatch[1] ? mimeMatch[1] : 'application/octet-stream';
        var isBase64 = meta.indexOf(';base64') !== -1;
        var binary = isBase64 ? atob(body) : decodeURIComponent(body);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new Blob([bytes], { type: mime });
    } catch (e) {
        console.warn('dataURL to Blob failed', e);
        return null;
    }
}

// ============================================================
//  判断是否为「文本类」资源（JS / CSS / HTML 等）
// ============================================================
function isTextAsset(filename) {
    if (!filename) return false;
    var lower = filename.toLowerCase();
    if (lower === HTML_ASSET_NAME.toLowerCase()) return true;
    if (lower.indexOf('.js') !== -1) return true;
    if (lower.indexOf('.css') !== -1) return true;
    if (lower.indexOf('.html') !== -1) return true;
    if (lower.indexOf('.json') !== -1) return true;
    if (lower.indexOf('.txt') !== -1) return true;
    return false;
}

// ============================================================
//  模组列表持久化（localStorage）
// ============================================================
async function saveModListToStorage() {
    var serialized = [];
    for (var i = 0; i < modList.length; i++) {
        var mod = modList[i];
        // 彩蛋模组不保存到 localStorage（每次加载时重新检测）
        if (mod.id === CLAUDE_MOD_ID) continue;

        var assets = {};
        for (var filename in mod.assets) {
            var val = mod.assets[filename];
            if (!val) continue;
            if (typeof val === 'string') {
                // 已经是字符串（文本 / dataURL），直接存
                assets[filename] = val;
            } else if (val instanceof Blob) {
                try {
                    assets[filename] = await blobToDataURL(val);
                } catch (e) {
                    console.warn('Blob to base64 failed: ' + filename, e);
                }
            }
        }
        serialized.push({
            id: mod.id,
            name: mod.name,
            equipped: !!mod.equipped,
            assets: assets
        });
    }

    var json = JSON.stringify(serialized);
    var sizeMB = json.length / (1024 * 1024);
    if (sizeMB > 4.5) {
        throw new Error('Mods total ' + sizeMB.toFixed(1) + 'MB, exceeds storage limit.');
    }

    try {
        localStorage.removeItem(MOD_STORAGE_KEY);
        localStorage.setItem(MOD_STORAGE_KEY, json);
    } catch (e) {
        if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
            throw new Error('Storage full, delete some mods and retry');
        }
        throw e;
    }

    // 回写 assets（blob 转 dataURL 后的结果更新到内存）
    var normalIdx = 0;
    for (var k = 0; k < modList.length; k++) {
        if (modList[k].id === CLAUDE_MOD_ID) continue;
        modList[k].assets = serialized[normalIdx].assets;
        normalIdx++;
    }
}

function loadModListFromStorage() {
    var json = localStorage.getItem(MOD_STORAGE_KEY);
    if (!json) return [];
    var serialized;
    try { serialized = JSON.parse(json); } catch (e) { return []; }
    if (!Array.isArray(serialized)) return [];

    var mods = [];
    for (var i = 0; i < serialized.length; i++) {
        var item = serialized[i];
        if (!item || !item.id) continue;
        if (item.id === CLAUDE_MOD_ID) continue;

        var assets = {};
        var rawAssets = item.assets || {};
        for (var filename in rawAssets) {
            var val = rawAssets[filename];

            // 文本类资源（JS / CSS / HTML / dataURL HTML 等）保持字符串
            if (isTextAsset(filename)) {
                if (typeof val === 'string') {
                    assets[filename] = val;
                } else if (val instanceof Blob) {
                    assets[filename] = val;
                }
            } else {
                // 二进制资源：dataURL 转回 Blob
                if (typeof val === 'string' && val.indexOf('data:') === 0) {
                    var blob = dataURLToBlob(val);
                    if (blob) assets[filename] = blob;
                } else if (val instanceof Blob) {
                    assets[filename] = val;
                }
            }
        }
        mods.push({
            id: item.id,
            name: item.name || 'Mod',
            equipped: !!item.equipped,
            assets: assets
        });
    }
    return mods;
}

// ============================================================
//  合并已装备模组的资源
// ============================================================
function collectEquippedAssets() {
    var merged = {};
    for (var i = 0; i < modList.length; i++) {
        var mod = modList[i];
        if (!mod.equipped) continue;
        var assets = mod.assets || {};
        for (var filename in assets) {
            // index.html 不参与资源合并（它是文本，由 syncCustomHtmlFromMods 单独处理）
            if (filename === HTML_ASSET_NAME) continue;
            merged[filename] = assets[filename];
        }
    }
    return merged;
}

// ============================================================
//  应用资源到游戏
// ============================================================
function applyBackgroundImage() {
    var bgUrl = modBlobUrls[BG_ASSET_NAME];
    if (bgUrl) {
        document.body.style.backgroundImage = "url('" + bgUrl + "')";
    } else {
        document.body.style.backgroundImage = "url('" + FOLDER_IMG + BG_ASSET_NAME + "')";
    }
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    applyBackgroundPosition();
}

function applyModAssets(assets) {
    for (var key in modBlobUrls) {
        try { URL.revokeObjectURL(modBlobUrls[key]); } catch (e) {}
    }
    modBlobUrls = {};

    if (assets) {
        for (var filename in assets) {
            var val = assets[filename];
            if (!val) continue;
            // 文本类资源（JS / CSS / HTML）不创建 blob URL（它们在引导脚本里直接用字符串）
            if (isTextAsset(filename)) continue;
            var blob = val;
            if (typeof val === 'string' && val.indexOf('data:') === 0) {
                blob = dataURLToBlob(val);
            }
            if (blob instanceof Blob) {
                try {
                    modBlobUrls[filename] = URL.createObjectURL(blob);
                } catch (e) {
                    console.warn('createObjectURL failed', filename, e);
                }
            }
        }
    }

    // 字体特殊处理
    if (modFontStyleTag) { modFontStyleTag.remove(); modFontStyleTag = null; }
    if (modBlobUrls['1.woff2']) {
        var style = document.createElement('style');
        style.textContent = "@font-face { font-family: 'WhaleCustomFont'; src: url('" + modBlobUrls['1.woff2'] + "') format('woff2'); font-weight: normal; font-style: normal; font-display: swap; }";
        document.head.appendChild(style);
        modFontStyleTag = style;
    }

    applyBackgroundImage();
    applyAllAssetUrls();
    if (typeof checkState === 'function') checkState();
}

function applyAllEquippedMods() {
    applyModAssets(collectEquippedAssets());
    syncCustomHtmlFromMods({ notifyChange: false });
}

function applyAllAssetUrls() {
    var bgm = document.getElementById('bgm');
    if (bgm) {
        var source = bgm.querySelector('source');
        if (source) {
            source.src = getAssetUrl('1.mp3');
            bgm.load();
        }
    }
    if (typeof runPlayer !== 'undefined' && runPlayer) {
        runPlayer.src = getAssetUrl('7.png');
    }
}

function getAssetUrl(filename) {
    // 1. 已被模组替换 → 用 blob URL
    if (modBlobUrls[filename]) return modBlobUrls[filename];

    // 2. 没被替换 → 按扩展名路由到对应文件夹
    var lower = filename.toLowerCase();
    if (lower.endsWith('.png') || lower.endsWith('.gif') ||
        lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
        return FOLDER_IMG + filename;
    }
    if (lower.endsWith('.mp3') || lower.endsWith('.ogg') || lower.endsWith('.wav')) {
        return FOLDER_MUSIC + filename;
    }
    if (lower.endsWith('.woff2') || lower.endsWith('.woff') || lower.endsWith('.ttf')) {
        return FOLDER_FONT + filename;
    }
    if (lower.endsWith('.css')) return FOLDER_CSS + filename;
    if (lower.endsWith('.js'))  return FOLDER_JS + filename;
    return filename;
}

// ============================================================
//  装备 / 卸载 / 删除模组
// ============================================================
async function toggleEquipMod(id) {
    var mod = modList.find(function(m) { return m.id === id; });
    if (!mod) return;
    mod.equipped = !mod.equipped;
    applyModAssets(collectEquippedAssets());
    renderModList();
    updateModStatus();
    try {
        await saveModListToStorage();
    } catch (e) {
        console.warn('Save equip state failed', e);
    }
    // 检测是否有代码文件 / HTML 变化
    checkCodeReloadHint(mod);
    syncCustomHtmlFromMods({ notifyChange: true });
}

// 检查是否有代码文件被替换，提示重启
function checkCodeReloadHint(mod) {
    if (!mod || !mod.assets) return;
    for (var filename in mod.assets) {
        if (filename === HTML_ASSET_NAME) continue;
        if (isTextAsset(filename)) {
            // 有代码文件变化 → 提示重启
            setTimeout(function() {
                if (confirm(t('mod-reload-hint'))) {
                    location.reload();
                }
            }, 300);
            return;
        }
    }
}

async function deleteModById(id) {
    if (id === CLAUDE_MOD_ID) {
        alert(currentLang === 'en' ? 'This is a hidden mod and cannot be deleted.' : '这是隐藏彩蛋模组，无法删除。');
        return;
    }
    var index = modList.findIndex(function(m) { return m.id === id; });
    if (index === -1) return;
    var wasEquipped = !!modList[index].equipped;
    var hadCode = false;
    for (var fn in modList[index].assets) {
        if (isTextAsset(fn)) { hadCode = true; break; }
    }

    modList.splice(index, 1);
    applyModAssets(collectEquippedAssets());
    renderModList();
    updateModStatus();
    try {
        await saveModListToStorage();
    } catch (e) {
        console.warn('Delete save failed', e);
    }
    if (wasEquipped && hadCode) {
        setTimeout(function() {
            if (confirm(t('mod-reload-hint'))) {
                location.reload();
            }
        }, 300);
    }
    syncCustomHtmlFromMods({ notifyChange: true });
}

// ============================================================
//  冲突检测
// ============================================================
function getConflictFiles(modId) {
    var target = modList.find(function(m) { return m.id === modId; });
    if (!target) return [];
    var conflictSet = {};
    for (var i = 0; i < modList.length; i++) {
        var other = modList[i];
        if (other.id === modId) continue;
        if (!other.equipped) continue;
        for (var filename in other.assets) {
            if (filename === HTML_ASSET_NAME) continue;
            if (target.assets[filename]) conflictSet[filename] = true;
        }
    }
    return Object.keys(conflictSet);
}

// ============================================================
//  渲染模组列表
// ============================================================
function renderModList() {
    var listElement = document.getElementById('mod-list');
    if (!listElement) return;

    // 过滤：彩蛋模组只在名字为 Claude 时显示
    var displayList = modList.filter(function(m) {
        if (m.id === CLAUDE_MOD_ID && whaleName !== CLAUDE_TRIGGER_NAME) return false;
        return true;
    });

    if (displayList.length === 0) {
        listElement.innerHTML = '<div style="color:#aaa;text-align:center;padding:20px;">' + t('mod-list-empty') + '</div>';
        return;
    }

    var html = '';
    for (var i = 0; i < displayList.length; i++) {
        var mod = displayList[i];
        var isEquipped = !!mod.equipped;
        var isEasterEgg = (mod.id === CLAUDE_MOD_ID);
        var hasHtml = !!(mod.assets && mod.assets[HTML_ASSET_NAME]);
        var hasCode = false;
        if (mod.assets) {
            for (var fn in mod.assets) {
                if (fn === HTML_ASSET_NAME) continue;
                if (isTextAsset(fn)) { hasCode = true; break; }
            }
        }

        var conflictCount = isEquipped ? 0 : getConflictFiles(mod.id).length;
        var conflictTag = conflictCount > 0
            ? '<span class="mod-conflict">' + t('mod-tag-conflict') + conflictCount + t('mod-tag-conflict-unit') + '</span>'
            : '';
        var htmlTag = hasHtml ? '<span class="mod-html-tag">' + t('mod-tag-html') + '</span>' : '';
        var codeTag = hasCode ? '<span class="mod-code-tag">' + t('mod-tag-code') + '</span>' : '';

        var deleteBtn = isEasterEgg ? '' : '<button onclick="deleteModById(\'' + mod.id + '\')" style="background:#e74c3c;">' + t('mod-btn-delete') + '</button>';
        var exportBtn = '<button onclick="exportModById(\'' + mod.id + '\')" style="background:#16a085;">' + t('mod-btn-export') + '</button>';
        var shareBtn = '<button onclick="shareModById(\'' + mod.id + '\')" style="background:#9b59b6;">' + t('mod-btn-share') + '</button>';
        var displayName = isEasterEgg ? t('easter-egg-mod-name') : (mod.name || 'Mod');

        html += '<div class="mod-item' +
                (isEquipped ? ' equipped' : '') +
                (isEasterEgg ? ' easter-egg' : '') +
                (hasHtml ? ' has-html' : '') +
                (hasCode ? ' has-code' : '') +
            '">' +
            '<div class="mod-info">' +
                '<span class="mod-name">' + displayName + '</span>' +
                (isEquipped ? '<span class="mod-tag">' + t('mod-tag-equipped') + '</span>' : '') +
                htmlTag + codeTag + conflictTag +
            '</div>' +
            '<div class="mod-buttons">' +
                '<button onclick="toggleEquipMod(\'' + mod.id + '\')" style="background:' + (isEquipped ? '#e67e22' : '#2ecc71') + ';">' + (isEquipped ? t('mod-btn-unequip') : t('mod-btn-equip')) + '</button>' +
                shareBtn + exportBtn + deleteBtn +
            '</div></div>';
    }
    listElement.innerHTML = html;
}

function updateModStatus() {
    var modStatus = document.getElementById('mod-status');
    if (!modStatus) return;
    var equippedMods = modList.filter(function(m) {
        if (!m.equipped) return false;
        if (m.id === CLAUDE_MOD_ID && whaleName !== CLAUDE_TRIGGER_NAME) return false;
        return true;
    });
    if (equippedMods.length === 0) {
        modStatus.textContent = t('mod-status-none');
    } else {
        modStatus.textContent = t('mod-status-equipped') + equippedMods.length + t('mod-status-equipped-unit') +
            equippedMods.map(function(m) {
                return m.id === CLAUDE_MOD_ID ? t('easter-egg-mod-name') : (m.name || 'Mod');
            }).join(', ');
    }
}

// ============================================================
//  打包为 ZIP
// ============================================================
async function packModAsZipBlob(mod) {
    if (typeof JSZip === 'undefined') throw new Error(t('export-jszip-missing'));
    var zip = new JSZip();
    var addedCount = 0;
    for (var filename in mod.assets) {
        var val = mod.assets[filename];
        if (!val) continue;

        // 文本类资源（JS / CSS / HTML）以纯文本形式写入
        if (isTextAsset(filename) && typeof val === 'string' && val.indexOf('data:') !== 0) {
            zip.file(filename, val);
            addedCount++;
            continue;
        }

        var blob = val;
        if (typeof val === 'string' && val.indexOf('data:') === 0) {
            blob = dataURLToBlob(val);
        }
        if (blob instanceof Blob) {
            zip.file(filename, blob);
            addedCount++;
        }
    }
    if (addedCount === 0) throw new Error(t('export-no-assets'));
    return await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
    });
}

function safeModFileName(mod) {
    var safeName = (mod.name || 'mod').replace(/[\\/:*?"<>|]/g, '_');
    if (!/\.zip$/i.test(safeName)) safeName += '.zip';
    return safeName;
}

// ============================================================
//  导出模组为 ZIP
// ============================================================
async function exportModById(id) {
    var mod = modList.find(function(m) { return m.id === id; });
    if (!mod) return;
    try {
        var outBlob = await packModAsZipBlob(mod);
        var url = URL.createObjectURL(outBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = safeModFileName(mod);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { try { URL.revokeObjectURL(url); } catch (e) {} }, 60000);
        alert(t('export-success'));
    } catch (e) {
        console.warn('Export failed', e);
        alert(t('export-fail') + (e && e.message ? e.message : e));
    }
}

// ============================================================
//  分享模组（优先 Web Share API，回退下载）
// ============================================================
async function shareModById(id) {
    var mod = modList.find(function(m) { return m.id === id; });
    if (!mod) return;

    var outBlob, fileName;
    try {
        outBlob = await packModAsZipBlob(mod);
        fileName = safeModFileName(mod);
    } catch (e) {
        alert(t('share-fail') + (e && e.message ? e.message : e));
        return;
    }

    // 尝试 Web Share API
    var shareFile = null;
    try {
        shareFile = new File([outBlob], fileName, { type: 'application/zip' });
    } catch (e) { shareFile = null; }

    if (shareFile && navigator.canShare && navigator.share) {
        var canShareFiles = false;
        try { canShareFiles = navigator.canShare({ files: [shareFile] }); } catch (e) {}
        if (canShareFiles) {
            try {
                await navigator.share({
                    files: [shareFile],
                    title: t('share-title'),
                    text: t('share-text') + (mod.name || 'Mod')
                });
                return;
            } catch (err) {
                if (err && err.name === 'AbortError') return;
                console.warn('navigator.share failed', err);
            }
        }
    }

    // 回退：下载文件并提示
    try {
        var url = URL.createObjectURL(outBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { try { URL.revokeObjectURL(url); } catch (e) {} }, 60000);
        alert(t('share-not-supported'));
    } catch (e) {
        alert(t('share-fail') + (e && e.message ? e.message : e));
    }
}

// ============================================================
//  上传 ZIP 模组
// ============================================================
function handleModUpload(event) {
    try {
        var file = event.target.files[0];
        if (!file) return;

        if (!/\.zip$/i.test(file.name)) {
            alert('请选择 .zip 格式的文件');
            event.target.value = '';
            return;
        }
        if (typeof JSZip === 'undefined') {
            alert('ZIP 解析库未加载，请检查网络或重新打开应用');
            event.target.value = '';
            return;
        }

        var zip = new JSZip();
        zip.loadAsync(file).then(function(zipContent) {
            var assets = {};
            var promises = [];
            var htmlCheck = { ok: true };

            for (var i = 0; i < MOD_UPLOAD_FILES.length; i++) {
                (function(filename) {
                    var fileEntry = zipContent.file(filename);
                    if (!fileEntry) return;

                    if (filename === HTML_ASSET_NAME) {
                        // index.html 特殊处理：读文本 + 评估
                        promises.push(fileEntry.async('text').then(function(text) {
                            var ev = evaluateGameHtml(text);
                            if (!ev.valid) {
                                htmlCheck.ok = false;
                                htmlCheck.hits = ev.hits;
                                htmlCheck.total = ev.total;
                            } else {
                                assets[filename] = text;
                            }
                        }));
                    } else if (isTextAsset(filename)) {
                        // 代码文件（JS / CSS）：读文本
                        promises.push(fileEntry.async('text').then(function(text) {
                            assets[filename] = text;
                        }));
                    } else {
                        // 二进制资源
                        promises.push(fileEntry.async('blob').then(function(blob) {
                            assets[filename] = blob;
                        }));
                    }
                })(MOD_UPLOAD_FILES[i]);
            }
            return Promise.all(promises).then(function() {
                return { assets: assets, htmlCheck: htmlCheck };
            });
        }).then(function(result) {
            if (!result.htmlCheck.ok) {
                var msg = t('not-game-html') + '\n\n' + t('not-game-html-detail')
                    .replace('{hit}', String(result.htmlCheck.hits))
                    .replace('{total}', String(result.htmlCheck.total));
                alert(msg);
                return;
            }
            if (Object.keys(result.assets).length === 0) {
                alert('ZIP 中未找到任何可用资源文件！');
                return;
            }
            var newMod = {
                id: 'mod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: file.name.replace(/\.zip$/i, '') || 'Mod',
                assets: result.assets,
                equipped: false
            };
            modList.push(newMod);
            saveModListToStorage().then(function() {
                renderModList();
                updateModStatus();
                alert('模组上传成功！');
            }).catch(function(err) {
                modList.pop();
                alert('模组保存失败：' + (err && err.message ? err.message : err));
            });
        }).catch(function(err) {
            alert('ZIP 解析失败：' + (err && err.message ? err.message : err));
        });
    } catch (e) {
        alert('上传出错：' + e.message);
    }
    event.target.value = '';
}

// ============================================================
//  加载模组列表
// ============================================================
function loadMods() {
    var mods = [];
    try {
        mods = loadModListFromStorage();
    } catch (e) {
        console.warn('Load mods failed', e);
    }
    modList = mods;
    applyModAssets(collectEquippedAssets());
    renderModList();
    updateModStatus();
}

// ============================================================
//  打开 / 关闭模组管理
// ============================================================
function openModManager() {
    document.getElementById('mod-manager-modal').classList.add('show');
    document.getElementById('settings-modal').classList.remove('show');
    document.getElementById('mod-maker-modal').classList.remove('show');
    var ce = document.getElementById('code-editor-modal');
    if (ce) ce.classList.remove('show');
    renderModList();
    updateModStatus();
}

function closeModManager() {
    document.getElementById('mod-manager-modal').classList.remove('show');
    document.getElementById('settings-modal').classList.add('show');
}

// ============================================================
//  打开 / 关闭制作模组
// ============================================================
function openModMaker() {
    document.getElementById('mod-maker-modal').classList.add('show');
    document.getElementById('settings-modal').classList.remove('show');
    document.getElementById('mod-manager-modal').classList.remove('show');
    var ce = document.getElementById('code-editor-modal');
    if (ce) ce.classList.remove('show');
    renderModMakerList();
}

function closeModMaker() {
    document.getElementById('mod-maker-modal').classList.remove('show');
    document.getElementById('settings-modal').classList.add('show');
}

// ============================================================
//  渲染制作模组列表
// ============================================================
function renderModMakerList() {
    var listElement = document.getElementById('mod-maker-list');
    if (!listElement) return;

    var html = '';
    var requiredCount = 0;
    var requiredTotal = 0;

    // 分组标题：资源文件
    html += '<div class="mod-maker-group-title">' + t('mod-maker-group-res') + '</div>';

    var codeGroupAdded = false;

    for (var i = 0; i < MOD_MAKER_REQUIRED.length; i++) {
        var item = MOD_MAKER_REQUIRED[i];
        var isOptional = !!item.optional;
        var isCode = !!item.isCode;

        if (!isOptional) requiredTotal++;
        var uploaded = !!modMakerFiles[item.file];
        if (!isOptional && uploaded) requiredCount++;

        // 遇到第一个代码文件，插入代码分组标题
        if (isCode && !codeGroupAdded) {
            html += '<div class="mod-maker-group-title">' + t('mod-maker-group-code') + '</div>';
            codeGroupAdded = true;
        }

        var optTag = isOptional ? ' [' + t('mod-maker-optional') + ']' : '';
        var cls = 'mod-maker-item';
        if (isCode) cls += ' code-item';
        else if (isOptional) cls += ' optional';

        html += '<div class="' + cls + '">' +
            '<div class="mod-maker-info">' +
                '<div class="mod-maker-name">' + item.file + optTag +
                    '<span class="mod-maker-desc">(' + item.desc + ')</span>' +
                '</div>' +
            '</div>' +
            '<div class="mod-maker-status">' + (uploaded ? '✅' : '⬜') + '</div>' +
            '<button type="button" data-mod-file="' + item.file + '" style="background:' + (uploaded ? '#e67e22' : '#426EFE') + ';">' + (uploaded ? t('mod-maker-reselect') : t('mod-maker-upload-btn')) + '</button>' +
        '</div>';
    }

    var hasAny = requiredCount > 0;
    var missing = requiredTotal - requiredCount;
    var btnText;
    if (!hasAny) btnText = t('mod-maker-please-upload');
    else if (missing > 0) btnText = t('mod-maker-create-with-missing') + missing + t('mod-maker-create-with-missing-unit');
    else btnText = t('mod-maker-create');

    html += '<button class="mod-maker-create-btn" id="mod-maker-create-btn" type="button" ' +
        (hasAny ? '' : 'disabled ') +
        'style="background:' + (hasAny ? '#4CAF50' : '#666') + ';">' + btnText + '</button>';

    listElement.innerHTML = html;

    var hint = document.getElementById('mod-maker-hint');
    if (hint) {
        if (hasAny && missing > 0) {
            hint.textContent = t('mod-maker-uploaded') + requiredCount + t('mod-maker-of') + requiredTotal + t('mod-maker-files') + t('mod-maker-missing-suffix');
        } else if (hasAny) {
            hint.textContent = t('mod-maker-uploaded') + requiredCount + t('mod-maker-of') + requiredTotal + t('mod-maker-files') + t('mod-maker-ready');
        } else {
            hint.textContent = t('mod-maker-hint');
        }
    }
}

// ============================================================
//  上传单个文件（制作模组时用）
// ============================================================
function uploadModMakerFile(filename) {
    try {
        var input = document.createElement('input');
        input.type = 'file';
        if (filename === HTML_ASSET_NAME) input.accept = '.html,text/html';
        else if (filename.endsWith('.gif')) input.accept = 'image/gif';
        else if (filename.endsWith('.png')) input.accept = 'image/png';
        else if (filename.endsWith('.mp3')) input.accept = 'audio/mpeg,audio/*';
        else if (filename.endsWith('.woff2')) input.accept = '.woff2,font/woff2';
        else if (filename.endsWith('.js')) input.accept = '.js,text/javascript,application/javascript';
        else if (filename.endsWith('.css')) input.accept = '.css,text/css';
        else input.accept = '*/*';

        input.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;

            if (filename === HTML_ASSET_NAME) {
                // index.html 读文本 + 评估
                var reader = new FileReader();
                reader.onload = function() {
                    var text = reader.result;
                    var ev = evaluateGameHtml(text);
                    if (!ev.valid) {
                        var msg = t('not-game-html') + '\n\n' + t('not-game-html-detail')
                            .replace('{hit}', String(ev.hits))
                            .replace('{total}', String(ev.total));
                        alert(msg);
                    } else {
                        modMakerFiles[filename] = text;
                        renderModMakerList();
                    }
                };
                reader.readAsText(file, 'utf-8');
            } else if (filename.endsWith('.js') || filename.endsWith('.css')) {
                // 代码文件：读文本
                var reader2 = new FileReader();
                reader2.onload = function() {
                    modMakerFiles[filename] = reader2.result;
                    renderModMakerList();
                };
                reader2.onerror = function() {
                    alert('文件读取失败：' + filename);
                };
                reader2.readAsText(file, 'utf-8');
            } else {
                // 二进制资源
                modMakerFiles[filename] = new Blob([file], { type: file.type || 'application/octet-stream' });
                renderModMakerList();
            }
            e.target.value = '';
        });
        input.click();
    } catch (err) {
        alert('无法打开文件选择器：' + (err && err.message ? err.message : err));
    }
}

// ============================================================
//  生成模组（制作完成后）
// ============================================================
async function createModFromMaker() {
    var requiredCount = 0;
    for (var i = 0; i < MOD_MAKER_REQUIRED.length; i++) {
        if (MOD_MAKER_REQUIRED[i].optional) continue;
        if (modMakerFiles[MOD_MAKER_REQUIRED[i].file]) requiredCount++;
    }
    if (requiredCount === 0) {
        alert(t('mod-maker-please-upload'));
        return;
    }

    var nameInput = document.getElementById('mod-maker-name');
    var modName = (nameInput.value || '').trim() || ('Custom_' + new Date().toLocaleString());

    var assets = {};
    var missingFiles = [];
    for (var i = 0; i < MOD_MAKER_REQUIRED.length; i++) {
        var item = MOD_MAKER_REQUIRED[i];
        if (modMakerFiles[item.file]) {
            assets[item.file] = modMakerFiles[item.file];
        } else if (!item.optional) {
            missingFiles.push(item.file);
        }
    }

    var newMod = {
        id: 'mod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: modName,
        assets: assets,
        equipped: false
    };
    modList.push(newMod);

    try {
        await saveModListToStorage();
        renderModList();
        updateModStatus();
        modMakerFiles = {};
        nameInput.value = '';
        renderModMakerList();

        var msg = 'Mod "' + modName + '" created!';
        if (missingFiles.length > 0) {
            msg += '\nMissing ' + missingFiles.length + ' files (use originals): ' + missingFiles.join(', ');
        }
        alert(msg);
        closeModMaker();
    } catch (e) {
        modList.pop();
        alert('Mod save failed: ' + (e && e.message ? e.message : e));
    }
}

// ============================================================
//  彩蛋模组：命名 Claude 时加载 claude.zip
// ============================================================
async function loadClaudeEasterEgg() {
    if (claudeModLoading) return;
    if (location.protocol === 'file:') {
        console.warn('[Claude] file:// 下跳过彩蛋');
        return;
    }
    claudeModLoading = true;
    try {
        var response = await fetch('claude.zip', { cache: 'no-store' });
        if (!response.ok) { claudeModLoading = false; return; }

        var zipBlob = await response.blob();
        var zip = new JSZip();
        var zipContent = await zip.loadAsync(zipBlob);

        var assets = {};
        for (var i = 0; i < MOD_UPLOAD_FILES.length; i++) {
            var filename = MOD_UPLOAD_FILES[i];
            var fileEntry = zipContent.file(filename);
            if (fileEntry) {
                try {
                    if (isTextAsset(filename)) {
                        assets[filename] = await fileEntry.async('text');
                    } else {
                        assets[filename] = await fileEntry.async('blob');
                    }
                } catch (e) {}
            }
        }
        if (Object.keys(assets).length === 0) { claudeModLoading = false; return; }

        if (whaleName !== CLAUDE_TRIGGER_NAME) { claudeModLoading = false; return; }

        var wasEquipped = false;
        var existing = modList.find(function(m) { return m.id === CLAUDE_MOD_ID; });
        if (existing) wasEquipped = !!existing.equipped;

        modList = modList.filter(function(m) { return m.id !== CLAUDE_MOD_ID; });
        modList.push({
            id: CLAUDE_MOD_ID,
            name: t('easter-egg-mod-name'),
            assets: assets,
            equipped: wasEquipped,
            hidden: true
        });

        claudeModLoaded = true;
        applyAllEquippedMods();
        renderModList();
        updateModStatus();
        console.log('🐋 Claude easter egg mod loaded');
    } catch (e) {
        console.warn('[Claude] load failed', e);
    } finally {
        claudeModLoading = false;
    }
}

function checkClaudeEasterEgg() {
    if (whaleName === CLAUDE_TRIGGER_NAME) {
        if (!claudeModLoaded && !claudeModLoading) loadClaudeEasterEgg();
    } else {
        var claudeMod = modList.find(function(m) { return m.id === CLAUDE_MOD_ID; });
        if (claudeMod) {
            if (claudeMod.equipped) claudeMod.equipped = false;
            modList = modList.filter(function(m) { return m.id !== CLAUDE_MOD_ID; });
            claudeModLoaded = false;
            applyAllEquippedMods();
            renderModList();
            updateModStatus();
        }
    }
}