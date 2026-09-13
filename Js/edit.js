// ============================================================
//  edit.js
//  功能：编辑布局（按钮 / 背景 / 宠物）
//  依赖：config.js, storage.js
// ============================================================

// ============ 拖动状态 ============
// 按钮拖动
var _dragTarget = null;
var _dragStartX = 0, _dragStartY = 0;
var _dragOrigX = 0, _dragOrigY = 0;
var _dragMoved = false;

// 背景拖动
var _bgDragging = false;
var _bgStartX = 0, _bgStartY = 0;
var _bgBaseX0 = 50, _bgBaseY0 = 50;

// 宠物拖动
var _petDragging = false;
var _petStartX = 0, _petStartY = 0;
var _petBaseX0 = 50, _petBaseY0 = 40;

// ============================================================
//  应用已保存的按钮布局
// ============================================================
function applyButtonLayout() {
    var layout = getButtonLayout();
    var controls = document.getElementById('controls');
    var btns = document.querySelectorAll('.game-btn');
    for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        if (layout[btn.id]) {
            // 有保存位置的按钮：移到 body 下，用 fixed 定位
            if (btn.parentElement !== document.body) document.body.appendChild(btn);
            btn.classList.add('btn-detached');
            btn.style.left = layout[btn.id].x + 'px';
            btn.style.top = layout[btn.id].y + 'px';
        } else {
            // 无保存位置的按钮：回到 #controls
            if (btn.parentElement !== controls) controls.appendChild(btn);
            btn.classList.remove('btn-detached');
            btn.style.left = '';
            btn.style.top = '';
        }
    }
}

// ============================================================
//  切换编辑目标（按钮 / 背景 / 宠物）
// ============================================================
function setEditTarget(target) {
    editTarget = target;

    // 更新标签高亮
    var tabs = document.querySelectorAll('.edit-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.toggle('active', tabs[i].dataset.target === target);
    }

    // 更新 body class
    document.body.classList.remove('edit-target-btn', 'edit-target-bg', 'edit-target-pet');
    document.body.classList.add('edit-target-' + target);

    // 更新提示文字
    var editHint = document.getElementById('edit-hint');
    if (editHint) editHint.innerHTML = t('edit-hint-' + target);
}

// ============================================================
//  切换编辑模式
// ============================================================
function toggleEditMode() {
    editMode = !editMode;
    document.body.classList.toggle('edit-mode', editMode);
    document.getElementById('edit-overlay').classList.toggle('show', editMode);

    var editBtn = document.getElementById('btn-edit-layout');
    if (editBtn) editBtn.classList.toggle('active', editMode);

    var btns = document.querySelectorAll('.game-btn');

    if (editMode) {
        // 进入编辑模式
        if (document.getElementById('settings-modal').classList.contains('show')) {
            closeSettings();
        }
        editModeDragged = {};
        setEditTarget('btn');

        // 先记录所有按钮的当前视觉位置（避免 flex 重排导致位置错乱）
        var rects = {};
        for (var i = 0; i < btns.length; i++) {
            rects[btns[i].id] = btns[i].getBoundingClientRect();
            btns[i].dataset.wasDetached = btns[i].classList.contains('btn-detached') ? '1' : '0';
            btns[i].dataset.origIndex = i;
        }

        // 再统一移到 body 下，应用 fixed 定位
        for (var j = 0; j < btns.length; j++) {
            var btn = btns[j];
            var rect = rects[btn.id];
            if (btn.parentElement !== document.body) document.body.appendChild(btn);
            btn.classList.add('btn-detached');
            btn.style.left = rect.left + 'px';
            btn.style.top = rect.top + 'px';
        }

        // 首次编辑提示
        if (!localStorage.getItem(EDIT_HINT_KEY)) {
            setTimeout(function() {
                alert(currentLang === 'en'
                    ? 'Drag game buttons anywhere. Tap ✅ Done when finished.'
                    : '拖动游戏按钮到任意位置，完成后点「✅ 完成」。');
                try { localStorage.setItem(EDIT_HINT_KEY, '1'); } catch (e) {}
            }, 300);
        }
    } else {
        // 退出编辑模式
        var layout = getButtonLayout();
        var controls = document.getElementById('controls');
        var toReturn = [];

        for (var k = 0; k < btns.length; k++) {
            var btn = btns[k];
            var wasDragged = !!editModeDragged[btn.id];
            var wasDetachedBefore = btn.dataset.wasDetached === '1';

            if (wasDragged || wasDetachedBefore) {
                // 保留在 body 下，位置写回布局
                layout[btn.id] = {
                    x: parseFloat(btn.style.left) || 0,
                    y: parseFloat(btn.style.top) || 0
                };
            } else {
                // 未拖拽过也没脱离过，回到 #controls
                toReturn.push(btn);
                delete layout[btn.id];
            }
            delete btn.dataset.wasDetached;
        }

        // 按原始顺序插回 #controls
        toReturn.sort(function(a, b) {
            return (parseInt(a.dataset.origIndex) || 0) - (parseInt(b.dataset.origIndex) || 0);
        });

        for (var m = 0; m < toReturn.length; m++) {
            var rBtn = toReturn[m];
            controls.appendChild(rBtn);
            rBtn.classList.remove('btn-detached');
            rBtn.style.left = '';
            rBtn.style.top = '';
            delete rBtn.dataset.origIndex;
        }

        saveButtonLayout(layout);
        editModeDragged = {};

        // 清理编辑状态
        document.body.classList.remove('edit-target-btn', 'edit-target-bg', 'edit-target-pet', 'bg-dragging');
        _bgDragging = false;
        _petDragging = false;
        _dragTarget = null;
    }
}

// ============================================================
//  重置当前编辑对象
// ============================================================
function resetCurrentEdit() {
    if (editTarget === 'btn') {
        // 重置按钮布局
        try { localStorage.removeItem(BTN_LAYOUT_KEY); } catch (e) {}
        var controls = document.getElementById('controls');
        var btns = document.querySelectorAll('.game-btn');
        for (var i = 0; i < btns.length; i++) {
            var btn = btns[i];
            if (btn.parentElement !== controls) controls.appendChild(btn);
            btn.classList.remove('btn-detached');
            btn.style.left = '';
            btn.style.top = '';
        }
        editModeDragged = {};
    } else if (editTarget === 'bg') {
        // 重置背景位置
        try { localStorage.removeItem(BG_POS_KEY); } catch (e) {}
        applyBackgroundPosition();
    } else if (editTarget === 'pet') {
        // 重置宠物位置
        try { localStorage.removeItem(PET_POS_KEY); } catch (e) {}
        applyPetPosition();
    }
}

// ============================================================
//  拖动开始
// ============================================================
function onDragStart(e) {
    if (!editMode) return;

    if (editTarget === 'btn') {
        // 找最近的 game-btn
        var target = e.target;
        while (target && target !== document.body) {
            if (target.classList && target.classList.contains('game-btn')) break;
            target = target.parentElement;
        }
        if (!target || !target.classList.contains('game-btn')) return;

        e.preventDefault();
        e.stopPropagation();
        _dragTarget = target;
        _dragMoved = false;

        var point = e.touches ? e.touches[0] : e;
        _dragStartX = point.clientX;
        _dragStartY = point.clientY;

        var rect = target.getBoundingClientRect();
        _dragOrigX = rect.left;
        _dragOrigY = rect.top;

        if (target.parentElement !== document.body) document.body.appendChild(target);
        target.classList.add('btn-detached', 'dragging');
        target.style.left = _dragOrigX + 'px';
        target.style.top = _dragOrigY + 'px';

    } else if (editTarget === 'bg') {
        // 排除编辑面板和右上角按钮
        var t = e.target;
        if (t.closest && (t.closest('#edit-overlay') || t.closest('#right-buttons'))) return;

        e.preventDefault();
        _bgDragging = true;
        document.body.classList.add('bg-dragging');

        var pt = e.touches ? e.touches[0] : e;
        _bgStartX = pt.clientX;
        _bgStartY = pt.clientY;

        var bp = getBgPos();
        _bgBaseX0 = bp.x;
        _bgBaseY0 = bp.y;

    } else if (editTarget === 'pet') {
        // 只有点到 whale-box 才算
        var box = document.getElementById('whale-box');
        if (!box) return;
        var t2 = e.target;
        if (!box.contains(t2)) return;

        e.preventDefault();
        e.stopPropagation();
        _petDragging = true;

        var pt2 = e.touches ? e.touches[0] : e;
        _petStartX = pt2.clientX;
        _petStartY = pt2.clientY;

        var pp = getPetPos();
        _petBaseX0 = pp.x;
        _petBaseY0 = pp.y;
    }
}

// ============================================================
//  拖动中
// ============================================================
function onDragMove(e) {
    if (!editMode) return;
    var point = e.touches ? e.touches[0] : e;

    if (editTarget === 'btn' && _dragTarget) {
        e.preventDefault();
        var dx = point.clientX - _dragStartX;
        var dy = point.clientY - _dragStartY;
        if (!_dragMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) _dragMoved = true;

        var nx = _dragOrigX + dx;
        var ny = _dragOrigY + dy;
        var w = window.innerWidth, h = window.innerHeight;
        var bw = _dragTarget.offsetWidth, bh = _dragTarget.offsetHeight;

        if (nx < 0) nx = 0;
        if (ny < 0) ny = 0;
        if (nx + bw > w) nx = w - bw;
        if (ny + bh > h) ny = h - bh;

        _dragTarget.style.left = nx + 'px';
        _dragTarget.style.top = ny + 'px';
        if (_dragMoved) editModeDragged[_dragTarget.id] = true;

    } else if (editTarget === 'bg' && _bgDragging) {
        e.preventDefault();
        var dx2 = point.clientX - _bgStartX;
        var dy2 = point.clientY - _bgStartY;
        var w2 = window.innerWidth, h2 = window.innerHeight;

        // 反方向：用户往右拖，背景图右移 → background-position-x 减少
        var nx2 = _bgBaseX0 - (dx2 / w2) * 100;
        var ny2 = _bgBaseY0 - (dy2 / h2) * 100;

        if (nx2 < 0) nx2 = 0;
        if (nx2 > 100) nx2 = 100;
        if (ny2 < 0) ny2 = 0;
        if (ny2 > 100) ny2 = 100;

        // 预览时也带上横屏偏移
        var previewX = nx2;
        var previewY = ny2;
        if (isLandscape()) previewY = Math.min(100, previewY + LANDSCAPE_BG_OFFSET);
        document.body.style.backgroundPosition = previewX + '% ' + previewY + '%';

        // 记录当前值
        _bgBaseX0 = nx2;
        _bgBaseY0 = ny2;
        _bgStartX = point.clientX;
        _bgStartY = point.clientY;
        saveBgPos({ x: nx2, y: ny2 });

    } else if (editTarget === 'pet' && _petDragging) {
        e.preventDefault();
        var dx3 = point.clientX - _petStartX;
        var dy3 = point.clientY - _petStartY;
        var w3 = window.innerWidth, h3 = window.innerHeight;

        var nx3 = _petBaseX0 + (dx3 / w3) * 100;
        var ny3 = _petBaseY0 + (dy3 / h3) * 100;

        if (nx3 < 5) nx3 = 5;
        if (nx3 > 95) nx3 = 95;
        if (ny3 < 5) ny3 = 5;
        if (ny3 > 95) ny3 = 95;

        var box = document.getElementById('whale-box');
        if (box) {
            box.style.left = nx3 + '%';
            box.style.top = ny3 + '%';
        }

        _petBaseX0 = nx3;
        _petBaseY0 = ny3;
        _petStartX = point.clientX;
        _petStartY = point.clientY;
        savePetPos({ x: nx3, y: ny3 });
    }
}

// ============================================================
//  拖动结束
// ============================================================
function onDragEnd(e) {
    if (_dragTarget) {
        _dragTarget.classList.remove('dragging');
        _dragTarget = null;
    }
    if (_bgDragging) {
        _bgDragging = false;
        document.body.classList.remove('bg-dragging');
    }
    if (_petDragging) {
        _petDragging = false;
    }
}

// ============================================================
//  编辑模式下拦截按钮的 click，防止触发功能
// ============================================================
function interceptClickInEditMode(e) {
    if (!editMode) return;
    // 只在按钮模式下拦截
    if (editTarget !== 'btn') return;

    var target = e.target;
    while (target && target !== document.body) {
        if (target.classList && target.classList.contains('game-btn')) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            return false;
        }
        target = target.parentElement;
    }
}

// ============================================================
//  绑定编辑事件（在 main.js 里调用）
// ============================================================
function bindEditEvents() {
    document.addEventListener('mousedown', onDragStart, true);
    document.addEventListener('touchstart', onDragStart, { passive: false, capture: true });
    document.addEventListener('mousemove', onDragMove, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchend', onDragEnd);
    // 捕获阶段拦截 click，阻止 onclick 触发
    document.addEventListener('click', interceptClickInEditMode, true);
}