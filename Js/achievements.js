// ============================================================
//  achievements.js
//  功能：成就系统（检测 / 解锁 / 渲染 / 持久化）
//        + 高级设置面板开关
//  依赖：config.js, storage.js
// ============================================================

// 成就数据独立的存储 key
const ACHIEVEMENTS_STORAGE_KEY = 'whaleGameAchievements_index';

// Toast 队列
var _achToastQueue = [];
var _achToastShowing = false;

// ============================================================
//  持久化
// ============================================================
function saveAchievementsData() {
    try {
        var data = { achievements: achievements, stats: stats };
        localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Save achievements failed', e);
    }
}

function loadAchievementsData() {
    try {
        var raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
        if (!raw) return;
        var data = JSON.parse(raw);
        if (data.achievements) {
            for (var k in achievements) {
                if (typeof data.achievements[k] === 'boolean') {
                    achievements[k] = data.achievements[k];
                }
            }
        }
        if (data.stats) {
            for (var s in stats) {
                if (data.stats[s] !== undefined) stats[s] = data.stats[s];
            }
        }
    } catch (e) {
        console.warn('Load achievements failed', e);
    }
}

// ============================================================
//  解锁成就
// ============================================================
function getAchievementDef(id) {
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
        if (ACHIEVEMENTS[i].id === id) return ACHIEVEMENTS[i];
    }
    return null;
}

function unlockAchievement(id) {
    if (!achievements.hasOwnProperty(id)) return;
    if (achievements[id]) return;
    achievements[id] = true;
    saveAchievementsData();
    var def = getAchievementDef(id);
    if (def) showAchievementToast(def);
    if (typeof renderAchievementsList === 'function') {
        try { renderAchievementsList(); } catch (e) {}
    }
}

// ============================================================
//  成就 Toast
// ============================================================
function injectAchievementStyles() {
    if (document.getElementById('achievement-toast-styles')) return;
    var style = document.createElement('style');
    style.id = 'achievement-toast-styles';
    style.textContent =
        '.achievement-toast{position:fixed;top:80px;left:50%;transform:translate(-50%,-30px);' +
        'background:linear-gradient(135deg,rgba(241,196,15,0.96),rgba(230,126,34,0.96));' +
        'color:#333;padding:12px 18px;border-radius:14px;display:flex;align-items:center;gap:12px;' +
        'box-shadow:0 10px 30px rgba(241,196,15,0.5);z-index:999999;opacity:0;pointer-events:none;' +
        'transition:opacity .35s ease,transform .35s ease;border:2px solid rgba(255,255,255,0.55);' +
        'max-width:90vw;box-sizing:border-box;}' +
        '.achievement-toast.show{opacity:1;transform:translate(-50%,0);}' +
        '.achievement-toast-icon{font-size:32px;flex-shrink:0;line-height:1;}' +
        '.achievement-toast-body{display:flex;flex-direction:column;gap:2px;min-width:0;}' +
        '.achievement-toast-title{font-size:12px;font-weight:bold;opacity:.75;letter-spacing:1px;}' +
        '.achievement-toast-name{font-size:16px;font-weight:bold;letter-spacing:1px;' +
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}';
    document.head.appendChild(style);
}

function showAchievementToast(def) {
    injectAchievementStyles();
    _achToastQueue.push(def);
    if (!_achToastShowing) processAchievementToastQueue();
}

function processAchievementToastQueue() {
    if (_achToastQueue.length === 0) {
        _achToastShowing = false;
        return;
    }
    _achToastShowing = true;
    var def = _achToastQueue.shift();

    var toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML =
        '<div class="achievement-toast-icon">' + def.icon + '</div>' +
        '<div class="achievement-toast-body">' +
            '<div class="achievement-toast-title">' + t('achievements-unlocked-toast') + '</div>' +
            '<div class="achievement-toast-name">' + achName(def) + '</div>' +
        '</div>';
    document.body.appendChild(toast);

    // 强制回流后再加 show 触发过渡
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            try { toast.remove(); } catch (e) {}
            processAchievementToastQueue();
        }, 400);
    }, 2600);
}

// ============================================================
//  打开 / 关闭成就面板
// ============================================================
function openAchievements() {
    renderAchievementsList();
    var modal = document.getElementById('achievements-modal');
    if (modal) modal.classList.add('show');
    var sm = document.getElementById('settings-modal');
    if (sm) sm.classList.remove('show');
}

function closeAchievements() {
    var modal = document.getElementById('achievements-modal');
    if (modal) modal.classList.remove('show');
    var sm = document.getElementById('settings-modal');
    if (sm) sm.classList.add('show');
}

// ============================================================
//  渲染成就列表
// ============================================================
function renderAchievementsList() {
    var list = document.getElementById('achievements-list');
    var progress = document.getElementById('achievements-progress');
    if (!list) return;

    var unlockedCount = 0;
    var html = '';
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
        var a = ACHIEVEMENTS[i];
        var unlocked = !!achievements[a.id];
        if (unlocked) unlockedCount++;
        html += '<div class="achievement-item' + (unlocked ? ' unlocked' : '') + '">' +
            '<div class="achievement-icon">' + a.icon + '</div>' +
            '<div class="achievement-info">' +
                '<div class="achievement-name">' + achName(a) + '</div>' +
                '<div class="achievement-desc">' + achDesc(a) + '</div>' +
            '</div>' +
            '<div class="achievement-status">' + (unlocked ? '✅' : '🔒') + '</div>' +
        '</div>';
    }
    list.innerHTML = html;

    if (progress) {
        progress.textContent = tFormat('achievements-progress', {
            done: unlockedCount,
            total: ACHIEVEMENTS.length
        });
    }
}

// ============================================================
//  触发点：各成就的检测函数
// ============================================================

// 起名完成（开场动画 / 手动改名都会调用）
function achOnNamed() {
    unlockAchievement('first_name');
    if (whaleName === CLAUDE_TRIGGER_NAME) {
        unlockAchievement('claude');
    }
}

// 喂食一次
function achOnFeed() {
    stats.totalFeeds = (stats.totalFeeds || 0) + 1;
    unlockAchievement('first_feed');
    // 成功喂食一次 → 重置"连续服务器繁忙"计数
    stats.serverBusyStreak = 0;
    saveAchievementsData();
}

// 抚摸一次
function achOnPet() {
    stats.totalPets = (stats.totalPets || 0) + 1;
    unlockAchievement('first_pet');
    if (stats.totalPets >= 100) {
        unlockAchievement('pet_100');
    }
    saveAchievementsData();
}

// 进入服务器繁忙
function achOnServerBusy() {
    stats.serverBusyStreak = (stats.serverBusyStreak || 0) + 1;
    if (stats.serverBusyStreak >= 5) {
        unlockAchievement('server_busy_5');
    }
    saveAchievementsData();
}

// 获得金币（增量）
function achOnCoinsEarned(n) {
    n = n || 0;
    if (n <= 0) return;
    stats.totalCoinsEarned = (stats.totalCoinsEarned || 0) + n;
    if (stats.totalCoinsEarned >= 100) {
        unlockAchievement('coins_100');
    }
    saveAchievementsData();
}

// 获得钻石（增量）
function achOnDiamondsEarned(n) {
    n = n || 0;
    if (n <= 0) return;
    stats.totalDiamondsEarned = (stats.totalDiamondsEarned || 0) + n;
    if (stats.totalDiamondsEarned >= 10) {
        unlockAchievement('run_10');
    }
    saveAchievementsData();
}

// 帽子变化
function achOnHatsChanged() {
    var hatKeys = ['👑', '🎩', '🎓', '👒', '🧢'];
    var all = true;
    for (var i = 0; i < hatKeys.length; i++) {
        if (!ownedHats[hatKeys[i]]) { all = false; break; }
    }
    if (all) unlockAchievement('all_hats');
    saveAchievementsData();
}

// 每日登录
function achOnDailyLogin() {
    var today = getTodayStr();
    if (stats.lastPlayDate === today) return; // 同一天不重复计数

    var yesterday = getYesterdayStr();
    if (stats.lastPlayDate === yesterday) {
        stats.consecutiveDays = (stats.consecutiveDays || 0) + 1;
    } else {
        stats.consecutiveDays = 1;
    }
    stats.lastPlayDate = today;

    if (stats.consecutiveDays >= 3) {
        unlockAchievement('play_3days');
    }
    saveAchievementsData();
}

function getTodayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function getYesterdayStr() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

// ============================================================
//  高级设置面板
// ============================================================
function openAdvancedSettings() {
    var m = document.getElementById('advanced-settings-modal');
    if (m) m.classList.add('show');
    var sm = document.getElementById('settings-modal');
    if (sm) sm.classList.remove('show');
}

function closeAdvancedSettings() {
    var m = document.getElementById('advanced-settings-modal');
    if (m) m.classList.remove('show');
    var sm = document.getElementById('settings-modal');
    if (sm) sm.classList.add('show');
}

// ============================================================
//  初始化
// ============================================================
function initAchievements() {
    loadAchievementsData();
    achOnDailyLogin();
    // 如果存档里已经是 Claude，且成就是未解锁状态，补一次检查
    if (whaleName === CLAUDE_TRIGGER_NAME) {
        unlockAchievement('claude');
    }
    renderAchievementsList();
}