// ============================================================
//  main.js
//  功能：初始化入口 / 事件绑定 / 全局函数暴露
//  依赖：config.js, storage.js, mods.js, edit.js, game.js, achievements.js
// ============================================================

// ============================================================
//  模组上传按钮绑定
// ============================================================
function bindModUpload() {
    var uploadBtn = document.getElementById('mod-upload-btn');
    var fileInput = document.getElementById('mod-file-input');
    if (!uploadBtn || !fileInput) return;
    if (uploadBtn.dataset.bound === '1') return;
    uploadBtn.dataset.bound = '1';

    var triggerUpload = function(e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        try {
            fileInput.click();
        } catch (err) {
            alert('无法打开文件选择器：' + (err && err.message ? err.message : err));
        }
    };

    uploadBtn.addEventListener('click', triggerUpload);
    uploadBtn.addEventListener('touchend', triggerUpload);
    fileInput.addEventListener('change', handleModUpload);
}

// ============================================================
//  制作模组列表的事件委托
// ============================================================
function bindModMakerEvents() {
    var listEl = document.getElementById('mod-maker-list');
    if (!listEl || listEl.dataset.bound === '1') return;
    listEl.dataset.bound = '1';

    listEl.addEventListener('click', function(e) {
        var btn = e.target;
        while (btn && btn !== listEl) {
            if (btn.tagName === 'BUTTON') break;
            btn = btn.parentElement;
        }
        if (!btn || btn.tagName !== 'BUTTON') return;

        e.preventDefault();
        e.stopPropagation();

        if (btn.id === 'mod-maker-create-btn') {
            createModFromMaker();
        } else if (btn.dataset && btn.dataset.modFile) {
            uploadModMakerFile(btn.dataset.modFile);
        }
    });
}

// ============================================================
//  模态框：点击遮罩层关闭
// ============================================================
function bindModalClickOutside() {
    var s = document.getElementById('settings-modal');
    var m = document.getElementById('mod-manager-modal');
    var a = document.getElementById('about-modal');
    var mm = document.getElementById('mod-maker-modal');
    var t = document.getElementById('tutorial-modal');
    var am = document.getElementById('advanced-settings-modal');
    var acm = document.getElementById('achievements-modal');

    if (s) s.addEventListener('click', function(e) { if (e.target === s) closeSettings(); });
    if (m) m.addEventListener('click', function(e) { if (e.target === m) closeModManager(); });
    if (a) a.addEventListener('click', function(e) { if (e.target === a) closeAbout(); });
    if (mm) mm.addEventListener('click', function(e) { if (e.target === mm) closeModMaker(); });
    if (t) t.addEventListener('click', function(e) { if (e.target === t) closeTutorial(); });
    if (am) am.addEventListener('click', function(e) { if (e.target === am) closeAdvancedSettings(); });
    if (acm) acm.addEventListener('click', function(e) { if (e.target === acm) closeAchievements(); });
}

// ============================================================
//  全局键盘：ESC 逐层关闭
// ============================================================
function bindGlobalKeydown() {
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;

        var settingsModal = document.getElementById('settings-modal');
        var shop = document.getElementById('shop');
        var foodShop = document.getElementById('food-shop');
        var feedPanel = document.getElementById('feed-panel');
        var runGame = document.getElementById('run-game');
        var modManagerModal = document.getElementById('mod-manager-modal');
        var modMakerModal = document.getElementById('mod-maker-modal');
        var aboutModal = document.getElementById('about-modal');
        var tutorialModal = document.getElementById('tutorial-modal');
        var advancedModal = document.getElementById('advanced-settings-modal');
        var achievementsModal = document.getElementById('achievements-modal');
        var whaleNameInput = document.getElementById('whale-name-input');

        if (achievementsModal && achievementsModal.classList.contains('show')) closeAchievements();
        else if (advancedModal && advancedModal.classList.contains('show')) closeAdvancedSettings();
        else if (settingsModal && settingsModal.classList.contains('show')) closeSettings();
        else if (shop && shop.classList.contains('active')) toggleShop();
        else if (foodShop && foodShop.classList.contains('active')) toggleFoodShop();
        else if (feedPanel && feedPanel.classList.contains('active')) closeFeedPanel();
        else if (runGame && runGame.style.display === 'block') closeRunGame();
        else if (modManagerModal && modManagerModal.classList.contains('show')) closeModManager();
        else if (modMakerModal && modMakerModal.classList.contains('show')) closeModMaker();
        else if (aboutModal && aboutModal.classList.contains('show')) closeAbout();
        else if (tutorialModal && tutorialModal.classList.contains('show')) closeTutorial();
        else if (editMode) toggleEditMode();
        else if (whaleNameInput && !whaleNameInput.classList.contains('show')) saveNameFromInput();
    });
}

// ============================================================
//  离开页面 / 切后台 时保存
// ============================================================
function bindBeforeUnload() {
    window.addEventListener('beforeunload', function() {
        try { saveGame(true, true); } catch (e) {}
    });
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            try { saveGame(true, true); } catch (e) {}
        }
    });
}

// ============================================================
//  全屏：首次加载 + 首次交互
// ============================================================
function bindFullscreenEvents() {
    function firstInteractFs() {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            document.removeEventListener('click', firstInteractFs);
            document.removeEventListener('touchstart', firstInteractFs);
            return;
        }
        enterFullscreen();
        document.removeEventListener('click', firstInteractFs);
        document.removeEventListener('touchstart', firstInteractFs);
    }

    document.addEventListener('click', firstInteractFs);
    document.addEventListener('touchstart', firstInteractFs);

    window.addEventListener('load', function() {
        setTimeout(function() {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                enterFullscreen();
            }
        }, 100);
    });

    document.addEventListener('fullscreenchange', updateFullscreenBtn);
    document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);
}

// ============================================================
//  暴露所有需要被 HTML onclick 调用的函数到 window
// ============================================================
function exposeGlobals() {
    // ============ 设置 / 存档 ============
    window.saveGame = saveGame;
    window.loadGame = loadGame;
    window.setLanguage = setLanguage;
    window.exitGame = exitGame;
    window.toggleFullscreen = toggleFullscreen;
    window.restartGame = restartGame;
    window.downloadSourceCode = downloadSourceCode;

    // ============ 商店 / 帽子 ============
    window.toggleShop = toggleShop;
    window.buyOrWearHat = buyOrWearHat;

    // ============ 食物 ============
    window.toggleFoodShop = toggleFoodShop;
    window.openFeedPanel = openFeedPanel;
    window.closeFeedPanel = closeFeedPanel;
    window.claimFreeApple = claimFreeApple;
    window.buyFood = buyFood;
    window.feedWhale = feedWhale;

    // ============ 交互动作 ============
    window.pet = pet;
    window.bathe = bathe;
    window.lift = lift;

    // ============ 音乐 / 自动保存 ============
    window.toggleMusic = toggleMusic;
    window.toggleAutoSave = toggleAutoSave;

    // ============ 设置 / 关于 / 教程 ============
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.openAbout = openAbout;
    window.closeAbout = closeAbout;
    window.openTutorial = openTutorial;
    window.closeTutorial = closeTutorial;
    window.goToAbout = goToAbout;
    window.downloadApp = downloadApp;

    // ============ 模组 ============
    window.openModManager = openModManager;
    window.closeModManager = closeModManager;
    window.openModMaker = openModMaker;
    window.closeModMaker = closeModMaker;
    window.handleModUpload = handleModUpload;
    window.toggleEquipMod = toggleEquipMod;
    window.deleteModById = deleteModById;
    window.exportModById = exportModById;
    window.shareModById = shareModById;
    window.createModFromMaker = createModFromMaker;
    window.uploadModMakerFile = uploadModMakerFile;

    // ============ 编辑布局 ============
    window.toggleEditMode = toggleEditMode;
    window.setEditTarget = setEditTarget;
    window.resetCurrentEdit = resetCurrentEdit;

    // ============ 跑酷 ============
    window.openRunGame = openRunGame;
    window.closeRunGame = closeRunGame;
    window.startRunGame = startRunGame;
    window.triggerJump = triggerJump;
    window.useRevive = useRevive;
    window.giveUpRevive = giveUpRevive;
    window.restartRun = restartRun;

    // ============ 成就 / 高级设置 ============
    window.openAchievements = openAchievements;
    window.closeAchievements = closeAchievements;
    window.openAdvancedSettings = openAdvancedSettings;
    window.closeAdvancedSettings = closeAdvancedSettings;
}

// ============================================================
//  主初始化
// ============================================================
function initAll() {
    // 1. 加载语言（必须在最前，因为很多函数依赖 t()）
    loadLanguage();

    // 2. 加载存档
    loadGame();

    // 3. 初始化设置 / 名字颜色
    initSettings();
    initNameColorInput();

    // 4. 免费苹果重置检查
    checkFreeAppleReset();

    // 5. 更新 UI
    updateUI();
    updateWhaleNameDisplay();
    applyNameColor();

    // 6. 应用布局位置（按钮 / 背景 / 宠物）
    applyButtonLayout();
    applyBackgroundPosition();
    applyPetPosition();

    // 7. 启动定时器
    startAutoConsume();
    startCleanlinessDecline();
    startAutoSaveLoop();

    // 8. 渲染动态列表
    renderFeedList();

    // 9. 名字编辑器
    initNameEditor();

    // 10. 加载模组列表
    loadMods();

    // 11. 应用语言（刷新所有 data-i18n 元素）
    applyLanguage();

    // 11.5 初始化成就系统
    if (typeof initAchievements === 'function') initAchievements();

    // 12. 全屏按钮状态
    updateFullscreenBtn();

    // 13. 彩蛋模组检测（命名 Claude 触发）
    checkClaudeEasterEgg();

    // 14. 延迟同步自定义 HTML（不提示）
    setTimeout(function() {
        syncCustomHtmlFromMods({ notifyChange: false });
    }, 500);

    // 15. 绑定事件
    bindEditEvents();
    bindModUpload();
    bindModMakerEvents();
    bindModalClickOutside();
    bindGlobalKeydown();
    bindBeforeUnload();
    bindFullscreenEvents();

    // 16. 暴露全局函数
    exposeGlobals();

    // 17. 冒泡动画：每 500ms 生成一个
    setInterval(createBubble, 500);

    // 18. 完成初始化日志
    console.log('🐋 赛博打工鲸：深海饲养员 已启动');
}

// ============================================================
//  启动
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    // DOM 已经加载完毕（脚本在 body 末尾时通常会走这里）
    initAll();
}