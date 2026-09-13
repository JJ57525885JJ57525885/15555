// ============================================================
//  storage.js
//  功能：存档 / 位置存储 / 自定义 HTML 检测 / 下载源代码包 / 重启 / 开场动画
//  依赖：config.js, achievements.js
// ============================================================

// ============================================================
//  背景 / 宠物 位置存储
// ============================================================
function getBgPos() {
    try {
        var raw = localStorage.getItem(BG_POS_KEY);
        if (!raw) return { x: 50, y: 50 };
        var p = JSON.parse(raw);
        return {
            x: typeof p.x === 'number' ? p.x : 50,
            y: typeof p.y === 'number' ? p.y : 50
        };
    } catch (e) { return { x: 50, y: 50 }; }
}

function saveBgPos(pos) {
    try { localStorage.setItem(BG_POS_KEY, JSON.stringify(pos)); } catch (e) {}
}

function getPetPos() {
    try {
        var raw = localStorage.getItem(PET_POS_KEY);
        if (!raw) return { x: 50, y: 40 };
        var p = JSON.parse(raw);
        return {
            x: typeof p.x === 'number' ? p.x : 50,
            y: typeof p.y === 'number' ? p.y : 40
        };
    } catch (e) { return { x: 50, y: 40 }; }
}

function savePetPos(pos) {
    try { localStorage.setItem(PET_POS_KEY, JSON.stringify(pos)); } catch (e) {}
}

function isLandscape() {
    return window.innerWidth > window.innerHeight;
}

// 应用背景位置（横屏时自动往下偏移 LANDSCAPE_BG_OFFSET%）
function applyBackgroundPosition() {
    var pos = getBgPos();
    var x = pos.x, y = pos.y;
    if (isLandscape()) y = Math.min(100, y + LANDSCAPE_BG_OFFSET);
    document.body.style.backgroundPosition = x + '% ' + y + '%';
}

// 应用宠物位置
function applyPetPosition() {
    var pos = getPetPos();
    var box = document.getElementById('whale-box');
    if (box) {
        box.style.left = pos.x + '%';
        box.style.top = pos.y + '%';
    }
}

// 监听屏幕方向变化：横竖屏切换时重新应用背景位置
window.addEventListener('resize', function() { applyBackgroundPosition(); });
window.addEventListener('orientationchange', function() {
    setTimeout(applyBackgroundPosition, 250);
});

// ============================================================
//  按钮布局存储
// ============================================================
function getButtonLayout() {
    try {
        var raw = localStorage.getItem(BTN_LAYOUT_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
}

function saveButtonLayout(layout) {
    try { localStorage.setItem(BTN_LAYOUT_KEY, JSON.stringify(layout)); } catch (e) {}
}

// ============================================================
//  颜色工具
// ============================================================
function normalizeHexColor(val) {
    if (!val) return null;
    val = String(val).trim();
    if (val.charAt(0) !== '#') val = '#' + val;
    if (/^#[0-9a-fA-F]{3}$/.test(val)) {
        return ('#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3]).toLowerCase();
    }
    if (/^#[0-9a-fA-F]{6}$/.test(val)) return val.toLowerCase();
    return null;
}

// ============================================================
//  存档：saveGame / loadGame
// ============================================================
function saveGame(silent, force) {
    var bgm = document.getElementById('bgm');
    var saveData = {
        token: token,
        coins: coins,
        diamonds: diamonds,
        whaleName: whaleName,
        whaleNameColor: whaleNameColor,
        currentHat: currentHat,
        hatType: hatType,
        ownedHats: ownedHats,
        foodInventory: foodInventory,
        autoSaveEnabled: autoSaveEnabled,
        freeAppleCount: freeAppleCount,
        lastFreeDate: lastFreeDate,
        cleanliness: cleanliness,
        isMusicOn: isMusicOn,
        volume: bgm ? bgm.volume : 1
    };
    var json;
    try { json = JSON.stringify(saveData); } catch (e) { return; }
    if (!force && json === _lastSavedJson) {
        if (!silent) alert(currentLang === 'en' ? 'Saved!' : '保存成功！');
        return;
    }
    try {
        localStorage.removeItem(SAVE_KEY);
        localStorage.setItem(SAVE_KEY, json);
        _lastSavedJson = json;
    } catch (e) { console.warn('Save failed', e); }
    if (!silent) alert(currentLang === 'en' ? 'Saved!' : '保存成功！');
}

function loadGame() {
    var saved = localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_KEY_LEGACY);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            token = data.token !== undefined ? data.token : 100;
            coins = data.coins !== undefined ? data.coins : 50;
            diamonds = data.diamonds !== undefined ? data.diamonds : 0;
            whaleName = data.whaleName || 'DeepSeek';
            whaleNameColor = normalizeHexColor(data.whaleNameColor) || '#ffffff';
            currentHat = data.currentHat || '';
            hatType = data.hatType || '';
            ownedHats = data.ownedHats || {};
            foodInventory = data.foodInventory || {};
            autoSaveEnabled = data.autoSaveEnabled !== undefined ? data.autoSaveEnabled : true;
            freeAppleCount = data.freeAppleCount !== undefined ? data.freeAppleCount : 3;
            lastFreeDate = data.lastFreeDate || '';
            cleanliness = data.cleanliness !== undefined ? data.cleanliness : 100;

            if (currentHat) {
                var hatImg = document.getElementById('hat-img');
                if (hatImg) hatImg.innerHTML = currentHat;
            }

            var hatButtons = document.querySelectorAll('.hat-item button');
            for (var i = 0; i < hatButtons.length; i++) {
                var btn = hatButtons[i];
                var emoji = btn.id.replace('hat-', '');
                var map = { crown: '👑', tophat: '🎩', grad: '🎓', sun: '👒', cap: '🧢' };
                if (ownedHats[map[emoji]]) {
                    btn.removeAttribute('data-i18n');
                    btn.innerHTML = (currentHat === map[emoji])
                        ? (currentLang === 'en' ? 'Worn' : '已装扮')
                        : (currentLang === 'en' ? 'Wear' : '装扮');
                }
            }

            var bgm = document.getElementById('bgm');
            if (bgm && typeof data.volume === 'number') {
                bgm.volume = Math.max(0, Math.min(1, data.volume));
            }

            if (data.isMusicOn && bgm) {
                isMusicOn = true;
                var playAttempt = bgm.play();
                if (playAttempt && playAttempt.catch) {
                    playAttempt.catch(function() {
                        var tryPlay = function() {
                            if (isMusicOn && bgm.paused) bgm.play().catch(function(){});
                            document.removeEventListener('click', tryPlay);
                            document.removeEventListener('touchstart', tryPlay);
                        };
                        document.addEventListener('click', tryPlay);
                        document.addEventListener('touchstart', tryPlay);
                    });
                }
            }

            try { _lastSavedJson = JSON.stringify(data); } catch (e) {}
        } catch (e) { console.log('Load failed'); }
    }
}

// ============================================================
//  自定义 HTML：检测 + 同步
// ============================================================
function evaluateGameHtml(html) {
    if (!html || typeof html !== 'string' || html.length < 200) {
        return { valid: false, hits: 0, total: 5 };
    }
    var keywords = [
        'data-i18n="btn-pet"',
        'data-i18n="btn-bath"',
        'data-i18n="btn-lift"',
        'data-i18n="btn-run"',
        'data-i18n="btn-food"'
    ];
    var hits = 0;
    for (var i = 0; i < keywords.length; i++) {
        if (html.indexOf(keywords[i]) !== -1) hits++;
    }
    return { valid: hits >= 3, hits: hits, total: keywords.length };
}

function getEquippedHtmlText() {
    if (typeof modList === 'undefined' || !modList) return null;
    var html = null;
    for (var i = 0; i < modList.length; i++) {
        var mod = modList[i];
        if (!mod.equipped) continue;
        if (mod.assets && mod.assets[HTML_ASSET_NAME]) {
            var val = mod.assets[HTML_ASSET_NAME];
            if (typeof val === 'string') html = val;
        }
    }
    return html;
}

function syncCustomHtmlFromMods(options) {
    options = options || {};
    var notifyChange = !!options.notifyChange;
    var newHtml = getEquippedHtmlText();
    var oldHtml = null;
    try { oldHtml = localStorage.getItem(CUSTOM_HTML_KEY); } catch (e) {}

    if (newHtml) {
        if (newHtml !== oldHtml) {
            try {
                localStorage.setItem(CUSTOM_HTML_KEY, newHtml);
                localStorage.setItem(CUSTOM_HTML_USE_KEY, '1');
            } catch (e) { console.warn('save html failed', e); }

            if (notifyChange) {
                setTimeout(function() {
                    if (confirm(t('html-mod-apply-title') + '\n\n' + t('html-mod-apply-desc'))) {
                        location.reload();
                    }
                }, 200);
            }
        }
    } else {
        if (oldHtml) {
            try {
                localStorage.removeItem(CUSTOM_HTML_KEY);
                localStorage.removeItem(CUSTOM_HTML_USE_KEY);
            } catch (e) {}

            if (notifyChange) {
                setTimeout(function() {
                    if (confirm(t('html-mod-remove-title') + '\n\n' + t('html-mod-remove-desc'))) {
                        location.reload();
                    }
                }, 200);
            }
        }
    }
}

// ============================================================
//  下载源代码包（DEEPPET.zip）
// ============================================================
function downloadSourceCode() {
    try {
        alert(t('download-source-start'));

        var link = document.createElement('a');
        link.href = SOURCE_ZIP_URL;
        link.download = 'DEEPPET.zip';
        link.target = '_blank';
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(function() {
            alert(t('download-source-success'));
        }, 500);
    } catch (e) {
        console.warn('Download source failed', e);
        alert(t('download-source-fail') + (e && e.message ? e.message : e));
    }
}

// ============================================================
//  重启（双重确认，清空所有数据）
// ============================================================
function restartGame() {
    if (!confirm(t('restart-confirm-1'))) return;
    if (!confirm(t('restart-confirm-2'))) return;

    try {
        var keys = [
            SAVE_KEY, SAVE_KEY_LEGACY, MOD_STORAGE_KEY,
            BTN_LAYOUT_KEY, BG_POS_KEY, PET_POS_KEY,
            LANG_KEY, EDIT_HINT_KEY,
            CUSTOM_HTML_KEY, CUSTOM_HTML_USE_KEY,
            INTRO_DONE_KEY,
            'whaleGameAchievements_index'
        ];
        for (var i = 0; i < keys.length; i++) {
            localStorage.removeItem(keys[i]);
        }

        var toRemove = [];
        for (var j = 0; j < localStorage.length; j++) {
            var k = localStorage.key(j);
            if (k && k.indexOf('whaleGame') === 0) toRemove.push(k);
        }
        for (var m = 0; m < toRemove.length; m++) {
            localStorage.removeItem(toRemove[m]);
        }
    } catch (e) {
        console.warn('Clear failed', e);
        alert(t('restart-fail'));
        return;
    }

    try {
        clearInterval(autoSaveInterval);
        clearInterval(intervalTimer);
        clearInterval(cleanlinessTimer);
        clearInterval(sleepTimer);
        clearInterval(bathTimer);
        clearTimeout(petTimer);
        clearTimeout(actionLockTimer);
    } catch (e) {}

    location.reload();
}

// ============================================================
//  开场动画（首次进入时播放）
//  流程：2.gif 循环 → 点击 → 3.gif 播放一次 → a.png + 命名面板 → 进入游戏
// ============================================================

// 是否已完成开场动画
function isIntroDone() {
    try {
        return localStorage.getItem(INTRO_DONE_KEY) === '1';
    } catch (e) { return false; }
}

// 标记开场动画已完成
function markIntroDone() {
    try { localStorage.setItem(INTRO_DONE_KEY, '1'); } catch (e) {}
}

// 启动开场检查（由 DOM 加载后自动调用）
function startIntroIfNeeded() {
    // 已完成 → 跳过
    if (isIntroDone()) {
        introState = 'done';
        var overlay0 = document.getElementById('intro-overlay');
        if (overlay0) overlay0.classList.remove('show');
        return;
    }

    var overlay = document.getElementById('intro-overlay');
    var gif = document.getElementById('intro-gif');
    if (!overlay || !gif) {
        // 没有开场相关 DOM，直接跳过
        markIntroDone();
        introState = 'done';
        return;
    }

    introState = 'gif1';
    overlay.classList.add('show');
    gif.src = INTRO_FIRST_GIF;

    // 阶段 1：2.gif 循环，等用户点击
    var handleFirstClick = function(e) {
        if (e) {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
        }
        overlay.removeEventListener('click', handleFirstClick);
        overlay.removeEventListener('touchstart', handleFirstClick);
        goToIntroSecondGif();
    };
    overlay.addEventListener('click', handleFirstClick);
    overlay.addEventListener('touchstart', handleFirstClick);
}

// 阶段 2：显示 3.gif（播放一次）
function goToIntroSecondGif() {
    introState = 'gif2';
    var overlay = document.getElementById('intro-overlay');
    var gif = document.getElementById('intro-gif');
    if (!overlay || !gif) { goToIntroFinal(); return; }

    gif.src = INTRO_SECOND_GIF;

    // 由于浏览器无法精确获取 GIF 时长，用一个固定时间窗口（2.6 秒）
    // 用户也可以点击提前跳过
    var switchTimer = setTimeout(goToIntroFinal, 2600);

    var skipHandler = function(e) {
        if (e) {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
        }
        clearTimeout(switchTimer);
        overlay.removeEventListener('click', skipHandler);
        overlay.removeEventListener('touchstart', skipHandler);
        goToIntroFinal();
    };
    overlay.addEventListener('click', skipHandler);
    overlay.addEventListener('touchstart', skipHandler);
}

// 阶段 3：显示 a.png + 命名面板
function goToIntroFinal() {
    introState = 'final';

    var overlay = document.getElementById('intro-overlay');
    var gif = document.getElementById('intro-gif');
    var panel = document.getElementById('intro-name-panel');
    var input = document.getElementById('intro-name-input');
    var btn = document.getElementById('intro-name-btn');

    if (!overlay || !gif || !panel) return;

    // 停掉 gif2 的监听（防止重复触发）
    // （此时 overlay 上没有 handleFirstClick 也没有 skipHandler，因为都移除了）

    gif.src = INTRO_FINAL_IMG;
    panel.classList.add('show');

    // 更新文案（跟随当前语言）
    var introTitle = document.getElementById('intro-title');
    if (introTitle) introTitle.textContent = t('intro-title');
    if (input) input.placeholder = t('intro-name-placeholder');
    if (btn) btn.textContent = t('intro-name-btn');

    // 输入框自动聚焦
    if (input) {
        setTimeout(function() {
            try { input.focus(); } catch (e) {}
        }, 300);
    }

    // 阻止输入框 / 面板上的点击冒泡到 overlay
    if (input) {
        input.onclick = function(e) { e.stopPropagation(); };
        input.ontouchstart = function(e) { e.stopPropagation(); };
        input.onkeydown = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmIntroName();
            }
        };
    }
    panel.onclick = function(e) { e.stopPropagation(); };
    panel.ontouchstart = function(e) { e.stopPropagation(); };

    // 开始游戏按钮
    if (btn) {
        btn.onclick = function(e) {
            e.stopPropagation();
            confirmIntroName();
        };
    }
}

// 用户确认名字
function confirmIntroName() {
    var input = document.getElementById('intro-name-input');
    if (!input) return;
    var name = (input.value || '').trim();
    if (!name) {
        alert(t('intro-name-empty'));
        try { input.focus(); } catch (e) {}
        return;
    }
    finishIntro(name);
}

// 完成开场动画
function finishIntro(name) {
    // 设置名字
    whaleName = name;

    // 更新页面显示
    if (typeof updateWhaleNameDisplay === 'function') {
        updateWhaleNameDisplay();
    }

    // 触发起名相关成就
    if (typeof achOnNamed === 'function') achOnNamed();

    // 标记已完成
    markIntroDone();

    // 保存到存档
    if (typeof saveGame === 'function') {
        try { saveGame(true, true); } catch (e) {}
    }

    // 隐藏开场遮罩
    var overlay = document.getElementById('intro-overlay');
    if (overlay) overlay.classList.remove('show');

    introState = 'done';

    // 触发彩蛋检查（如果名字是 Claude）
    if (typeof checkClaudeEasterEgg === 'function') {
        try { checkClaudeEasterEgg(); } catch (e) {}
    }
}

// 自动启动开场检查
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(startIntroIfNeeded, 50);
    });
} else {
    setTimeout(startIntroIfNeeded, 50);
}