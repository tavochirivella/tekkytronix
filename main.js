// ===== TEKKYTRONIX — main.js =====
// Fase 2: Mapa, clasificación, HUD

const ITEM_VISUALS = {
  planets: { red: '🔴', blue: '🔵', yellow: '🟡', purple: '🟣' },
  symbols: { circle: '⭕', triangle: '🔺' },
  robots:  { red: '🔴', blue: '🔵', yellow: '🟡', purple: '🟣' }
};

let _currentLevel   = null;
let _slots          = [];   // patrón: [{ el, itemId, itemData }]
let _categories     = {};   // clasificación: { catId: [itemId, ...] }
let _draggedItemId  = null;
let _draggedFromCat = null; // para devolver al banco desde categoría

// ===== INIT =====
function init() {
  _registerScreens();
  _bindStartScreen();

  const saved = ProgressManager.load();
  ProgressManager.applyToState(saved);

  LevelRepository.load();

  ScreenManager.show('start');
}

function _registerScreens() {
  ScreenManager.register('start',    document.getElementById('screen-start'));
  ScreenManager.register('map',      document.getElementById('screen-map'));
  ScreenManager.register('level',    document.getElementById('screen-level'));
  ScreenManager.register('feedback', document.getElementById('screen-feedback'));
}

// ===== START SCREEN =====
function _bindStartScreen() {
  document.getElementById('btn-start').addEventListener('click', () => {
    _renderMap();
    ScreenManager.show('map');
  });
}

// ===== MAP SCREEN =====
function _renderMap() {
  const container = document.getElementById('map-nodes');
  container.innerHTML = '';

  const allLevels    = LevelRepository.getAll();
  const unlocked     = GameStateManager.get('unlockedLevels');
  const metrics      = GameStateManager.get('performanceMetrics');
  const sectors      = [...new Set(allLevels.map(l => l.sector))];

  sectors.forEach(sector => {
    const sectorEl = document.createElement('div');
    sectorEl.className = 'map__sector';

    const sectorTitle = document.createElement('p');
    sectorTitle.className = 'map__sector-title';
    sectorTitle.textContent = `Sector ${sector}`;
    sectorEl.appendChild(sectorTitle);

    const nodesRow = document.createElement('div');
    nodesRow.className = 'map__sector-nodes';

    allLevels.filter(l => l.sector === sector).forEach(level => {
      const isUnlocked  = unlocked.includes(level.id);
      const isCompleted = !!metrics[level.id];
      const index       = LevelRepository.getAll().findIndex(l => l.id === level.id) + 1;

      const node = document.createElement('button');
      node.className = `map-node ${isCompleted ? 'map-node--done' : ''} ${!isUnlocked ? 'map-node--locked' : ''}`;
      node.disabled  = !isUnlocked;
      node.innerHTML = `
        <span class="map-node__number">${index}</span>
        <span class="map-node__label">${level.title}</span>
        ${isCompleted ? '<span class="map-node__star">✦</span>' : ''}
        ${!isUnlocked ? '<span class="map-node__lock">🔒</span>' : ''}
      `;

      if (isUnlocked) {
        node.addEventListener('click', () => _loadLevel(level.id));
      }

      nodesRow.appendChild(node);
    });

    sectorEl.appendChild(nodesRow);
    container.appendChild(sectorEl);
  });
}

// ===== LEVEL =====
function _loadLevel(levelId) {
  const level = LevelRepository.getById(levelId);
  if (!level) { FeedbackController.showMessage('Error cargando nivel', 'error'); return; }

  _currentLevel  = level;
  _slots         = [];
  _categories    = {};
  _draggedItemId = null;

  GameStateManager.resetForLevel(levelId);
  HUD.resetTimer();
  HUD.setAttempts(0);
  HUD.startTimer();

  _renderLevel(level);
  ScreenManager.show('level');
}

function _renderLevel(level) {
  document.getElementById('level-title').textContent = level.title;

  // Botón volver al mapa
  const btnBack = document.getElementById('btn-back-map');
  btnBack.replaceWith(btnBack.cloneNode(true));
  document.getElementById('btn-back-map').addEventListener('click', () => {
    HUD.stopTimer();
    _renderMap();
    ScreenManager.show('map');
  });

  const body = document.getElementById('level-body');
  body.innerHTML = '';

  if (level.type === 'pattern') {
    _renderPatternLevel(level, body);
  } else if (level.type === 'classification') {
    _renderClassificationLevel(level, body);
  }

  _bindLevelButtons(level);
}

// ─── PATRÓN ───────────────────────────────────────────────
function _renderPatternLevel(level, body) {
  body.innerHTML = `
    <section class="level__slots-section">
      <p class="level__instruction">Completa el patrón arrastrando los elementos:</p>
      <div id="slots-container" class="slots-container"></div>
    </section>
    <section class="level__items-section">
      <p class="level__instruction">Elementos disponibles:</p>
      <div id="items-container" class="items-container"></div>
    </section>
  `;

  _renderSlots(level);
  _renderItemBank(level.availableItems, level.theme, 'items-container');
}

function _renderSlots(level) {
  const container = document.getElementById('slots-container');
  container.innerHTML = '';
  _slots = [];

  for (let i = 0; i < level.slots; i++) {
    const el = document.createElement('div');
    el.className    = 'slot';
    el.dataset.index = i;
    _bindSlotDrop(el, i);
    container.appendChild(el);
    _slots.push({ el, itemId: null, itemData: null });
  }
}

// ─── CLASIFICACIÓN ────────────────────────────────────────
function _renderClassificationLevel(level, body) {
  const catsHtml = level.categories.map(cat => {
    const colorAttr = cat.color || cat.shape || '';
    return `
      <div class="cat-zone cat-zone--${colorAttr}" id="cat-${cat.id}" data-cat-id="${cat.id}">
        <p class="cat-zone__label">${cat.label}</p>
        <div class="cat-zone__items" id="cat-items-${cat.id}"></div>
      </div>
    `;
  }).join('');

  body.innerHTML = `
    <section class="level__cats-section">
      <p class="level__instruction">Arrastra cada elemento a su zona:</p>
      <div class="cats-container">${catsHtml}</div>
    </section>
    <section class="level__items-section">
      <p class="level__instruction">Elementos para clasificar:</p>
      <div id="items-container" class="items-container"></div>
    </section>
  `;

  level.categories.forEach(cat => {
    _categories[cat.id] = [];
    const zoneEl = document.getElementById(`cat-${cat.id}`);
    _bindCategoryDrop(zoneEl, cat.id);
  });

  _renderItemBank(level.availableItems, level.theme, 'items-container');
}

function _bindCategoryDrop(zoneEl, catId) {
  zoneEl.addEventListener('dragover', e => { e.preventDefault(); zoneEl.classList.add('drag-over'); });
  zoneEl.addEventListener('dragleave', () => zoneEl.classList.remove('drag-over'));
  zoneEl.addEventListener('drop', e => {
    e.preventDefault();
    zoneEl.classList.remove('drag-over');
    if (_draggedItemId) _placeItemInCategory(catId, _draggedItemId);
  });
  // Touch
  zoneEl.addEventListener('touchend', e => {
    const touch  = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (zoneEl.contains(target) && _draggedItemId) {
      _placeItemInCategory(catId, _draggedItemId);
    }
  });
}

function _placeItemInCategory(catId, itemId) {
  const level    = _currentLevel;
  const itemData = level.availableItems.find(i => i.id === itemId);
  if (!itemData) return;

  // Retirar de categoría anterior si aplica
  if (_draggedFromCat && _draggedFromCat !== catId) {
    _categories[_draggedFromCat] = _categories[_draggedFromCat].filter(id => id !== itemId);
    const prevZoneItems = document.getElementById(`cat-items-${_draggedFromCat}`);
    const prevEl = prevZoneItems?.querySelector(`[data-item-id="${itemId}"]`);
    prevEl?.remove();
  }

  // Evitar duplicados
  if (_categories[catId].includes(itemId)) return;

  _categories[catId].push(itemId);

  // Renderizar en la zona
  const zoneItemsEl = document.getElementById(`cat-items-${catId}`);
  const itemEl = _createItemElement(itemData, level.theme, true);
  itemEl.addEventListener('click', () => _removeFromCategory(catId, itemId, itemEl));
  zoneItemsEl.appendChild(itemEl);

  // Ocultar del banco
  const bankEl = document.querySelector(`#items-container [data-item-id="${itemId}"]`);
  if (bankEl) bankEl.classList.add('used');

  _draggedFromCat = null;
}

function _removeFromCategory(catId, itemId, itemEl) {
  _categories[catId] = _categories[catId].filter(id => id !== itemId);
  itemEl.remove();
  const bankEl = document.querySelector(`#items-container [data-item-id="${itemId}"]`);
  if (bankEl) bankEl.classList.remove('used');
}

// ─── BANCO DE ITEMS (compartido) ──────────────────────────
function _renderItemBank(items, theme, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const shuffled = Helpers.shuffle(items);
  shuffled.forEach(item => container.appendChild(_createItemElement(item, theme, false)));
}

function _createItemElement(item, theme, inCategory) {
  const el = document.createElement('div');
  el.className      = 'item';
  el.dataset.itemId = item.id;
  el.title          = item.label;

  const colorAttr = item.color || item.shape;
  if (colorAttr) el.classList.add(`item--${colorAttr}`);
  if (item.shape) el.classList.add(`item--${item.shape}`);

  el.textContent = _getItemEmoji(item, theme);

  if (!inCategory) {
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', e => { _draggedItemId = item.id; _draggedFromCat = null; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    el.addEventListener('dragend',   () => { el.classList.remove('dragging'); _draggedItemId = null; });
    _bindTouchDrag(el, item);

    // Para patrón: drop en slot por click también
    if (_currentLevel?.type === 'pattern') {
      el.addEventListener('click', () => {
        const emptySlot = _slots.findIndex(s => !s.itemId);
        if (emptySlot !== -1) _placeItemInSlot(emptySlot, item.id);
      });
    }
  } else {
    // Item dentro de categoría: más pequeño, sin cursor grab
    el.style.cursor = 'pointer';
    el.title = `${item.label} (clic para devolver)`;
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', e => {
      _draggedItemId  = item.id;
      _draggedFromCat = Object.keys(_categories).find(cid => _categories[cid].includes(item.id)) || null;
      e.dataTransfer.effectAllowed = 'move';
    });
  }

  return el;
}

function _getItemEmoji(item, theme) {
  const map = ITEM_VISUALS[theme];
  if (!map) return '●';
  return map[item.color] || map[item.shape] || '●';
}

// ─── SLOTS (patrón) ───────────────────────────────────────
function _bindSlotDrop(el, index) {
  el.addEventListener('dragover',  e => { e.preventDefault(); el.classList.add('drag-over'); });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', e => {
    e.preventDefault();
    el.classList.remove('drag-over');
    if (_draggedItemId) _placeItemInSlot(index, _draggedItemId);
  });
  el.addEventListener('click', () => _removeFromSlot(index));
}

function _placeItemInSlot(slotIndex, itemId) {
  const level    = _currentLevel;
  const itemData = level.availableItems.find(i => i.id === itemId);
  if (!itemData) return;

  const prevItem = _slots[slotIndex].itemId;
  if (prevItem) _returnItemToBank(prevItem);

  const prevSlot = _slots.findIndex(s => s.itemId === itemId);
  if (prevSlot !== -1 && prevSlot !== slotIndex) {
    _slots[prevSlot] = { ..._slots[prevSlot], itemId: null, itemData: null };
    _renderSlotContent(prevSlot, null, level.theme);
  }

  _slots[slotIndex].itemId   = itemId;
  _slots[slotIndex].itemData = itemData;
  _renderSlotContent(slotIndex, itemData, level.theme);
  _markItemUsed(itemId);
}

function _removeFromSlot(slotIndex) {
  const itemId = _slots[slotIndex].itemId;
  if (!itemId) return;
  _slots[slotIndex].itemId   = null;
  _slots[slotIndex].itemData = null;
  _renderSlotContent(slotIndex, null, _currentLevel.theme);
  _returnItemToBank(itemId);
}

function _renderSlotContent(slotIndex, itemData, theme) {
  const slotEl = _slots[slotIndex].el;
  slotEl.innerHTML = '';
  slotEl.classList.remove('slot--correct', 'slot--incorrect');
  if (!itemData) return;

  const inner = _createItemElement(itemData, theme, true);
  inner.style.cssText = 'cursor:default;width:100%;height:100%;border:none;background:transparent;pointer-events:none;';
  slotEl.appendChild(inner);
}

function _markItemUsed(itemId) {
  document.querySelector(`#items-container [data-item-id="${itemId}"]`)?.classList.add('used');
}

function _returnItemToBank(itemId) {
  document.querySelector(`#items-container [data-item-id="${itemId}"]`)?.classList.remove('used');
}

// ─── TOUCH DRAG ───────────────────────────────────────────
function _bindTouchDrag(el, item) {
  let clone = null;

  el.addEventListener('touchstart', e => {
    _draggedItemId  = item.id;
    _draggedFromCat = Object.keys(_categories).find(cid => _categories[cid].includes(item.id)) || null;
    el.classList.add('dragging');
    clone = el.cloneNode(true);
    clone.style.cssText = `position:fixed;pointer-events:none;z-index:1000;opacity:0.85;transform:scale(1.1);width:${el.offsetWidth}px;height:${el.offsetHeight}px;`;
    document.body.appendChild(clone);
    _moveClone(clone, e.touches[0]);
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    e.preventDefault();
    if (clone) _moveClone(clone, e.touches[0]);
    _highlightTargetUnder(e.touches[0]);
  }, { passive: false });

  el.addEventListener('touchend', e => {
    el.classList.remove('dragging');
    clone?.remove(); clone = null;
    _clearHighlights();

    const touch  = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (_currentLevel?.type === 'pattern') {
      const slotEl = target?.closest('.slot');
      if (slotEl) _placeItemInSlot(parseInt(slotEl.dataset.index), _draggedItemId);
    } else if (_currentLevel?.type === 'classification') {
      const zoneEl = target?.closest('.cat-zone');
      if (zoneEl) _placeItemInCategory(zoneEl.dataset.catId, _draggedItemId);
    }

    _draggedItemId = null;
  });
}

function _moveClone(clone, touch) {
  clone.style.left = `${touch.clientX - 40}px`;
  clone.style.top  = `${touch.clientY - 40}px`;
}

function _highlightTargetUnder(touch) {
  document.querySelectorAll('.slot, .cat-zone').forEach(el => el.classList.remove('drag-over'));
  const target  = document.elementFromPoint(touch.clientX, touch.clientY);
  const slotEl  = target?.closest('.slot');
  const zoneEl  = target?.closest('.cat-zone');
  (slotEl || zoneEl)?.classList.add('drag-over');
}

function _clearHighlights() {
  document.querySelectorAll('.slot, .cat-zone').forEach(el => el.classList.remove('drag-over'));
}

// ─── CHECK ────────────────────────────────────────────────
function _check() {
  const level = _currentLevel;
  GameStateManager.incrementAttempts();
  const attempts = GameStateManager.get('attempts');
  HUD.setAttempts(attempts);

  let result;
  let slotEls = [];

  if (level.type === 'pattern') {
    const attribute   = level.rule.attributes[0];
    const playerAnswer = _slots.map(s => s.itemData ? s.itemData[attribute] : null);

    if (playerAnswer.includes(null)) {
      GameStateManager.set('attempts', attempts - 1);
      HUD.setAttempts(attempts - 1);
      FeedbackController.showMessage('Completa todos los espacios', 'info');
      return;
    }

    result  = RuleEngine.evaluate(level, playerAnswer);
    slotEls = _slots.map(s => s.el);

  } else if (level.type === 'classification') {
    const totalPlaced = Object.values(_categories).reduce((s, arr) => s + arr.length, 0);
    if (totalPlaced < level.availableItems.length) {
      GameStateManager.set('attempts', attempts - 1);
      HUD.setAttempts(attempts - 1);
      FeedbackController.showMessage('Clasifica todos los elementos', 'info');
      return;
    }

    result = RuleEngine.evaluate(level, _categories);
  }

  if (result.correct) {
    HUD.stopTimer();
    const elapsed = GameStateManager.stopTimer();

    if (level.type === 'pattern') {
      FeedbackController.showCorrect(slotEls);
    } else {
      FeedbackController.showMessage('¡Clasificación correcta!', 'success');
      _highlightAllCategoriesCorrect();
    }

    ProgressManager.recordLevelResult(level.id, attempts, elapsed);

    const nextId = LevelRepository.getNextId(level.id);
    if (nextId) GameStateManager.unlockLevel(nextId);
    ProgressManager.saveFromState();

    setTimeout(() => _showFeedbackScreen(attempts, elapsed, !!nextId), 1400);

  } else {
    if (level.type === 'pattern') {
      FeedbackController.showIncorrect(slotEls, result.firstErrorIndex ?? 0);
    } else {
      _highlightCategoryError(result.wrongCategoryId);
    }
    _showErrorHint(result.errorType);
  }
}

function _highlightAllCategoriesCorrect() {
  document.querySelectorAll('.cat-zone').forEach(el => {
    el.classList.add('cat-zone--correct');
    setTimeout(() => el.classList.remove('cat-zone--correct'), 1400);
  });
}

function _highlightCategoryError(catId) {
  const el = document.getElementById(`cat-${catId}`);
  if (!el) return;
  el.classList.add('cat-zone--error');
  setTimeout(() => el.classList.remove('cat-zone--error'), 800);
}

function _showErrorHint(errorType) {
  const messages = {
    impulsive:  'Observa bien antes de actuar',
    visual:     'Revisa la categoría de cada elemento',
    rule:       'Ese elemento no pertenece ahí',
    incomplete: 'Faltan elementos por clasificar'
  };
  FeedbackController.showMessage(messages[errorType] || 'Intenta de nuevo', 'error');
}

// ─── FEEDBACK SCREEN ──────────────────────────────────────
function _showFeedbackScreen(attempts, elapsed, hasNext) {
  document.getElementById('feedback-stats').textContent =
    `Intentos: ${attempts} · Tiempo: ${Helpers.formatTime(elapsed)}`;

  const btnNext = document.getElementById('btn-next');
  const btnMap  = document.getElementById('btn-map');

  btnNext.style.display = hasNext ? 'block' : 'none';

  btnNext.replaceWith(btnNext.cloneNode(true));
  btnMap.replaceWith(btnMap.cloneNode(true));

  document.getElementById('btn-next').addEventListener('click', () => {
    const nextId = LevelRepository.getNextId(_currentLevel.id);
    if (nextId) _loadLevel(nextId);
  });

  document.getElementById('btn-map').addEventListener('click', () => {
    _renderMap();
    ScreenManager.show('map');
  });

  ScreenManager.show('feedback');
}

// ─── LEVEL BUTTONS ────────────────────────────────────────
function _bindLevelButtons(level) {
  ['btn-check', 'btn-reset'].forEach(id => {
    const el = document.getElementById(id);
    el.replaceWith(el.cloneNode(true));
  });

  document.getElementById('btn-check').addEventListener('click', _check);
  document.getElementById('btn-reset').addEventListener('click', () => {
    HUD.resetTimer();
    HUD.setAttempts(0);
    _loadLevel(level.id);
  });
}

// ===== START =====
init();
