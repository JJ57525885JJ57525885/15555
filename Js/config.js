// ============================================================
//  config.js
//  功能：常量 / 全局状态 / 多语言 / 教程内容 / 语言切换 / 代码文件清单
// ============================================================

// ============ 常量 ============
var CURRENT_VERSION = '1.0';
const ASSET_BASE_URL = 'https://jj57525885jj57525885.github.io/15555/';
const SAVE_KEY = 'whaleGameSave_index';
const SAVE_KEY_LEGACY = 'whaleGameSave';
const MOD_STORAGE_KEY = 'whaleGameMods_index';
const BTN_LAYOUT_KEY = 'whaleGameBtnLayout_index';
const BG_POS_KEY = 'whaleGameBgPos_index';
const PET_POS_KEY = 'whaleGamePetPos_index';
const LANG_KEY = 'whaleGameLang_index';
const EDIT_HINT_KEY = 'whaleGameEditHintShown';
const CUSTOM_HTML_KEY = 'whaleGameCustomHtml';
const CUSTOM_HTML_USE_KEY = 'whaleGameUseCustomHtml';
const CLAUDE_MOD_ID = '__claude_easter_egg__';
const CLAUDE_TRIGGER_NAME = 'Claude';
const BG_ASSET_NAME = '9.png';
const HTML_ASSET_NAME = 'index.html';
const LANDSCAPE_BG_OFFSET = 12;
const AUTO_SAVE_DELAY = 1000;

// ============ 资源文件夹 ============
var FOLDER_JS    = 'Js/';
var FOLDER_CSS   = 'Css/';
var FOLDER_IMG   = 'Picture/';
var FOLDER_MUSIC = 'Music/';
var FOLDER_FONT  = 'Font/';

// ============ 开场动画常量 ============
const INTRO_DONE_KEY = 'whaleGameIntroDone_index';
const INTRO_FIRST_GIF = FOLDER_IMG + '2.gif';
const INTRO_SECOND_GIF = FOLDER_IMG + '3.gif';
const INTRO_FINAL_IMG = FOLDER_IMG + 'a.png';

// ============ 源代码下载 ============
const SOURCE_ZIP_URL = 'https://github.com/JJ57525885JJ57525885/15555/raw/main/DEEPPET.zip';

// ============ 可替换的代码文件清单 ============
var REPLACEABLE_CODE_FILES = [
    'config.js', 'style.css', 'storage.js', 'mods.js', 'edit.js',
    'game.js', 'editor.js', 'achievements.js', 'main.js'
];

// ============ 代码编辑器可编辑的文件 ============
var EDITABLE_CODE_FILES = [
    { file: 'config.js',        desc: { zh: '常量 / 多语言 / 教程内容', en: 'Constants / i18n / tutorial' }, editable: true },
    { file: 'style.css',        desc: { zh: '所有样式', en: 'All styles' }, editable: true },
    { file: 'storage.js',       desc: { zh: '存档 / 位置存储 / 开场动画', en: 'Save / positions / intro' }, editable: true },
    { file: 'mods.js',          desc: { zh: '模组系统', en: 'Mod system' }, editable: true },
    { file: 'edit.js',          desc: { zh: '编辑布局', en: 'Edit layout' }, editable: true },
    { file: 'game.js',          desc: { zh: '鲸鱼主逻辑 / 跑酷', en: 'Main game logic / runner' }, editable: true },
    { file: 'editor.js',        desc: { zh: '代码编辑器本体', en: 'Code editor itself' }, editable: true },
    { file: 'achievements.js',  desc: { zh: '成就系统', en: 'Achievement system' }, editable: true },
    { file: 'main.js',          desc: { zh: '初始化入口', en: 'Init entry' }, editable: true },
    { file: 'index.html',       desc: { zh: '主 HTML 结构', en: 'Main HTML structure' }, editable: true }
];

// ============ 制作模组所需的文件清单 ============
var MOD_MAKER_REQUIRED = [
    { file: '1.gif',   desc: '正常 / Normal' },
    { file: '1.png',   desc: '锻炼 / Exercising' },
    { file: '2.png',   desc: '睡觉 / Sleeping' },
    { file: '3.png',   desc: '流汗 / Sweating' },
    { file: '4.png',   desc: '流泪 / Crying' },
    { file: '5.png',   desc: '抚摸 / Petting' },
    { file: '6.png',   desc: '跑酷敌人 / Runner enemy' },
    { file: '7.png',   desc: '跑酷主角 / Runner player' },
    { file: '8.png',   desc: '脏了 / Dirty' },
    { file: '9.png',   desc: '背景图 / Background' },
    { file: '1.mp3',   desc: '背景音乐 / BGM' },
    { file: '1.woff2', desc: '字体 / Font' },
    { file: HTML_ASSET_NAME, desc: '自定义界面（可选）/ Custom UI (optional)', optional: true },
    { file: 'config.js',        desc: '代码模块（可选）/ Code module (optional)', optional: true, isCode: true },
    { file: 'style.css',        desc: '代码模块（可选）/ Code module (optional)', optional: true, isCode: true },
    { file: 'storage.js',       desc: '代码模块（可选）/ Code module (optional)', optional: true, isCode: true },
    { file: 'mods.js',          desc: '代码模块（可选）/ Code module (optional)', optional: true, isCode: true },
    { file: 'edit.js',          desc: '代码模块（可选）/ Code module (optional)', optional: true, isCode: true },
    { file: 'game.js',          desc: '代码模块（可选）/ Code module (optional)', optional: true, isCode: true },
    { file: 'editor.js',        desc: '代码模块（可选）/ Code module (optional)', optional: true, isCode: true },
    { file: 'achievements.js',  desc: '代码模块（可选）/ Code module (optional)', optional: true, isCode: true },
    { file: 'main.js',          desc: '代码模块（可选）/ Code module (optional)', optional: true, isCode: true }
];

var MOD_UPLOAD_FILES = [
    '1.gif', '1.png', '2.png', '3.png', '4.png', '5.png',
    '6.png', '7.png', '8.png', '9.png',
    '1.mp3', '1.woff2',
    HTML_ASSET_NAME,
    'config.js', 'style.css', 'storage.js', 'mods.js', 'edit.js',
    'game.js', 'editor.js', 'achievements.js', 'main.js'
];

// ============================================================
//  成就系统定义（共 10 个）
// ============================================================
var ACHIEVEMENTS = [
    {
        id: 'first_name',
        icon: '🐋',
        name: { zh: '初入深海', en: 'First Dive' },
        desc: { zh: '给虎鲸起一个名字', en: 'Give your whale a name' }
    },
    {
        id: 'first_feed',
        icon: '🍎',
        name: { zh: '初次投喂', en: 'First Feed' },
        desc: { zh: '第一次给虎鲸喂食', en: 'Feed the whale for the first time' }
    },
    {
        id: 'first_pet',
        icon: '🤚',
        name: { zh: '初次抚摸', en: 'First Pet' },
        desc: { zh: '第一次抚摸虎鲸', en: 'Pet the whale for the first time' }
    },
    {
        id: 'pet_100',
        icon: '💖',
        name: { zh: '百次抚摸', en: 'Pet Master' },
        desc: { zh: '累计抚摸虎鲸 100 次', en: 'Pet the whale 100 times total' }
    },
    {
        id: 'server_busy_5',
        icon: '🚧',
        name: { zh: '屡战屡败', en: 'Five Failures' },
        desc: { zh: '连续 5 次进入服务器繁忙', en: 'Reach server-busy 5 times in a row' }
    },
    {
        id: 'play_3days',
        icon: '📅',
        name: { zh: '三日之约', en: 'Three Days' },
        desc: { zh: '连续游玩 3 天', en: 'Play for 3 consecutive days' }
    },
    {
        id: 'run_10',
        icon: '💎',
        name: { zh: '钻石猎手', en: 'Diamond Hunter' },
        desc: { zh: '跑酷累计获得 10 颗钻石', en: 'Earn 10 diamonds in runner total' }
    },
    {
        id: 'coins_100',
        icon: '🪙',
        name: { zh: '金玉满堂', en: 'Full of Gold' },
        desc: { zh: '累计获得 100 金币', en: 'Earn 100 coins total' }
    },
    {
        id: 'all_hats',
        icon: '🎩',
        name: { zh: '帽子收藏', en: 'Hat Collector' },
        desc: { zh: '拥有全部 5 顶帽子', en: 'Own all 5 hats' }
    },
    {
        id: 'claude',
        icon: '✨',
        name: { zh: '深海谜语', en: 'Deep Riddle' },
        desc: { zh: '把虎鲸命名为 Claude', en: 'Name the whale Claude' }
    }
];

// 成就解锁状态
var achievements = {
    first_name: false,
    first_feed: false,
    first_pet: false,
    pet_100: false,
    server_busy_5: false,
    play_3days: false,
    run_10: false,
    coins_100: false,
    all_hats: false,
    claude: false
};

// 成就统计数据
var stats = {
    totalPets: 0,            // 累计抚摸次数
    totalFeeds: 0,           // 累计喂食次数
    totalCoinsEarned: 0,     // 累计赚取金币
    totalDiamondsEarned: 0,  // 累计赚取钻石
    serverBusyStreak: 0,     // 连续进入服务器繁忙次数
    consecutiveDays: 0,      // 连续游玩天数
    lastPlayDate: ''         // 上次游玩日期（YYYY-MM-DD）
};

// ============ 全局状态 ============
var token = 100;
var coins = 50;
var diamonds = 0;
var whaleName = 'DeepSeek';
var whaleNameColor = '#ffffff';
var currentHat = '';
var hatType = '';
var ownedHats = {};
var foodInventory = {};

var isSleeping = false;
var isSad = false;
var isPetting = false;
var isBathing = false;

var petTimer, sleepTimer, intervalTimer, bathTimer, cleanlinessTimer;
var actionLocked = false;
var actionLockTimer = null;
var autoSaveEnabled = true;
var autoSaveInterval = null;
var freeAppleCount = 3;
var lastFreeDate = '';
var cleanliness = 100;

var _lastSavedJson = '';

var modList = [];
var modBlobUrls = {};
var modFontStyleTag = null;
var modMakerFiles = {};
var claudeModLoading = false;
var claudeModLoaded = false;

var isMusicOn = false;

var editMode = false;
var editTarget = 'btn';
var editModeDragged = {};

// 跑酷
var runPlayer, runVelocity, runGravity, runIsJumping;
var spikeSpeed, obstacleTimer, enemyTimer;
var currentDifficulty, runScore, isRunActive;
var animationFrameId;
var lastDifficulty = 'easy';
var isInvincible = false;
var revivePending = false;

// 开场动画状态
var introState = 'idle';

// 代码编辑器
var editorCurrentFile = null;
var editorCurrentContent = null;
var editorIsDirty = false;

// ============================================================
//  多语言字典
// ============================================================
var I18N = {
    zh: {
        'settings-title': '⚙️ 设置', 'label-volume': '音量调节', 'label-music': '背景音乐',
        'label-autosave': '自动保存', 'label-namecolor': '名字颜色', 'label-lang': '语言',
        'label-mod-name': '模组名称',
        'btn-save': '💾 保存', 'btn-exit': '🚪 退出', 'btn-mods': '🧩 模组管理',
        'btn-make-mod': '🛠️ 制作模组', 'btn-fullscreen': '⛶ 全屏', 'btn-about': 'ℹ️ 关于',
        'btn-tutorial': '📖 教程', 'btn-edit-layout': '✏️ 编辑布局', 'btn-restart-game': '🔁 重启',
        'btn-upload-zip': '📁 上传ZIP模组', 'btn-buy': '购买', 'btn-claim': '领取',
        'btn-download': '📥 下载应用', 'btn-restart': '🔄 重新开始',
        'btn-revive': '复活 (消耗10💎)', 'btn-give-up': '放弃', 'btn-feed-top': '🍽️ 喂食',
        'btn-download-source': '📥 下载源码',
        'btn-code-editor': '📝 代码编辑',
        'btn-achievements': '🏆 成就',
        'btn-advanced': '⚙️ 高级设置',
        'advanced-title': '⚙️ 高级设置',
        'advanced-hint': '这里收纳了进阶功能。普通玩家不需要进来。',
        'hint-settings': '点击虎鲸头顶的名字可以直接修改', 'hud-fatigue': '疲劳值:',
        'status-happy': '状态：正常开心',
        'status-hungry': '状态：饿得伤心了...',
        'status-tired': '状态：举铁太累，流汗了',
        'status-dirty': '状态：脏兮兮的，需要洗澡！',
        'status-server-busy': '状态：服务器繁忙！',
        'status-bathing': '状态：正在洗澡🧽...',
        'status-clean': '状态：洗得干干净净！',
        'status-exercising': '状态：正在疯狂举铁！',
        'status-server-restart': '重启冷却中：剩余 ',
        'status-server-restart-unit': ' 秒',
        'shop-hats-title': '帽子装扮',
        'shop-food-title': '🍽️ 食物商店',
        'feed-panel-title': '🥄 选择食物喂食',
        'hat-crown-name': '👑 皇冠 (30🪙)', 'hat-crown-desc': 'Token消耗速度减半',
        'hat-tophat-name': '🎩 礼帽 (20🪙)', 'hat-tophat-desc': '抚摸时增加3点Token',
        'hat-grad-name': '🎓 学士帽 (25🪙)', 'hat-grad-desc': '抚摸时额外增加5点Token',
        'hat-sun-name': '👒 遮阳帽 (15🪙)', 'hat-sun-desc': '抚摸时额外增加1🪙',
        'hat-cap-name': '🧢 鸭舌帽 (10🪙)', 'hat-cap-desc': '喂食时Token增加更多',
        'free-apple-today': '今日免费领取：', 'free-apple-unit': ' 个🍎',
        'food-apple-free': '🍎 苹果 (免费)', 'food-apple-desc': '恢复体力',
        'food-fish': '🐟 鱼 (20🪙)', 'food-fish-desc': '美味可口',
        'food-watermelon': '🍉 西瓜 (25🪙)', 'food-watermelon-desc': '清凉解渴',
        'food-burger': '🍔 汉堡 (30🪙)', 'food-burger-desc': '高热量',
        'food-bread': '🍞 面包 (10🪙)', 'food-bread-desc': '简单充饥',
        'food-honey': '🍯 蜂蜜 (5💎)', 'food-honey-desc': '珍贵营养',
        'food-cake': '🍰 蛋糕 (10💎)', 'food-cake-desc': '豪华大餐',
        'mod-manager-title': '🧩 模组管理',
        'mod-manager-hint': 'ZIP可包含：1.gif, 1.png~9.png, 1.mp3, 1.woff2, 可选的 index.html（自定义界面），以及可选的代码文件（config.js / style.css 等，用于替换模块）。缺少的文件将使用默认资源。可同时装备多个模组，同名文件以后装备的为准。',
        'mod-status-none': '当前未装备任何模组',
        'mod-status-equipped': '已装备 ',
        'mod-status-equipped-unit': ' 个模组：',
        'mod-maker-title': '🛠️ 制作模组',
        'mod-maker-hint': '请上传资源文件（可部分上传，缺失的将用原始资源）',
        'mod-maker-uploaded': '已上传 ',
        'mod-maker-of': ' / ',
        'mod-maker-files': ' 个文件',
        'mod-maker-missing-suffix': '（缺失的将使用原始资源）',
        'mod-maker-ready': '，可以生成模组了',
        'mod-maker-upload-btn': '上传',
        'mod-maker-reselect': '重选',
        'mod-maker-create': '✨ 生成模组',
        'mod-maker-create-with-missing': '✨ 生成模组（',
        'mod-maker-create-with-missing-unit': ' 项将用原始资源）',
        'mod-maker-please-upload': '请至少上传一个文件',
        'mod-maker-optional': '可选',
        'mod-maker-group-res': '🎨 资源文件',
        'mod-maker-group-code': '📄 代码文件（可选，用于替换模块）',
        'mod-list-empty': '暂无模组，请上传ZIP文件或制作模组',
        'mod-tag-equipped': '已装备',
        'mod-tag-html': '🖼️ 含界面',
        'mod-tag-code': '📄 含代码',
        'mod-tag-conflict': '⚠️ ',
        'mod-tag-conflict-unit': ' 个文件与已装备模组冲突',
        'mod-btn-equip': '装备', 'mod-btn-unequip': '卸下', 'mod-btn-delete': '删除',
        'mod-btn-export': '📤 导出', 'mod-btn-share': '📤 分享',
        'mod-reload-hint': '已修改代码文件，需要刷新页面才能生效。是否立即刷新？（进度不会丢失）',
        'food-apple': '苹果', 'food-fish-name': '鱼', 'food-watermelon-name': '西瓜',
        'food-burger-name': '汉堡', 'food-bread-name': '面包', 'food-honey-name': '蜂蜜',
        'food-cake-name': '蛋糕', 'feed-restore': '恢复体力', 'feed-btn': '喂食', 'feed-none': '无',
        'tutorial-title': '📖 新手教程',
        'edit-hint-btn': '✏️ 拖动按钮到任意位置',
        'edit-hint-bg': '✏️ 拖动屏幕移动背景图（横屏会自动下移）',
        'edit-hint-pet': '✏️ 拖动鲸鱼到任意位置',
        'edit-tab-btn': '🔘 按钮', 'edit-tab-bg': '🖼️ 背景', 'edit-tab-pet': '🐋 宠物',
        'edit-done': '✅ 完成', 'edit-reset': '↩️ 重置',
        'diff-title': '选择难度', 'diff-easy': '简单', 'diff-normal': '普通', 'diff-hard': '困难',
        'run-instruction': '点击⬆按钮或按空格跳跃',
        'game-over-title': '游戏结束',
        'revive-title': '💎 复活机会',
        'revive-desc': '消耗 10 颗钻石可以立即复活！',
        'revive-current': '当前钻石：',
        'run-diamonds': '钻石：',
        'game-over-diamonds': '获得钻石：',
        'about-title': 'ℹ️ 关于应用',
        'about-info': '赛博打工鲸：深海饲养员<br>一款可爱的虎鲸养成游戏',
        'about-update-hint': '检测到新版本可用！',
        'btn-food': '🍎 食物', 'btn-pet': '🤚 抚摸', 'btn-bath': '🧽 洗澡',
        'btn-lift': '🏋 锻炼', 'btn-shop': '🎩 装扮', 'btn-run': '🏃 跑酷',
        'restart-confirm-1': '⚠️ 确定要重启吗？所有进度、模组、按钮布局等都会被清空！',
        'restart-confirm-2': '🛑 再次确认：这是最后一次机会，真的要重启吗？此操作不可撤销！',
        'restart-fail': '重启失败：无法清空数据',
        'easter-egg-mod-name': '🐋 神秘彩蛋',
        'export-success': '导出成功！',
        'export-fail': '导出失败：',
        'export-no-assets': '该模组没有可导出的资源',
        'export-jszip-missing': 'ZIP 库未加载，无法导出',
        'share-title': '分享模组',
        'share-text': '来自「赛博打工鲸：深海饲养员」的模组：',
        'share-success': '分享成功！',
        'share-cancel': '已取消分享',
        'share-fail': '分享失败：',
        'share-not-supported': '当前环境不支持直接分享，已下载模组文件。你可以手动把 zip 文件分享给好友。',
        'download-source-start': '正在下载源代码包 DEEPPET.zip ...',
        'download-source-success': '源代码包下载已开始！',
        'download-source-fail': '源代码下载失败：',
        'not-game-html': '❌ 这不是本游戏的 HTML！\n\n未检测到游戏的按钮标识（抚摸、洗澡、锻炼、跑酷、食物等）。\n\n请使用本游戏的 index.html 修改后再上传。',
        'not-game-html-detail': '检测结果：命中 {hit} / {total} 个关键标识',
        'html-mod-apply-title': '界面已更新',
        'html-mod-apply-desc': '当前装备的模组包含自定义界面（index.html）。需要刷新页面才能看到新界面。是否立即刷新？（进度不会丢失）',
        'html-mod-remove-title': '界面已恢复',
        'html-mod-remove-desc': '已卸下包含自定义界面的模组，需要刷新页面才能恢复默认界面。是否立即刷新？（进度不会丢失）',

        // 开场动画
        'intro-title': '给虎鲸起个名字',
        'intro-name-placeholder': '输入名字',
        'intro-name-btn': '开始游戏',
        'intro-name-empty': '请给虎鲸起一个名字吧～',

        // 代码编辑器
        'code-editor-title': '📝 代码编辑器',
        'code-editor-reload': '🔄 重新加载',
        'code-editor-save': '💾 保存到模组',
        'code-editor-hint': '编辑后点「保存到模组」，会作为一个模组出现在模组列表里。装备该模组并重启游戏即可生效。',
        'code-editor-loading': '正在加载文件...',
        'code-editor-loaded': '已加载 {file}（{size} 字节）',
        'code-editor-load-fail': '加载失败：',
        'code-editor-unsaved-confirm': '当前文件有未保存的修改，切换后会丢失。是否继续？',
        'code-editor-save-empty': '内容不能为空！',
        'code-editor-save-success': '模组「{name}」已保存到模组列表！\n请到模组管理里装备它，然后重启游戏生效。',
        'code-editor-save-fail': '保存失败：',
        'code-editor-save-name': '代码编辑_{file}',
        'code-editor-go-mod-manager': '是否立即前往模组管理装备它？',
        'code-editor-fetch-fail': '无法从服务器获取该文件内容，请检查网络后重试。',

        // 成就系统
        'achievements-title': '🏆 成就',
        'achievements-unlocked-toast': '🏆 成就解锁！',
        'achievements-progress': '{done} / {total}',
        'achievements-locked': '未解锁'
    },

    en: {
        'settings-title': '⚙️ Settings', 'label-volume': 'Volume', 'label-music': 'Background Music',
        'label-autosave': 'Auto Save', 'label-namecolor': 'Name Color', 'label-lang': 'Language',
        'label-mod-name': 'Mod Name',
        'btn-save': '💾 Save', 'btn-exit': '🚪 Exit', 'btn-mods': '🧩 Mods',
        'btn-make-mod': '🛠️ Make Mod', 'btn-fullscreen': '⛶ Fullscreen', 'btn-about': 'ℹ️ About',
        'btn-tutorial': '📖 Tutorial', 'btn-edit-layout': '✏️ Edit Layout', 'btn-restart-game': '🔁 Restart',
        'btn-upload-zip': '📁 Upload ZIP Mod', 'btn-buy': 'Buy', 'btn-claim': 'Claim',
        'btn-download': '📥 Download App', 'btn-restart': '🔄 Restart',
        'btn-revive': 'Revive (10💎)', 'btn-give-up': 'Give Up', 'btn-feed-top': '🍽️ Feed',
        'btn-download-source': '📥 Download Source',
        'btn-code-editor': '📝 Code Editor',
        'btn-achievements': '🏆 Achievements',
        'btn-advanced': '⚙️ Advanced',
        'advanced-title': '⚙️ Advanced Settings',
        'advanced-hint': 'Advanced features live here. Regular players don\'t need this.',
        'hint-settings': 'Click the whale name above to edit it', 'hud-fatigue': 'Fatigue:',
        'status-happy': 'Status: Happy',
        'status-hungry': 'Status: Hungry...',
        'status-tired': 'Status: Tired & sweaty',
        'status-dirty': 'Status: Dirty, needs a bath!',
        'status-server-busy': 'Status: Server busy!',
        'status-bathing': 'Status: Bathing🧽...',
        'status-clean': 'Status: Sparkling clean!',
        'status-exercising': 'Status: Working out!',
        'status-server-restart': 'Restarting in ',
        'status-server-restart-unit': 's',
        'shop-hats-title': 'Hat Accessories',
        'shop-food-title': '🍽️ Food Shop',
        'feed-panel-title': '🥄 Choose Food to Feed',
        'hat-crown-name': '👑 Crown (30🪙)', 'hat-crown-desc': 'Token consumption halved',
        'hat-tophat-name': '🎩 Top Hat (20🪙)', 'hat-tophat-desc': '+3 Token when petting',
        'hat-grad-name': '🎓 Grad Cap (25🪙)', 'hat-grad-desc': '+5 Token when petting',
        'hat-sun-name': '👒 Sun Hat (15🪙)', 'hat-sun-desc': '+1🪙 when petting',
        'hat-cap-name': '🧢 Cap (10🪙)', 'hat-cap-desc': 'More Token from feeding',
        'free-apple-today': 'Free today: ', 'free-apple-unit': ' 🍎',
        'food-apple-free': '🍎 Apple (Free)', 'food-apple-desc': 'Restore fatigue',
        'food-fish': '🐟 Fish (20🪙)', 'food-fish-desc': 'Delicious',
        'food-watermelon': '🍉 Watermelon (25🪙)', 'food-watermelon-desc': 'Cool & refreshing',
        'food-burger': '🍔 Burger (30🪙)', 'food-burger-desc': 'High calorie',
        'food-bread': '🍞 Bread (10🪙)', 'food-bread-desc': 'Simple snack',
        'food-honey': '🍯 Honey (5💎)', 'food-honey-desc': 'Precious nutrition',
        'food-cake': '🍰 Cake (10💎)', 'food-cake-desc': 'Luxury meal',
        'mod-manager-title': '🧩 Mod Manager',
        'mod-manager-hint': 'ZIP can contain: 1.gif, 1.png~9.png, 1.mp3, 1.woff2, optional index.html (custom interface), and optional code files. Missing files use defaults. Multiple mods can be equipped; later-equipped mods override same-name files.',
        'mod-status-none': 'No mod equipped',
        'mod-status-equipped': 'Equipped ',
        'mod-status-equipped-unit': ' mod(s): ',
        'mod-maker-title': '🛠️ Make Mod',
        'mod-maker-hint': 'Upload resource files (partial allowed, missing ones use originals)',
        'mod-maker-uploaded': 'Uploaded ',
        'mod-maker-of': ' / ',
        'mod-maker-files': ' files',
        'mod-maker-missing-suffix': ' (missing ones use originals)',
        'mod-maker-ready': ', ready to create',
        'mod-maker-upload-btn': 'Upload',
        'mod-maker-reselect': 'Reselect',
        'mod-maker-create': '✨ Create Mod',
        'mod-maker-create-with-missing': '✨ Create Mod (',
        'mod-maker-create-with-missing-unit': ' missing use originals)',
        'mod-maker-please-upload': 'Upload at least one file',
        'mod-maker-optional': 'optional',
        'mod-maker-group-res': '🎨 Resource Files',
        'mod-maker-group-code': '📄 Code Files (optional, for module replacement)',
        'mod-list-empty': 'No mods yet. Upload a ZIP or make a mod.',
        'mod-tag-equipped': 'Equipped',
        'mod-tag-html': '🖼️ With UI',
        'mod-tag-code': '📄 With Code',
        'mod-tag-conflict': '⚠️ ',
        'mod-tag-conflict-unit': ' files conflict',
        'mod-btn-equip': 'Equip', 'mod-btn-unequip': 'Unequip', 'mod-btn-delete': 'Delete',
        'mod-btn-export': '📤 Export', 'mod-btn-share': '📤 Share',
        'mod-reload-hint': 'Code files changed. Reload page to apply? (Progress will NOT be lost)',
        'food-apple': 'Apple', 'food-fish-name': 'Fish', 'food-watermelon-name': 'Watermelon',
        'food-burger-name': 'Burger', 'food-bread-name': 'Bread', 'food-honey-name': 'Honey',
        'food-cake-name': 'Cake', 'feed-restore': 'Restore fatigue', 'feed-btn': 'Feed', 'feed-none': 'None',
        'tutorial-title': '📖 Tutorial',
        'edit-hint-btn': '✏️ Drag buttons anywhere',
        'edit-hint-bg': '✏️ Drag screen to move background (auto-shifts down in landscape)',
        'edit-hint-pet': '✏️ Drag whale anywhere',
        'edit-tab-btn': '🔘 Buttons', 'edit-tab-bg': '🖼️ Background', 'edit-tab-pet': '🐋 Pet',
        'edit-done': '✅ Done', 'edit-reset': '↩️ Reset',
        'diff-title': 'Select Difficulty', 'diff-easy': 'Easy', 'diff-normal': 'Normal', 'diff-hard': 'Hard',
        'run-instruction': 'Tap ⬆ or press Space to jump',
        'game-over-title': 'Game Over',
        'revive-title': '💎 Revive',
        'revive-desc': 'Spend 10 diamonds to revive!',
        'revive-current': 'Diamonds: ',
        'run-diamonds': 'Diamonds: ',
        'game-over-diamonds': 'Diamonds earned: ',
        'about-title': 'ℹ️ About',
        'about-info': 'Cyber Whale: Deep Sea Keeper<br>A cute orca raising game',
        'about-update-hint': 'New version available!',
        'btn-food': '🍎 Food', 'btn-pet': '🤚 Pet', 'btn-bath': '🧽 Bath',
        'btn-lift': '🏋 Train', 'btn-shop': '🎩 Hats', 'btn-run': '🏃 Run',
        'restart-confirm-1': '⚠️ Are you sure you want to restart? All progress, mods, and button layout will be erased!',
        'restart-confirm-2': '🛑 Final confirmation: really restart? This cannot be undone!',
        'restart-fail': 'Restart failed: unable to clear data',
        'easter-egg-mod-name': '🐋 Mystery Easter Egg',
        'export-success': 'Exported!',
        'export-fail': 'Export failed: ',
        'export-no-assets': 'This mod has no assets to export',
        'export-jszip-missing': 'ZIP library not loaded, cannot export',
        'share-title': 'Share Mod',
        'share-text': 'A mod from "Cyber Whale: Deep Sea Keeper": ',
        'share-success': 'Shared!',
        'share-cancel': 'Share cancelled',
        'share-fail': 'Share failed: ',
        'share-not-supported': 'Sharing is not supported in this environment. The mod zip has been downloaded; share it manually.',
        'download-source-start': 'Downloading source package DEEPPET.zip ...',
        'download-source-success': 'Source package download started!',
        'download-source-fail': 'Source download failed: ',
        'not-game-html': '❌ This is not this game\'s HTML!\n\nGame button markers (Pet, Bath, Train, Run, Food, etc.) not found.\n\nPlease modify this game\'s index.html and upload again.',
        'not-game-html-detail': 'Result: hit {hit} / {total} key markers',
        'html-mod-apply-title': 'Interface Updated',
        'html-mod-apply-desc': 'The equipped mod contains a custom interface (index.html). Reload page to see the new interface? (Progress will NOT be lost)',
        'html-mod-remove-title': 'Interface Restored',
        'html-mod-remove-desc': 'Custom interface mod unequipped. Reload page to restore default interface? (Progress will NOT be lost)',

        // Intro
        'intro-title': 'Name Your Whale',
        'intro-name-placeholder': 'Enter a name',
        'intro-name-btn': 'Start Game',
        'intro-name-empty': 'Please give your whale a name~',

        // Code editor
        'code-editor-title': '📝 Code Editor',
        'code-editor-reload': '🔄 Reload',
        'code-editor-save': '💾 Save as Mod',
        'code-editor-hint': 'Edit and tap "Save as Mod". It will appear in Mod Manager. Equip it and reload to apply.',
        'code-editor-loading': 'Loading file...',
        'code-editor-loaded': 'Loaded {file} ({size} bytes)',
        'code-editor-load-fail': 'Load failed: ',
        'code-editor-unsaved-confirm': 'Current file has unsaved changes. Continue and lose them?',
        'code-editor-save-empty': 'Content cannot be empty!',
        'code-editor-save-success': 'Mod "{name}" saved to Mod Manager!\nEquip it and reload to apply.',
        'code-editor-save-fail': 'Save failed: ',
        'code-editor-save-name': 'CodeEdit_{file}',
        'code-editor-go-mod-manager': 'Go to Mod Manager to equip it now?',
        'code-editor-fetch-fail': 'Cannot fetch file from server. Check your network and retry.',

        // Achievements
        'achievements-title': '🏆 Achievements',
        'achievements-unlocked-toast': '🏆 Achievement Unlocked!',
        'achievements-progress': '{done} / {total}',
        'achievements-locked': 'Locked'
    }
};

// ============================================================
//  教程内容
// ============================================================
var TUTORIAL_HTML = {
    zh: `
        <div class="tutorial-section"><h3>🐋 一、如何饲养小鲸鱼</h3><ul>
            <li><b>疲劳值（Token）</b>：鲸鱼的核心状态。随时间会慢慢下降，降到 0 会进入「服务器繁忙」冷却 60 秒。</li>
            <li><b>🍎 食物</b>：购买或领取食物，打开「喂食」面板投喂，可恢复疲劳值。</li>
            <li><b>🤚 抚摸</b>：长按拖动 🤚 图标在鲸鱼身上抚摸，10 秒内持续获得 Token 和金币。</li>
            <li><b>🏋 锻炼</b>：消耗 15 Token 让鲸鱼运动，会短暂流汗。</li>
            <li><b>🧽 洗澡</b>：当清洁度低于 30 时才可用，拖动 🧽 搓洗 10 秒恢复干净。</li>
            <li><b>🏃 跑酷</b>：赚钻石的小游戏，撞到障碍会扣血，攒够 10 钻石可原地复活。</li>
        </ul></div>
        <div class="tutorial-section"><h3>🪙 二、货币与装扮</h3><ul>
            <li><b>金币 🪙</b>：抚摸鲸鱼、每日免费苹果等获得，用于买帽子和食物。</li>
            <li><b>钻石 💎</b>：跑酷小游戏中收集，用于复活或购买蜂蜜、蛋糕。</li>
            <li><b>帽子</b>：不同帽子有不同加成（皇冠省 Token、礼帽加抚摸收益、鸭舌帽加喂食收益等）。</li>
        </ul></div>
        <div class="tutorial-section"><h3>📦 三、模组文件对照表</h3><p>制作模组时，以下文件名对应游戏里的具体资源：</p><ul>
            <li><code>1.gif</code> —— 正常状态（默认形象）</li>
            <li><code>1.png</code> —— 锻炼时</li>
            <li><code>2.png</code> —— 睡觉 / 服务器繁忙</li>
            <li><code>3.png</code> —— 流汗（低 Token）</li>
            <li><code>4.png</code> —— 流泪（极度饥饿）</li>
            <li><code>5.png</code> —— 抚摸时</li>
            <li><code>6.png</code> —— 跑酷中的敌人</li>
            <li><code>7.png</code> —— 跑酷主角</li>
            <li><code>8.png</code> —— 脏了（清洁度低）</li>
            <li><code>9.png</code> —— 游戏背景图</li>
            <li><code>1.mp3</code> —— 背景音乐</li>
            <li><code>1.woff2</code> —— 自定义字体</li>
            <li><code>index.html</code> —— <b>可选</b>：自定义游戏界面</li>
        </ul></div>
        <div class="tutorial-section"><h3>📄 四、代码模块替换</h3>
        <p>设置里的「📥 下载源代码」会下载完整的源代码包 <b>DEEPPET.zip</b>，解压后可修改任意文件。</p>
        <p>或者直接使用设置里的「📝 代码编辑器」在线编辑代码：</p>
        <ul>
            <li>选择要编辑的文件（config.js / style.css / storage.js 等）</li>
            <li>直接修改代码</li>
            <li>点「💾 保存到模组」——它会作为一个模组出现在模组列表里</li>
            <li>到「🧩 模组管理」装备它</li>
            <li>点「🔁 重启」生效</li>
        </ul></div>
        <div class="tutorial-section"><h3>🏆 五、成就</h3>
        <p>设置里的「🏆 成就」可以查看全部成就进度。目前共有 10 个成就：</p>
        <ul>
            <li>初入深海 —— 给虎鲸起名</li>
            <li>初次投喂 —— 第一次喂食</li>
            <li>初次抚摸 —— 第一次抚摸</li>
            <li>百次抚摸 —— 累计抚摸 100 次</li>
            <li>屡战屡败 —— 连续 5 次进入服务器繁忙</li>
            <li>三日之约 —— 连续游玩 3 天</li>
            <li>钻石猎手 —— 跑酷累计获得 10 颗钻石</li>
            <li>金玉满堂 —— 累计获得 100 金币</li>
            <li>帽子收藏 —— 拥有全部 5 顶帽子</li>
            <li>深海谜语 —— 把虎鲸命名为 Claude</li>
        </ul></div>
        <div class="tutorial-section"><h3>📤 六、分享与导入</h3>
        <p>在模组管理里，每个模组旁有「📤 分享」按钮。<br>
        手机端会直接调起系统分享面板；桌面端会自动下载 zip 文件。</p>
        <p>导入好友的模组：把 zip 文件保存到手机，模组管理里点「📁 上传ZIP模组」即可。</p></div>
        <div class="tutorial-section"><h3>✏️ 七、编辑布局（按钮 / 背景 / 宠物）</h3>
        <p>点击右上角圆形按钮组中的「✏️」进入编辑模式。编辑面板里有三个标签：</p>
        <ul>
            <li><b>🔘 按钮</b>：拖动游戏按钮到屏幕任意位置。</li>
            <li><b>🖼️ 背景</b>：拖动屏幕任意位置来移动背景图。</li>
            <li><b>🐋 宠物</b>：拖动鲸鱼到任意位置。</li>
        </ul></div>
        <div class="tutorial-section"><h3>🔁 八、重启与隐藏彩蛋</h3><p>设置里的「🔁 重启」按钮会清空所有数据（需两次确认）。</p><p>💡 试着把小鲸鱼命名为 <code>Claude</code>，看看会发生什么……</p></div>
    `,

    en: `
        <div class="tutorial-section"><h3>🐋 1. How to Raise Your Whale</h3><ul>
            <li><b>Fatigue (Token)</b>: Decreases over time. At 0, whale enters 60s "server busy" cooldown.</li>
            <li><b>🍎 Food</b>: Buy or claim free food, then feed to restore fatigue.</li>
            <li><b>🤚 Pet</b>: Drag 🤚 over the whale for 10s to gain Token and coins.</li>
            <li><b>🏋 Train</b>: Costs 15 Token, whale sweats briefly.</li>
            <li><b>🧽 Bath</b>: Only when cleanliness < 30. Drag 🧽 for 10s.</li>
            <li><b>🏃 Run</b>: Mini-game to earn diamonds. Revive costs 10 diamonds.</li>
        </ul></div>
        <div class="tutorial-section"><h3>🪙 2. Currency & Hats</h3><ul>
            <li><b>Coins 🪙</b>: From petting, free apples. Used to buy hats and food.</li>
            <li><b>Diamonds 💎</b>: From run game. Used to revive or buy honey/cake.</li>
            <li><b>Hats</b>: Different bonuses (Crown saves Token, Top Hat boosts petting, Cap boosts feeding).</li>
        </ul></div>
        <div class="tutorial-section"><h3>📦 3. Mod File Mapping</h3><p>Filenames map to game assets:</p><ul>
            <li><code>1.gif</code> — Normal state</li>
            <li><code>1.png</code> — Exercising</li>
            <li><code>2.png</code> — Sleeping / Server busy</li>
            <li><code>3.png</code> — Sweating</li>
            <li><code>4.png</code> — Crying</li>
            <li><code>5.png</code> — Being petted</li>
            <li><code>6.png</code> — Runner enemy</li>
            <li><code>7.png</code> — Runner player</li>
            <li><code>8.png</code> — Dirty</li>
            <li><code>9.png</code> — Background</li>
            <li><code>1.mp3</code> — BGM</li>
            <li><code>1.woff2</code> — Font</li>
            <li><code>index.html</code> — <b>Optional</b>: custom UI</li>
        </ul></div>
        <div class="tutorial-section"><h3>📄 4. Code Module Replacement</h3>
        <p>"📥 Download Source" downloads the full source package <b>DEEPPET.zip</b>.</p>
        <p>Or use "📝 Code Editor" in Settings to edit online:</p>
        <ul>
            <li>Pick a file (config.js / style.css / storage.js, etc.)</li>
            <li>Edit the code</li>
            <li>Tap "💾 Save as Mod" — it appears in Mod Manager</li>
            <li>Equip it in Mod Manager</li>
            <li>Tap "🔁 Restart" to apply</li>
        </ul></div>
        <div class="tutorial-section"><h3>🏆 5. Achievements</h3>
        <p>Tap "🏆 Achievements" in Settings to see all progress. There are 10 achievements:</p>
        <ul>
            <li>First Dive — Name the whale</li>
            <li>First Feed — Feed the whale</li>
            <li>First Pet — Pet the whale</li>
            <li>Pet Master — Pet 100 times total</li>
            <li>Five Failures — Reach server-busy 5 times in a row</li>
            <li>Three Days — Play 3 days in a row</li>
            <li>Diamond Hunter — Earn 10 diamonds in runner</li>
            <li>Full of Gold — Earn 100 coins total</li>
            <li>Hat Collector — Own all 5 hats</li>
            <li>Deep Riddle — Name the whale Claude</li>
        </ul></div>
        <div class="tutorial-section"><h3>📤 6. Share & Import</h3><p>Tap "📤 Share" on any mod. Mobile opens share sheet; desktop downloads zip.</p><p>To import: save zip, then tap "📁 Upload ZIP Mod".</p></div>
        <div class="tutorial-section"><h3>✏️ 7. Edit Layout</h3><p>Tap "✏️". Three tabs: Buttons / Background / Pet.</p></div>
        <div class="tutorial-section"><h3>🔁 8. Restart & Easter Egg</h3><p>"🔁 Restart" clears all data (double confirm).</p><p>💡 Try naming whale <code>Claude</code>...</p></div>
    `
};

// ============================================================
//  语言工具函数
// ============================================================
var currentLang = 'zh';

function t(key) {
    var dict = I18N[currentLang] || I18N.zh;
    if (dict[key] !== undefined) return dict[key];
    return I18N.zh[key] !== undefined ? I18N.zh[key] : key;
}

function tFormat(key, params) {
    var str = t(key);
    if (params && typeof params === 'object') {
        for (var k in params) {
            str = str.split('{' + k + '}').join(params[k]);
        }
    }
    return str;
}

// 获取成就的本地化文本
function achName(ach) {
    if (!ach || !ach.name) return '';
    return ach.name[currentLang] || ach.name.zh || '';
}
function achDesc(ach) {
    if (!ach || !ach.desc) return '';
    return ach.desc[currentLang] || ach.desc.zh || '';
}

function applyLanguage() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
        var key = els[i].getAttribute('data-i18n');
        if (els[i].tagName !== 'INPUT' && els[i].tagName !== 'TEXTAREA') {
            els[i].innerHTML = t(key);
        }
    }
    var editBtn = document.getElementById('btn-edit-layout');
    if (editBtn) editBtn.title = t('btn-edit-layout');

    var editHint = document.getElementById('edit-hint');
    if (editHint) editHint.innerHTML = t('edit-hint-' + editTarget);

    // 开场动画
    var introTitle = document.getElementById('intro-title');
    if (introTitle) introTitle.textContent = t('intro-title');
    var introInput = document.getElementById('intro-name-input');
    if (introInput) introInput.placeholder = t('intro-name-placeholder');
    var introBtn = document.getElementById('intro-name-btn');
    if (introBtn && !introBtn.disabled) introBtn.textContent = t('intro-name-btn');

    // 编辑器
    if (typeof refreshEditorLanguage === 'function') {
        try { refreshEditorLanguage(); } catch (e) {}
    }

    // 成就
    if (typeof renderAchievementsList === 'function') {
        try { renderAchievementsList(); } catch (e) {}
    }

    if (typeof refreshStatusText === 'function') refreshStatusText();
    if (typeof updateModStatus === 'function') updateModStatus();
    if (typeof renderModList === 'function') renderModList();
    if (typeof renderFeedList === 'function') renderFeedList();
    if (typeof renderModMakerList === 'function') renderModMakerList();
    if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
    if (typeof renderTutorial === 'function') renderTutorial();
    if (typeof updateAboutText === 'function') updateAboutText();
}

function setLanguage(lang) {
    if (lang !== 'zh' && lang !== 'en') return;
    currentLang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyLanguage();
    if (typeof saveGame === 'function') saveGame(true, true);
}

function loadLanguage() {
    try {
        var saved = localStorage.getItem(LANG_KEY);
        if (saved === 'en' || saved === 'zh') currentLang = saved;
    } catch (e) {}
    var sel = document.getElementById('lang-select');
    if (sel) sel.value = currentLang;
}

function renderTutorial() {
    var el = document.getElementById('tutorial-content');
    if (el) el.innerHTML = TUTORIAL_HTML[currentLang] || TUTORIAL_HTML.zh;
}

function updateAboutText() {
    var versionEl = document.getElementById('about-version-text');
    if (versionEl) {
        versionEl.textContent = (currentLang === 'en' ? 'Version: ' : '版本：') + CURRENT_VERSION;
    }
}