// ============================================================
//  game.js
//  功能：鲸鱼主逻辑 / 交互 / 商店 / 设置 / 跑酷游戏
//  依赖：config.js, storage.js, mods.js, achievements.js
// ============================================================

// ============================================================
//  UI 更新
// ============================================================
function refreshStatusText() {
    var statusText = document.getElementById('status');
    if (!statusText) return;
    if (isSleeping) statusText.innerHTML = t('status-server-busy');
    else if (cleanliness <= 30) statusText.innerHTML = t('status-dirty');
    else if (token <= 20) statusText.innerHTML = t('status-hungry');
    else if (token <= 50) statusText.innerHTML = t('status-tired');
    else statusText.innerHTML = t('status-happy');
}

function updateCoinDisplay() {
    var coinText = document.getElementById('coins');
    var diamondText = document.getElementById('diamonds');
    if (coinText) coinText.innerHTML = "🪙：" + coins;
    if (diamondText) diamondText.innerHTML = "💎：" + diamonds;
}

function updateUI() {
    var tokenBar = document.getElementById('token-bar');
    var tokenPercent = document.getElementById('token-percent');
    if (tokenBar) {
        tokenBar.style.width = Math.max(0, token) + "%";
        tokenBar.style.background = token > 50 ? "#4CAF50" : token > 20 ? "#ff9800" : "#f44336";
    }
    if (tokenPercent) tokenPercent.innerHTML = Math.round(token) + "%";
    updateCoinDisplay();
}

// ============================================================
//  名字颜色
// ============================================================
function applyNameColor() {
    var whaleNameText = document.getElementById('whale-name-text');
    var whaleNameInput = document.getElementById('whale-name-input');
    if (whaleNameText) whaleNameText.style.color = whaleNameColor;
    if (whaleNameInput) whaleNameInput.style.color = whaleNameColor;
}

function initNameColorInput() {
    var input = document.getElementById('name-color-input');
    var preview = document.getElementById('name-color-preview');
    if (!input || !preview) return;

    input.value = whaleNameColor;
    preview.style.background = whaleNameColor;

    input.addEventListener('input', function() {
        var normalized = normalizeHexColor(this.value);
        if (normalized) {
            this.classList.remove('invalid');
            whaleNameColor = normalized;
            preview.style.background = normalized;
            applyNameColor();
        } else {
            this.classList.add('invalid');
        }
    });

    input.addEventListener('blur', function() {
        if (this.value.trim() === '' || !normalizeHexColor(this.value)) {
            this.value = whaleNameColor;
            this.classList.remove('invalid');
        } else {
            this.value = normalizeHexColor(this.value);
        }
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            var normalized = normalizeHexColor(this.value);
            if (normalized) {
                whaleNameColor = normalized;
                preview.style.background = normalized;
                applyNameColor();
                this.value = normalized;
                this.classList.remove('invalid');
                saveGame(true, true);
            }
            this.blur();
        }
    });

    input.addEventListener('touchstart', function(e) { e.stopPropagation(); });
}

// ============================================================
//  名字编辑
// ============================================================
function updateWhaleNameDisplay() {
    var el = document.getElementById('whale-name-text');
    if (el) el.textContent = whaleName;
}

function initNameEditor() {
    var whaleNameText = document.getElementById('whale-name-text');
    var whaleNameInput = document.getElementById('whale-name-input');
    if (!whaleNameText || !whaleNameInput) return;

    whaleNameText.addEventListener('click', function() {
        whaleNameText.classList.add('hidden');
        whaleNameInput.classList.add('show');
        whaleNameInput.value = whaleName;
        whaleNameInput.focus();
        whaleNameInput.select();
    });

    whaleNameInput.addEventListener('blur', function() { saveNameFromInput(); });

    whaleNameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === 'Escape') whaleNameInput.blur();
    });

    whaleNameInput.addEventListener('touchstart', function(e) { e.stopPropagation(); });

    whaleNameText.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        whaleNameText.classList.add('hidden');
        whaleNameInput.classList.add('show');
        whaleNameInput.value = whaleName;
        whaleNameInput.focus();
        whaleNameInput.select();
        if (e.cancelable) e.preventDefault();
    });
}

function saveNameFromInput() {
    var whaleNameInput = document.getElementById('whale-name-input');
    var whaleNameText = document.getElementById('whale-name-text');
    if (!whaleNameInput || !whaleNameText) return;

    var newName = whaleNameInput.value.trim();
    if (newName && newName.length > 0) whaleName = newName;
    whaleNameInput.classList.remove('show');
    whaleNameText.classList.remove('hidden');
    updateWhaleNameDisplay();
    applyNameColor();
    saveGame(true, true);
    checkClaudeEasterEgg();
    if (typeof achOnNamed === 'function') achOnNamed();
}

// ============================================================
//  按钮锁定
// ============================================================
function lockButtons(duration) {
    actionLocked = true;
    setAllGameButtonsDisabled(true);
    if (actionLockTimer) clearTimeout(actionLockTimer);
    actionLockTimer = setTimeout(function() {
        actionLocked = false;
        setAllGameButtonsDisabled(false);
        updateBathButtonState();
    }, duration);
}

function setAllGameButtonsDisabled(disabled) {
    var gameButtons = document.querySelectorAll('.game-btn');
    for (var i = 0; i < gameButtons.length; i++) gameButtons[i].disabled = disabled;
    if (!disabled) updateBathButtonState();
}

function isLocked() { return actionLocked; }

function updateBathButtonState() {
    var bathBtn = document.getElementById('btn-bath');
    if (bathBtn) {
        bathBtn.disabled = (isLocked() || isSleeping || isPetting || isBathing || cleanliness >= 30);
    }
}

// ============================================================
//  游戏状态检查
// ============================================================
function checkState() {
    updateUI();
    var whaleImg = document.getElementById('whale-img');
    var statusText = document.getElementById('status');
    if (token <= 0) { startServerError(); return; }

    if (cleanliness <= 30) {
        isSad = false;
        if (whaleImg) whaleImg.src = getAssetUrl("8.png");
        if (statusText) statusText.innerHTML = t('status-dirty');
    } else if (token <= 20) {
        isSad = true;
        if (whaleImg) whaleImg.src = getAssetUrl("4.png");
        if (statusText) statusText.innerHTML = t('status-hungry');
    } else if (token <= 50) {
        isSad = false;
        if (whaleImg) whaleImg.src = getAssetUrl("3.png");
        if (statusText) statusText.innerHTML = t('status-tired');
    } else if (!isPetting && !isBathing) {
        isSad = false;
        if (whaleImg) whaleImg.src = getAssetUrl("1.gif");
        if (statusText) statusText.innerHTML = t('status-happy');
    }
    updateBathButtonState();
}

function startServerError() {
    isSleeping = true;
    token = 0;
    if (typeof achOnServerBusy === 'function') achOnServerBusy();

    var whaleImg = document.getElementById('whale-img');
    var statusText = document.getElementById('status');
    var countdownText = document.getElementById('countdown');
    if (whaleImg) whaleImg.src = getAssetUrl("2.png");
    if (statusText) statusText.innerHTML = t('status-server-busy');
    setAllGameButtonsDisabled(true);

    var timeLeft = 60;
    if (countdownText) countdownText.innerHTML = t('status-server-restart') + timeLeft + t('status-server-restart-unit');
    clearInterval(sleepTimer);
    sleepTimer = setInterval(function() {
        timeLeft--;
        if (countdownText) countdownText.innerHTML = t('status-server-restart') + timeLeft + t('status-server-restart-unit');
        if (timeLeft <= 0) {
            clearInterval(sleepTimer);
            isSleeping = false;
            token = 100;
            if (countdownText) countdownText.innerHTML = "";
            setAllGameButtonsDisabled(false);
            checkState();
        }
    }, 1000);
}

function startAutoConsume() {
    clearInterval(intervalTimer);
    intervalTimer = setInterval(function() {
        if (!isSleeping && !isPetting && !isBathing) {
            token -= (hatType === 'crown') ? 0.5 : 1;
            checkState();
        }
    }, 10000);
}

function startCleanlinessDecline() {
    clearInterval(cleanlinessTimer);
    cleanlinessTimer = setInterval(function() {
        if (!isSleeping && !isBathing) {
            cleanliness -= 5;
            if (cleanliness < 0) cleanliness = 0;
            if (cleanliness <= 30) checkState();
            updateBathButtonState();
        }
    }, 30000);
}

// ============================================================
//  交互动作：抚摸
// ============================================================
function pet() {
    if (isSleeping || isPetting || isBathing || isLocked()) return;
    lockButtons(10000);
    isPetting = true;
    if (typeof achOnPet === 'function') achOnPet();

    var whaleImg = document.getElementById('whale-img');
    var petHand = document.getElementById('pet-hand');
    if (whaleImg) whaleImg.src = getAssetUrl("5.png");
    if (petHand) {
        petHand.style.display = 'block';
        petHand.style.left = '50%';
        petHand.style.top = '50%';
    }

    var isDragging = false;
    if (petHand) {
        petHand.onmousedown = function(e) { isDragging = true; moveHand(e.clientX, e.clientY); return false; };
        petHand.ontouchstart = function(e) { isDragging = true; var tt = e.touches[0]; moveHand(tt.clientX, tt.clientY); return false; };
    }
    document.onmousemove = function(e) { if (isDragging) moveHand(e.clientX, e.clientY); };
    document.ontouchmove = function(e) { if (isDragging) { var tt = e.touches[0]; moveHand(tt.clientX, tt.clientY); } };
    document.onmouseup = function() { isDragging = false; };
    document.ontouchend = function() { isDragging = false; };

    function moveHand(x, y) {
        if (petHand) {
            petHand.style.left = x + 'px';
            petHand.style.top = y + 'px';
        }
    }

    var bonusTimer = setInterval(function() {
        var bonus = (hatType === 'tophat') ? 3 : 1;
        if (hatType === 'grad') bonus += 5;
        var coinGain = 1;
        if (hatType === 'sun') coinGain += 1;
        token += bonus;
        coins += coinGain;
        if (typeof achOnCoinsEarned === 'function') achOnCoinsEarned(coinGain);
        if (token > 100) token = 100;
        updateUI();
    }, 1000);

    clearTimeout(petTimer);
    petTimer = setTimeout(function() {
        document.onmousemove = null;
        document.ontouchmove = null;
        document.onmouseup = null;
        document.ontouchend = null;
        clearInterval(bonusTimer);
        isPetting = false;
        if (petHand) petHand.style.display = 'none';
        checkState();
        updateBathButtonState();
    }, 10000);
}

// ============================================================
//  交互动作：洗澡
// ============================================================
function bathe() {
    if (isSleeping || isPetting || isBathing || isLocked()) return;
    if (cleanliness >= 30) {
        alert(currentLang === 'en' ? 'Not dirty yet~' : '虎鲸还不太脏，不需要洗澡~');
        return;
    }
    lockButtons(10000);
    isBathing = true;

    var whaleImg = document.getElementById('whale-img');
    var statusText = document.getElementById('status');
    var bathSponge = document.getElementById('bath-sponge');
    if (whaleImg) whaleImg.src = getAssetUrl("8.png");
    if (statusText) statusText.innerHTML = t('status-bathing');
    if (bathSponge) {
        bathSponge.style.display = 'block';
        bathSponge.style.left = '50%';
        bathSponge.style.top = '50%';
    }

    var isDragging = false;
    if (bathSponge) {
        bathSponge.onmousedown = function(e) { isDragging = true; moveSponge(e.clientX, e.clientY); return false; };
        bathSponge.ontouchstart = function(e) { isDragging = true; var tt = e.touches[0]; moveSponge(tt.clientX, tt.clientY); return false; };
    }
    document.onmousemove = function(e) { if (isDragging) moveSponge(e.clientX, e.clientY); };
    document.ontouchmove = function(e) { if (isDragging) { var tt = e.touches[0]; moveSponge(tt.clientX, tt.clientY); } };
    document.onmouseup = function() { isDragging = false; };
    document.ontouchend = function() { isDragging = false; };

    function moveSponge(x, y) {
        if (bathSponge) {
            bathSponge.style.left = x + 'px';
            bathSponge.style.top = y + 'px';
        }
    }

    clearTimeout(bathTimer);
    bathTimer = setTimeout(function() {
        document.onmousemove = null;
        document.ontouchmove = null;
        document.onmouseup = null;
        document.ontouchend = null;
        if (bathSponge) bathSponge.style.display = 'none';
        isBathing = false;
        cleanliness = 100;
        if (statusText) statusText.innerHTML = t('status-clean');
        saveGame(true, true);
        checkState();
        updateBathButtonState();
        setTimeout(function() { checkState(); }, 1000);
    }, 10000);
}

// ============================================================
//  交互动作：锻炼
// ============================================================
function lift() {
    if (isSleeping || token < 15 || isBathing || isLocked()) return;
    lockButtons(1500);
    token -= 15;
    var whaleImg = document.getElementById('whale-img');
    var statusText = document.getElementById('status');
    if (whaleImg) whaleImg.src = getAssetUrl("1.png");
    updateUI();
    if (statusText) statusText.innerHTML = t('status-exercising');
    setTimeout(function() { checkState(); }, 1000);
}

// ============================================================
//  免费苹果
// ============================================================
function checkFreeAppleReset() {
    var today = new Date().toDateString();
    if (lastFreeDate !== today) {
        freeAppleCount = 3;
        lastFreeDate = today;
        saveGame(true, true);
    }
    var el = document.getElementById('free-apple-count');
    if (el) el.textContent = freeAppleCount;
}

function claimFreeApple() {
    if (isLocked()) return;
    checkFreeAppleReset();
    if (freeAppleCount <= 0) {
        alert(currentLang === 'en' ? 'No free apples today!' : '今日免费苹果已领完！');
        return;
    }
    freeAppleCount--;
    var el = document.getElementById('free-apple-count');
    if (el) el.textContent = freeAppleCount;
    foodInventory['🍎'] = (foodInventory['🍎'] || 0) + 1;
    renderFeedList();
    updateUI();
    saveGame(true, true);
    lockButtons(800);
    alert(currentLang === 'en' ? 'Got an apple!' : '获得了一个🍎！已放入食物背包');
}

// ============================================================
//  食物商店
// ============================================================
function toggleFoodShop() {
    var foodShop = document.getElementById('food-shop');
    if (!foodShop) return;
    if (foodShop.classList.contains('active')) {
        foodShop.classList.remove('active');
        setAllGameButtonsDisabled(false);
    } else {
        foodShop.classList.add('active');
        setAllGameButtonsDisabled(true);
        checkFreeAppleReset();
        renderFeedList();
    }
}

function buyFood(emoji, price, currency, gain) {
    if (isLocked()) return;
    if (currency === 'coins' && coins < price) {
        alert(currentLang === 'en' ? 'Not enough coins!' : '金币不足！');
        return;
    }
    if (currency === 'diamonds' && diamonds < price) {
        alert(currentLang === 'en' ? 'Not enough diamonds!' : '钻石不足！');
        return;
    }
    if (currency === 'coins') coins -= price;
    else diamonds -= price;
    foodInventory[emoji] = (foodInventory[emoji] || 0) + 1;
    updateUI();
    renderFeedList();
    saveGame(true, true);
    lockButtons(600);
    alert((currentLang === 'en' ? 'Bought ' : '购买了 ') + emoji);
}

// ============================================================
//  喂食面板
// ============================================================
function openFeedPanel() {
    renderFeedList();
    var feedPanel = document.getElementById('feed-panel');
    if (feedPanel) feedPanel.classList.add('active');
}

function closeFeedPanel() {
    var feedPanel = document.getElementById('feed-panel');
    if (feedPanel) feedPanel.classList.remove('active');
}

function renderFeedList() {
    var feedList = document.getElementById('feed-list');
    if (!feedList) return;

    var foods = [
        { emoji: '🍎', nameKey: 'food-apple', gain: 25 },
        { emoji: '🐟', nameKey: 'food-fish-name', gain: 30 },
        { emoji: '🍉', nameKey: 'food-watermelon-name', gain: 35 },
        { emoji: '🍔', nameKey: 'food-burger-name', gain: 45 },
        { emoji: '🍞', nameKey: 'food-bread-name', gain: 15 },
        { emoji: '🍯', nameKey: 'food-honey-name', gain: 50 },
        { emoji: '🍰', nameKey: 'food-cake-name', gain: 65 }
    ];

    var html = '';
    for (var i = 0; i < foods.length; i++) {
        var f = foods[i];
        var count = foodInventory[f.emoji] || 0;
        html += '<div class="feed-item">' +
            '<div class="feed-info">' +
                '<div class="feed-name">' + f.emoji + ' ' + t(f.nameKey) + ' ×' + count + '</div>' +
                '<div class="feed-desc">' + t('feed-restore') + '</div>' +
            '</div>';
        if (count > 0) {
            html += '<button onclick="feedWhale(\'' + f.emoji + '\',' + f.gain + ')">' + t('feed-btn') + '</button>';
        } else {
            html += '<button disabled>' + t('feed-none') + '</button>';
        }
        html += '</div>';
    }
    feedList.innerHTML = html;
}

function feedWhale(emoji, gain) {
    if (isLocked()) return;
    if (!foodInventory[emoji] || foodInventory[emoji] <= 0) {
        alert(currentLang === 'en' ? 'No such food!' : '没有这个食物！');
        return;
    }
    if (isSleeping) {
        alert(currentLang === 'en' ? 'Server busy!' : '服务器繁忙，无法喂食！');
        return;
    }
    foodInventory[emoji]--;
    var finalGain = gain;
    if (hatType === 'cap') finalGain += 5;
    token = Math.min(100, token + finalGain);
    updateUI();
    checkState();
    renderFeedList();
    saveGame(true, true);
    lockButtons(1000);
    if (typeof achOnFeed === 'function') achOnFeed();
}

// ============================================================
//  帽子商店
// ============================================================
function toggleShop() {
    var shop = document.getElementById('shop');
    if (!shop) return;
    if (shop.classList.contains('active')) {
        shop.classList.remove('active');
        setAllGameButtonsDisabled(false);
    } else {
        shop.classList.add('active');
        setAllGameButtonsDisabled(true);
    }
}

function buyOrWearHat(emoji, price, type, btn) {
    var hatImg = document.getElementById('hat-img');
    if (ownedHats[emoji]) {
        if (currentHat === emoji) {
            currentHat = '';
            hatType = '';
            if (hatImg) hatImg.innerHTML = '';
            btn.innerHTML = currentLang === 'en' ? 'Wear' : '装扮';
        } else {
            currentHat = emoji;
            hatType = type;
            if (hatImg) hatImg.innerHTML = emoji;
            btn.innerHTML = currentLang === 'en' ? 'Worn' : '已装扮';
            var allBtns = document.querySelectorAll('.hat-item button');
            for (var i = 0; i < allBtns.length; i++) {
                var b = allBtns[i];
                if (b !== btn && (b.innerHTML === '已装扮' || b.innerHTML === 'Worn')) {
                    b.innerHTML = currentLang === 'en' ? 'Wear' : '装扮';
                }
            }
        }
        startAutoConsume();
        saveGame(true, true);
    } else {
        if (coins < price) {
            alert(currentLang === 'en' ? 'Not enough coins!' : '金币不足！');
            return;
        }
        coins -= price;
        ownedHats[emoji] = true;
        btn.innerHTML = currentLang === 'en' ? 'Wear' : '装扮';
        updateUI();
        saveGame(true, true);
        if (typeof achOnHatsChanged === 'function') achOnHatsChanged();
    }
}

// ============================================================
//  设置面板
// ============================================================
function openSettings() {
    document.getElementById('settings-modal').classList.add('show');
    document.getElementById('mod-manager-modal').classList.remove('show');
    document.getElementById('about-modal').classList.remove('show');
    document.getElementById('mod-maker-modal').classList.remove('show');
    document.getElementById('tutorial-modal').classList.remove('show');
    var adv = document.getElementById('advanced-settings-modal');
    if (adv) adv.classList.remove('show');
    var ach = document.getElementById('achievements-modal');
    if (ach) ach.classList.remove('show');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('show');
}

function initSettings() {
    var bgm = document.getElementById('bgm');
    var volumeSlider = document.getElementById('volume-slider');
    var volumeValue = document.getElementById('volume-value');
    var musicToggle = document.getElementById('music-toggle');
    var autosaveToggle = document.getElementById('autosave-toggle');

    if (volumeSlider) {
        volumeSlider.value = (bgm && bgm.volume) || 1;
        if (volumeValue) volumeValue.textContent = Math.round(volumeSlider.value * 100) + '%';
        volumeSlider.oninput = function() {
            if (bgm) bgm.volume = parseFloat(this.value);
            if (volumeValue) volumeValue.textContent = Math.round(this.value * 100) + '%';
        };
    }

    updateMusicToggleUI();
    updateAutoSaveToggleUI();
    updateBathButtonState();
}

function toggleMusic() {
    var bgm = document.getElementById('bgm');
    if (!bgm) return;
    if (isMusicOn) {
        bgm.pause();
        isMusicOn = false;
    } else {
        bgm.play().then(function() {
            isMusicOn = true;
            updateMusicToggleUI();
        }).catch(function() {
            isMusicOn = false;
            updateMusicToggleUI();
        });
    }
    updateMusicToggleUI();
    saveGame(true, true);
}

function updateMusicToggleUI() {
    var musicToggle = document.getElementById('music-toggle');
    if (musicToggle) musicToggle.classList.toggle('active', isMusicOn);
}

function toggleAutoSave() {
    autoSaveEnabled = !autoSaveEnabled;
    updateAutoSaveToggleUI();
    if (autoSaveEnabled) {
        saveGame(true, true);
        if (autoSaveInterval) clearInterval(autoSaveInterval);
        autoSaveInterval = setInterval(function() { saveGame(true); }, AUTO_SAVE_DELAY);
    } else {
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
            autoSaveInterval = null;
        }
    }
    saveGame(true, true);
}

function updateAutoSaveToggleUI() {
    var autosaveToggle = document.getElementById('autosave-toggle');
    if (autosaveToggle) autosaveToggle.classList.toggle('active', autoSaveEnabled);
}

// ============================================================
//  关于
// ============================================================
function openAbout() {
    document.getElementById('about-modal').classList.add('show');
    document.getElementById('settings-modal').classList.remove('show');
    checkForUpdate();
}

function closeAbout() {
    document.getElementById('about-modal').classList.remove('show');
    document.getElementById('settings-modal').classList.add('show');
}

function checkForUpdate() {
    var latestVersion = '2.0';
    var currentVersionEl = document.getElementById('about-version-text');
    var downloadBtn = document.getElementById('about-download-btn');
    var updateHint = document.getElementById('about-update-hint');
    if (currentVersionEl) currentVersionEl.textContent = (currentLang === 'en' ? 'Version: ' : '版本：') + CURRENT_VERSION;
    if (latestVersion !== CURRENT_VERSION) {
        if (downloadBtn) downloadBtn.textContent = (currentLang === 'en' ? '🔄 Update to ' : '🔄 更新到 ') + latestVersion;
        if (updateHint) {
            updateHint.style.display = 'block';
            updateHint.textContent = (currentLang === 'en' ? 'Current ' : '当前版本 ') + CURRENT_VERSION +
                (currentLang === 'en' ? ', latest ' : '，最新版本 ') + latestVersion +
                (currentLang === 'en' ? ' available!' : ' 可用！');
        }
    } else {
        if (downloadBtn) downloadBtn.textContent = t('btn-download');
        if (updateHint) updateHint.style.display = 'none';
    }
}

function downloadApp() {
    var apkUrl = ASSET_BASE_URL + 'v2.0.apk';
    alert((currentLang === 'en' ? 'Downloading ' : '正在下载 ') + apkUrl + ' ...');
    var link = document.createElement('a');
    link.href = apkUrl;
    link.download = apkUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function goToAbout() {
    saveGame(true, true);
    window.location.href = 'https://jj57525885jj57525885.github.io/15555/2.html';
}

// ============================================================
//  教程
// ============================================================
function openTutorial() {
    renderTutorial();
    document.getElementById('tutorial-modal').classList.add('show');
    document.getElementById('settings-modal').classList.remove('show');
}

function closeTutorial() {
    document.getElementById('tutorial-modal').classList.remove('show');
    document.getElementById('settings-modal').classList.add('show');
}

// ============================================================
//  退出
// ============================================================
function exitGame() {
    try { saveGame(true, true); } catch (e) {}
    var msg = currentLang === 'en' ? 'Are you sure you want to exit?' : '确定要退出游戏吗？';
    if (confirm(msg)) {
        try { window.close(); } catch (e) {
            alert(currentLang === 'en' ? 'Please close manually' : '请手动关闭窗口');
        }
    }
}

// ============================================================
//  全屏
// ============================================================
function enterFullscreen() {
    var elem = document.documentElement;
    var p;
    try {
        if (elem.requestFullscreen) p = elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) p = elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) p = elem.msRequestFullscreen();
        if (p && p.catch) p.catch(function(){});
    } catch (e) {}
}

function exitFullscreen() {
    try {
        if (document.exitFullscreen) document.exitFullscreen().catch(function(){});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    } catch (e) {}
}

function toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) exitFullscreen();
    else enterFullscreen();
}

function updateFullscreenBtn() {
    var btn = document.getElementById('fullscreen-toggle-btn');
    if (!btn) return;
    btn.innerHTML = (document.fullscreenElement || document.webkitFullscreenElement)
        ? (currentLang === 'en' ? '🡼 Exit' : '🡼 缩回')
        : (currentLang === 'en' ? '⛶ Fullscreen' : '⛶ 全屏');
}

// ============================================================
//  冒泡动画
// ============================================================
function createBubble() {
    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    var size = Math.random() * 20 + 5;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 100 + 'vw';
    var duration = Math.random() * 10 + 5;
    bubble.style.animationDuration = duration + 's';
    document.body.appendChild(bubble);
    setTimeout(function() { bubble.remove(); }, duration * 1000);
}

// ============================================================
//  自动保存循环
// ============================================================
function startAutoSaveLoop() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
    autoSaveInterval = setInterval(function() {
        if (autoSaveEnabled) saveGame(true);
    }, AUTO_SAVE_DELAY);
}

// ============================================================
//  跑酷游戏
// ============================================================
function openRunGame() {
    var runGame = document.getElementById('run-game');
    var difficultySelect = document.getElementById('difficulty-select');
    var runArea = document.getElementById('run-area');
    var runUI = document.getElementById('run-ui');
    var gameOverScreen = document.getElementById('game-over-screen');
    var reviveModal = document.getElementById('revive-modal');
    var jumpBtn = document.getElementById('jump-btn');

    if (runGame) runGame.style.display = 'block';
    if (difficultySelect) difficultySelect.style.display = 'block';
    if (runArea) runArea.innerHTML = '<div class="run-ground"></div>';
    if (runUI) runUI.innerHTML = t('run-diamonds') + '0';
    if (gameOverScreen) gameOverScreen.classList.remove('show');
    if (reviveModal) reviveModal.classList.remove('show');
    if (jumpBtn) jumpBtn.classList.remove('show');

    isRunActive = false;
    revivePending = false;
    setAllGameButtonsDisabled(true);
}

function closeRunGame() {
    var runGame = document.getElementById('run-game');
    var jumpBtn = document.getElementById('jump-btn');
    if (runGame) runGame.style.display = 'none';
    isRunActive = false;
    clearInterval(obstacleTimer);
    clearInterval(enemyTimer);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    document.onkeydown = null;
    if (jumpBtn) jumpBtn.classList.remove('show');
    setAllGameButtonsDisabled(false);
}

function startRunGame(diff) {
    var difficultySelect = document.getElementById('difficulty-select');
    var runArea = document.getElementById('run-area');
    var runUI = document.getElementById('run-ui');
    var gameOverScreen = document.getElementById('game-over-screen');
    var reviveModal = document.getElementById('revive-modal');
    var jumpBtn = document.getElementById('jump-btn');

    lastDifficulty = diff;
    if (difficultySelect) difficultySelect.style.display = 'none';
    if (runArea) runArea.innerHTML = '<div class="run-ground"></div>';
    if (runUI) runUI.innerHTML = t('run-diamonds') + '0';
    if (gameOverScreen) gameOverScreen.classList.remove('show');
    if (reviveModal) reviveModal.classList.remove('show');
    if (jumpBtn) jumpBtn.classList.add('show');

    currentDifficulty = diff;
    runScore = 0;
    isRunActive = true;
    isInvincible = false;
    revivePending = false;

    runPlayer = document.createElement('img');
    runPlayer.src = getAssetUrl('7.png');
    runPlayer.className = 'run-player';
    if (runArea) runArea.appendChild(runPlayer);

    runVelocity = 0;
    runGravity = 0.8;
    runIsJumping = false;

    clearInterval(obstacleTimer);
    clearInterval(enemyTimer);

    if (diff === 'easy') {
        spikeSpeed = 4;
        obstacleTimer = setInterval(createObstacle, 2200);
    } else if (diff === 'normal') {
        spikeSpeed = 6;
        obstacleTimer = setInterval(createObstacle, 1600);
    } else {
        spikeSpeed = 8;
        obstacleTimer = setInterval(createObstacle, 1400);
        enemyTimer = setInterval(createChatGPTEnemy, 8000);
    }

    document.onkeydown = handleJump;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
}

function triggerJump() {
    if (isRunActive && !revivePending && !runIsJumping) {
        runVelocity = 12;
        runIsJumping = true;
    }
}

function handleJump(e) {
    if (e.keyCode !== 32) return;
    triggerJump();
    e.preventDefault();
}

function gameLoop() {
    if (!isRunActive) return;
    if (!revivePending) {
        runVelocity += -0.8;
        var playerY = parseInt(runPlayer.style.bottom || '30');
        playerY += runVelocity;
        if (playerY <= 30) {
            playerY = 30;
            runVelocity = 0;
            runIsJumping = false;
        }
        runPlayer.style.bottom = playerY + 'px';

        var obstacles = document.querySelectorAll('.spike, .coin, .chatgpt-enemy');
        for (var i = 0; i < obstacles.length; i++) {
            var obj = obstacles[i];
            var left = parseFloat(obj.style.left) || 0;
            left -= spikeSpeed * (obj.className === 'coin' ? 0.8 : 1);
            obj.style.left = left + 'px';

            if (!isInvincible) {
                var playerRect = runPlayer.getBoundingClientRect();
                var objRect = obj.getBoundingClientRect();
                if (obj.className === 'spike') {
                    var sx = objRect.width * 0.2, sy = objRect.height * 0.2;
                    objRect = {
                        left: objRect.left + sx,
                        right: objRect.right - sx,
                        top: objRect.top + sy,
                        bottom: objRect.bottom - sy
                    };
                }
                var collision = !(playerRect.right < objRect.left || playerRect.left > objRect.right ||
                                  playerRect.bottom < objRect.top || playerRect.top > objRect.bottom);
                if (collision) {
                    if (obj.className === 'coin') {
                        obj.remove();
                        runScore += 1;
                        diamonds += 1;
                        if (typeof achOnDiamondsEarned === 'function') achOnDiamondsEarned(1);
                        updateUI();
                        var runUI = document.getElementById('run-ui');
                        if (runUI) runUI.innerHTML = t('run-diamonds') + diamonds;
                    } else {
                        if (diamonds >= 10) {
                            revivePending = true;
                            var rd = document.getElementById('revive-diamonds');
                            if (rd) rd.textContent = diamonds;
                            var rm = document.getElementById('revive-modal');
                            if (rm) rm.classList.add('show');
                        } else {
                            gameOver();
                        }
                        return;
                    }
                }
            } else {
                // 无敌状态只收集金币
                if (obj.className === 'coin') {
                    var pR = runPlayer.getBoundingClientRect();
                    var oR = obj.getBoundingClientRect();
                    if (!(pR.right < oR.left || pR.left > oR.right || pR.bottom < oR.top || pR.top > oR.bottom)) {
                        obj.remove();
                        runScore += 1;
                        diamonds += 1;
                        if (typeof achOnDiamondsEarned === 'function') achOnDiamondsEarned(1);
                        updateUI();
                        var runUI2 = document.getElementById('run-ui');
                        if (runUI2) runUI2.innerHTML = t('run-diamonds') + diamonds;
                    }
                }
            }
            if (left < -60) obj.remove();
        }
    }
    animationFrameId = requestAnimationFrame(gameLoop);
}

function createObstacle() {
    if (Math.random() < 0.45) createSpike();
    else createCoin();
}

function createSpike() {
    var runArea = document.getElementById('run-area');
    if (!runArea) return;
    var s = document.createElement('div');
    s.className = 'spike';
    s.style.left = (window.innerWidth + 20) + 'px';
    s.style.bottom = '30px';
    runArea.appendChild(s);
}

function createCoin() {
    var runArea = document.getElementById('run-area');
    if (!runArea) return;
    var c = document.createElement('span');
    c.className = 'coin';
    c.innerHTML = '💎';
    c.style.left = (window.innerWidth + 20) + 'px';
    c.style.bottom = (Math.random() * 100 + 50) + 'px';
    runArea.appendChild(c);
}

function createChatGPTEnemy() {
    var runArea = document.getElementById('run-area');
    if (!runArea) return;
    var e = document.createElement('img');
    e.src = getAssetUrl('6.png');
    e.className = 'chatgpt-enemy';
    e.style.left = (window.innerWidth + 20) + 'px';
    e.style.bottom = '30px';
    runArea.appendChild(e);
}

function useRevive() {
    if (diamonds < 10) return;
    diamonds -= 10;
    updateUI();
    var reviveModal = document.getElementById('revive-modal');
    if (reviveModal) reviveModal.classList.remove('show');
    revivePending = false;
    isInvincible = true;

    document.querySelectorAll('.spike, .chatgpt-enemy').forEach(function(el) { el.remove(); });
    runPlayer.style.bottom = '30px';
    runVelocity = 0;
    runIsJumping = false;

    setTimeout(function() { isInvincible = false; }, 2000);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
}

function giveUpRevive() {
    var reviveModal = document.getElementById('revive-modal');
    if (reviveModal) reviveModal.classList.remove('show');
    revivePending = false;
    gameOver();
}

function restartRun() {
    startRunGame(lastDifficulty);
}

function gameOver() {
    isRunActive = false;
    clearInterval(obstacleTimer);
    clearInterval(enemyTimer);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    document.onkeydown = null;

    var jumpBtn = document.getElementById('jump-btn');
    if (jumpBtn) jumpBtn.classList.remove('show');

    var finalScore = document.getElementById('final-score');
    if (finalScore) finalScore.textContent = t('game-over-diamonds') + runScore;

    var gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) gameOverScreen.classList.add('show');

    saveGame(true, true);
}