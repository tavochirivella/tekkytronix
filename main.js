// ===== TEKKYTRONIX — main.js =====
// Fase 2+: pre-llenado progresivo, contador, continuar misión

const ITEM_VISUALS = {
  planets: { red: '🔴', blue: '🔵', yellow: '🟡', purple: '🟣' },
  symbols: { circle: '⭕', triangle: '🔺' },
  robots:  { red: '🔴', blue: '🔵', yellow: '🟡', purple: '🟣' }
};

let _currentLevel    = null;
let _slots           = [];   // [{ el, itemId, itemData, prefilled }]
let _categories      = {};   // { catId: [itemId, ...] }
let _draggedItemId   = null;
let _draggedFromCat  = null;
let _attemptTimes    = [];   // ms por cada intento
let _attemptStart    = null; // timestamp del inicio del intento actual

// ===== INIT =====
function init() {
  _registerScreens();

  // Cargar datos y progreso ANTES de configurar la pantalla inicial
  LevelRepository.load();
  const saved = ProgressManager.load();
  ProgressManager.applyToState(saved);

  _setupStartScreen();
  ScreenManager.show('start');
}

function _registerScreens() {
  ScreenManager.register('start',    document.getElementById('screen-start'));
  ScreenManager.register('map',      document.getElementById('screen-map'));
  ScreenManager.register('level',    document.getElementById('screen-level'));
  ScreenManager.register('feedback', document.getElementById('screen-feedback'));
}

// ===== START SCREEN =====
function _setupStartScreen() {
  const lastLevelId   = ProgressManager.getLastLevelId();
  const totalRepaired = GameStateManager.get('totalRepaired');
  const btnContinue   = document.getElementById('btn-continue');
  const btnStart      = document.getElementById('btn-start');
  const btnClear      = document.getElementById('btn-clear-history');
  const repairedEl    = document.getElementById('start-repaired');

  // Mostrar "Continuar" si hay progreso guardado
  if (lastLevelId) {
    const lastLevel = LevelRepository.getById(lastLevelId);
    if (lastLevel) {
      btnContinue.style.display = 'block';
      btnContinue.textContent   = `Continuar — ${lastLevel.title}`;
      btnStart.textContent      = 'Ver mapa';
      btnStart.className        = 'btn btn--secondary';
    }
  }

  // Mostrar sistemas reparados y botón de borrar si hay alguno
  if (totalRepaired > 0) {
    repairedEl.style.display = 'block';
    repairedEl.textContent   = `Sistemas reparados: ${totalRepaired}`;
    btnClear.style.display   = 'inline-block';
  }

  btnContinue.addEventListener('click', () => {
    _renderMap();
    ScreenManager.show('map');
  });

  btnStart.addEventListener('click', () => {
    _renderMap();
    ScreenManager.show('map');
  });

  btnClear.addEventListener('click', () => {
    _showModal('¿Seguro que quieres empezar de cero? Se borrará todo tu progreso.', () => {
      ProgressManager.clear();
      GameStateManager.set('unlockedLevels', ['level_01']);
      GameStateManager.set('performanceMetrics', {});
      GameStateManager.set('totalRepaired', 0);
      GameStateManager.set('currentLevelId', null);
      btnContinue.style.display = 'none';
      btnStart.textContent      = 'Nueva misión';
      btnStart.className        = 'btn btn--primary';
      repairedEl.style.display  = 'none';
      btnClear.style.display    = 'none';
      FeedbackController.showMessage('Progreso borrado', 'info');
    });
  });
}

// ===== MAP SCREEN =====
function _renderMap() {
  const container  = document.getElementById('map-nodes');
  container.innerHTML = '';

  const allLevels  = LevelRepository.getAll();
  const unlocked   = GameStateManager.get('unlockedLevels');
  const metrics    = GameStateManager.get('performanceMetrics');
  const lastId     = GameStateManager.get('currentLevelId');
  const sectors    = [...new Set(allLevels.map(l => l.sector))];

  sectors.forEach(sector => {
    const sectorEl = document.createElement('div');
    sectorEl.className = 'map__sector';

    const sectorTitle = document.createElement('p');
    sectorTitle.className   = 'map__sector-title';
    sectorTitle.textContent = `Sector ${sector}`;
    sectorEl.appendChild(sectorTitle);

    const nodesRow = document.createElement('div');
    nodesRow.className = 'map__sector-nodes';

    allLevels.filter(l => l.sector === sector).forEach(level => {
      const isUnlocked  = unlocked.includes(level.id);
      const isCompleted = !!metrics[level.id];
      const isCurrent   = level.id === lastId;
      const index       = allLevels.findIndex(l => l.id === level.id) + 1;

      const node = document.createElement('button');
      node.className = [
        'map-node',
        isCompleted ? 'map-node--done'    : '',
        !isUnlocked ? 'map-node--locked'  : '',
        isCurrent   ? 'map-node--current' : ''
      ].join(' ').trim();
      node.disabled  = !isUnlocked;
      node.innerHTML = `
        <span class="map-node__number">${index}</span>
        <span class="map-node__label">${level.title}</span>
        ${isCompleted ? '<span class="map-node__star">✦</span>' : ''}
        ${!isUnlocked ? '<span class="map-node__lock">🔒</span>' : ''}
      `;

      if (isUnlocked) node.addEventListener('click', () => _loadLevel(level.id));
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

  _currentLevel   = level;
  _slots          = [];
  _categories     = {};
  _draggedItemId  = null;
  _draggedFromCat = null;
  _attemptTimes   = [];
  _attemptStart   = Date.now();

  GameStateManager.resetForLevel(levelId);
  HUD.resetTimer();
  HUD.setAttempts(0);
  HUD.startTimer();

  _renderLevel(level);
  _updateProgress(level);
  _setupHintButton(level);
  _hideInlineFeedback();
  ScreenManager.show('level');
}

function _renderLevel(level) {
  document.getElementById('level-title').textContent = level.title;

  const btnBack = document.getElementById('btn-back-map');
  btnBack.replaceWith(btnBack.cloneNode(true));
  document.getElementById('btn-back-map').addEventListener('click', () => {
    HUD.stopTimer();
    _renderMap();
    ScreenManager.show('map');
  });

  const body = document.getElementById('level-body');
  body.innerHTML = '';

  if (level.type === 'pattern')        _renderPatternLevel(level, body);
  else if (level.type === 'classification') _renderClassificationLevel(level, body);

  _bindLevelButtons(level);
}

// ─── PATRÓN ───────────────────────────────────────────────
function _renderPatternLevel(level, body) {
  const hasDistractors = level.availableItems.some(i => i.distractor);
  const bankLabel = hasDistractors
    ? 'Elementos disponibles — <em>usa solo los que necesitas:</em>'
    : 'Elementos disponibles:';

  body.innerHTML = `
    <section class="level__slots-section">
      <p class="level__instruction">Completa el patrón — arrastra los elementos a los espacios vacíos:</p>
      <div id="slots-container" class="slots-container"></div>
    </section>
    <section class="level__items-section">
      <p class="level__instruction">${bankLabel}</p>
      <div id="items-container" class="items-container"></div>
    </section>
  `;

  const bankItems = _buildPatternSlots(level);
  _renderItemBank(bankItems, level.theme, 'items-container');
}

function _buildPatternSlots(level) {
  const container    = document.getElementById('slots-container');
  const attribute    = level.rule.attributes[0];
  const sequence     = level.rule.sequence;
  // Generar la secuencia completa cíclicamente a partir de rule.sequence
  const goal         = Array.from({ length: level.slots }, (_, i) => sequence[i % sequence.length]);
  const emptySlots   = level.emptySlots ?? level.slots;
  const prefillCount = level.slots - emptySlots;

  const usedItemIds = new Set();

  for (let i = 0; i < level.slots; i++) {
    const el = document.createElement('div');
    el.className     = 'slot';
    el.dataset.index = i;

    if (i < prefillCount) {
      // Slot pre-llenado (pista)
      const expectedAttr = goal[i];
      const item = level.availableItems.find(it => it[attribute] === expectedAttr && !usedItemIds.has(it.id));
      if (item) {
        usedItemIds.add(item.id);
        el.classList.add('slot--prefilled');
        _renderPrefillContent(el, item, level.theme);
        _slots.push({ el, itemId: item.id, itemData: item, prefilled: true });
      } else {
        _bindSlotDrop(el, i);
        _slots.push({ el, itemId: null, itemData: null, prefilled: false });
      }
    } else {
      // Slot vacío interactivo
      _bindSlotDrop(el, i);
      _slots.push({ el, itemId: null, itemData: null, prefilled: false });
    }

    container.appendChild(el);
  }

  // Solo los ítems no usados en el pre-llenado van al banco
  return level.availableItems.filter(it => !usedItemIds.has(it.id));
}

function _renderPrefillContent(slotEl, item, theme) {
  const inner = document.createElement('div');
  inner.className = 'item item--prefill';
  const colorAttr = item.color || item.shape;
  if (colorAttr) inner.classList.add(`item--${colorAttr}`);
  if (item.shape) inner.classList.add(`item--${item.shape}`);
  inner.textContent = _getItemEmoji(item, theme);
  slotEl.appendChild(inner);
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
      <p class="level__instruction">Arrastra cada elemento a su zona — los que ya están son pistas:</p>
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

  const bankItems = _buildClassificationPrefill(level);
  _renderItemBank(bankItems, level.theme, 'items-container');
}

function _buildClassificationPrefill(level) {
  const emptySlots      = level.emptySlots ?? level.availableItems.length;
  const preclassifyCount = level.availableItems.length - emptySlots;

  // Aplanar items del goal en orden: cat1[0], cat2[0], cat1[1], cat2[1]... (alternado)
  // para distribuir las pistas equitativamente entre categorías
  const catIds    = Object.keys(level.goal);
  const goalArrays = catIds.map(cid => [...level.goal[cid]]);
  const flatGoal  = [];
  const maxLen    = Math.max(...goalArrays.map(a => a.length));
  for (let i = 0; i < maxLen; i++) {
    goalArrays.forEach((arr, ci) => {
      if (arr[i]) flatGoal.push({ catId: catIds[ci], itemId: arr[i] });
    });
  }

  const preclassified = flatGoal.slice(0, preclassifyCount);
  const bankItemIds   = new Set(flatGoal.slice(preclassifyCount).map(x => x.itemId));

  // Renderizar pistas en cada zona
  preclassified.forEach(({ catId, itemId }) => {
    const item   = level.availableItems.find(it => it.id === itemId);
    if (!item) return;
    _categories[catId].push(itemId);
    const zoneEl = document.getElementById(`cat-items-${catId}`);
    const el     = _createItemElement(item, level.theme, true);
    el.classList.add('item--prefill');
    zoneEl.appendChild(el);
  });

  return level.availableItems.filter(it => bankItemIds.has(it.id));
}

function _bindCategoryDrop(zoneEl, catId) {
  zoneEl.addEventListener('dragover',  e => { e.preventDefault(); zoneEl.classList.add('drag-over'); });
  zoneEl.addEventListener('dragleave', () => zoneEl.classList.remove('drag-over'));
  zoneEl.addEventListener('drop', e => {
    e.preventDefault();
    zoneEl.classList.remove('drag-over');
    if (_draggedItemId) _placeItemInCategory(catId, _draggedItemId);
  });
}

function _placeItemInCategory(catId, itemId) {
  const level    = _currentLevel;
  const itemData = level.availableItems.find(i => i.id === itemId);
  if (!itemData) return;

  // Retirar de categoría anterior (no pre-llenada)
  if (_draggedFromCat && _draggedFromCat !== catId) {
    _categories[_draggedFromCat] = _categories[_draggedFromCat].filter(id => id !== itemId);
    const prevZone = document.getElementById(`cat-items-${_draggedFromCat}`);
    prevZone?.querySelector(`[data-item-id="${itemId}"]`)?.remove();
  }

  if (_categories[catId].includes(itemId)) return;

  _categories[catId].push(itemId);

  const zoneEl = document.getElementById(`cat-items-${catId}`);
  const itemEl = _createItemElement(itemData, level.theme, true);
  itemEl.addEventListener('click', () => {
    // Solo remover si NO es prefill
    if (!itemEl.classList.contains('item--prefill')) _removeFromCategory(catId, itemId, itemEl);
  });
  zoneEl.appendChild(itemEl);

  document.querySelector(`#items-container [data-item-id="${itemId}"]`)?.classList.add('used');
  _draggedFromCat = null;
}

function _removeFromCategory(catId, itemId, itemEl) {
  _categories[catId] = _categories[catId].filter(id => id !== itemId);
  itemEl.remove();
  document.querySelector(`#items-container [data-item-id="${itemId}"]`)?.classList.remove('used');
}

// ─── BANCO DE ITEMS ───────────────────────────────────────
function _renderItemBank(items, theme, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  Helpers.shuffle(items).forEach(item => container.appendChild(_createItemElement(item, theme, false)));
}

function _createItemElement(item, theme, inZone) {
  const el = document.createElement('div');
  el.className      = 'item';
  el.dataset.itemId = item.id;
  el.title          = item.label;

  const colorAttr = item.color || item.shape;
  if (colorAttr) el.classList.add(`item--${colorAttr}`);
  if (item.shape) el.classList.add(`item--${item.shape}`);
  el.textContent = _getItemEmoji(item, theme);

  el.setAttribute('draggable', 'true');

  el.addEventListener('dragstart', e => {
    _draggedItemId  = item.id;
    _draggedFromCat = inZone
      ? Object.keys(_categories).find(cid => _categories[cid].includes(item.id)) || null
      : null;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  el.addEventListener('dragend', () => { el.classList.remove('dragging'); _draggedItemId = null; });

  if (!inZone) {
    _bindTouchDrag(el, item);
    if (_currentLevel?.type === 'pattern') {
      el.addEventListener('click', () => {
        const emptyIdx = _slots.findIndex(s => !s.prefilled && !s.itemId);
        if (emptyIdx !== -1) _placeItemInSlot(emptyIdx, item.id);
      });
    }
  } else {
    el.style.cursor = 'pointer';
    _bindTouchDrag(el, item);
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
  if (_slots[slotIndex]?.prefilled) return;
  const level    = _currentLevel;
  const itemData = level.availableItems.find(i => i.id === itemId);
  if (!itemData) return;

  const prevItem = _slots[slotIndex].itemId;
  if (prevItem) _returnItemToBank(prevItem);

  const prevSlot = _slots.findIndex(s => !s.prefilled && s.itemId === itemId);
  if (prevSlot !== -1 && prevSlot !== slotIndex) {
    _slots[prevSlot].itemId   = null;
    _slots[prevSlot].itemData = null;
    _renderSlotContent(prevSlot, null, level.theme);
  }

  _slots[slotIndex].itemId   = itemId;
  _slots[slotIndex].itemData = itemData;
  _renderSlotContent(slotIndex, itemData, level.theme);
  _markItemUsed(itemId);
}

function _removeFromSlot(slotIndex) {
  if (_slots[slotIndex]?.prefilled) return;
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
      const slotEl = target?.closest('.slot:not(.slot--prefilled)');
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
  document.querySelectorAll('.slot:not(.slot--prefilled), .cat-zone').forEach(el => el.classList.remove('drag-over'));
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  (target?.closest('.slot:not(.slot--prefilled)') || target?.closest('.cat-zone'))?.classList.add('drag-over');
}

function _clearHighlights() {
  document.querySelectorAll('.slot, .cat-zone').forEach(el => el.classList.remove('drag-over'));
}

// ─── CHECK ────────────────────────────────────────────────
function _check() {
  const level = _currentLevel;

  // Registrar tiempo de este intento
  const now = Date.now();
  if (_attemptStart) _attemptTimes.push(now - _attemptStart);
  _attemptStart = now;

  GameStateManager.incrementAttempts();
  const attempts = GameStateManager.get('attempts');
  HUD.setAttempts(attempts);

  let result;
  let slotEls = [];

  if (level.type === 'pattern') {
    const attribute    = level.rule.attributes[0];
    const playerAnswer = _slots.map(s => s.itemData ? s.itemData[attribute] : null);

    if (playerAnswer.includes(null)) {
      GameStateManager.set('attempts', attempts - 1);
      HUD.setAttempts(attempts - 1);
      _showInlineFeedback('Completa todos los espacios vacíos antes de verificar', 'info');
      return;
    }

    result  = RuleEngine.evaluate(level, playerAnswer);
    slotEls = _slots.map(s => s.el);

  } else if (level.type === 'classification') {
    // Calcular cuántos ítems del banco (no prefill) fueron clasificados
    const emptySlots    = level.emptySlots ?? level.availableItems.length;
    const bankItemsEl   = document.querySelectorAll('#items-container .item:not(.used)');
    if (bankItemsEl.length > 0) {
      GameStateManager.set('attempts', attempts - 1);
      HUD.setAttempts(attempts - 1);
      _showInlineFeedback('Clasifica todos los elementos del banco antes de verificar', 'info');
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
    impulsive:  'No tan rápido — mira el patrón completo antes de colocar',
    visual:     'Casi — revisa bien el color o la forma de cada elemento',
    rule:       'Ese elemento no pertenece al patrón. Fíjate cuáles se repiten',
    incomplete: 'Faltan elementos por colocar'
  };
  _showInlineFeedback(messages[errorType] || 'Algo no está bien — intenta de nuevo', 'error');
}

// ─── FEEDBACK SCREEN ──────────────────────────────────────
function _showFeedbackScreen(attempts, elapsed, hasNext) {
  const state           = GameStateManager.get();
  const totalRepaired   = state.totalRepaired;
  const sessionRepaired = state.sessionRepaired;

  // Confetti
  _showConfetti();

  // Mensaje motivacional aleatorio
  const celebrationMessages = [
    '¡Increíble! La galaxia está más segura gracias a ti.',
    '¡Excelente trabajo! Eres un verdadero ingeniero espacial.',
    '¡Lo lograste! El sistema volvió a funcionar.',
    '¡Misión cumplida! Tu lógica es imparable.',
    '¡Genial! Cada vez resuelves más rápido.'
  ];
  const msgEl = document.getElementById('feedback-message');
  msgEl.textContent = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];

  // Estadísticas simplificadas (aptas para niños)
  let statsHtml = `Tiempo: ${Helpers.formatTime(elapsed)} · Intentos: ${attempts}`;
  if (attempts === 1) {
    statsHtml = `¡Perfecto a la primera! · Tiempo: ${Helpers.formatTime(elapsed)}`;
  }
  document.getElementById('feedback-stats').textContent = statsHtml;

  // Contador revelado
  const counterEl = document.getElementById('feedback-counter');
  counterEl.innerHTML = `
    <span class="counter__session">Esta sesión: ${sessionRepaired} sistema${sessionRepaired !== 1 ? 's' : ''}</span>
    <span class="counter__total">Total reparados: ${totalRepaired} ✦</span>
  `;

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

// ─── HINT SYSTEM ─────────────────────────────────────────
function _setupHintButton(level) {
  const btn   = document.getElementById('btn-hint');
  const panel = document.getElementById('hint-panel');
  panel.style.display = 'none';

  const newBtn = btn.cloneNode(true);
  btn.replaceWith(newBtn);

  let visible = false;
  newBtn.addEventListener('click', () => {
    visible = !visible;
    if (visible) {
      panel.textContent    = level.hint || 'Observa el patrón con atención.';
      panel.style.display  = 'block';
    } else {
      panel.style.display  = 'none';
    }
  });
}

// ─── PROGRESS INDICATOR ──────────────────────────────────
function _updateProgress(level) {
  const all     = LevelRepository.getAll();
  const index   = all.findIndex(l => l.id === level.id) + 1;
  const total   = all.length;
  const el      = document.getElementById('hud-progress');
  if (el) el.textContent = `${index}/${total}`;
}

// ─── INLINE FEEDBACK (reemplaza toast para errores en nivel) ──
function _showInlineFeedback(text, type) {
  const el = document.getElementById('inline-feedback');
  if (!el) return;
  el.className   = `feedback-inline feedback-inline--${type}`;
  el.textContent = text;
  el.style.display = 'block';

  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.display = 'none'; }, 5000);
}

function _hideInlineFeedback() {
  const el = document.getElementById('inline-feedback');
  if (el) el.style.display = 'none';
}

// ─── CONFETTI ────────────────────────────────────────────
function _showConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#2ecc71','#4f8ef7','#f1c40f','#e74c3c','#9b59b6','#1abc9c'];
  for (let i = 0; i < 40; i++) {
    const piece  = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left            = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;
    piece.style.animationDelay    = `${Math.random() * 0.6}s`;
    piece.style.width  = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 4000);
}

// ─── CUSTOM MODAL ────────────────────────────────────────
function _showModal(text, onConfirm) {
  const overlay   = document.getElementById('modal-overlay');
  const textEl    = document.getElementById('modal-text');
  const cancelBtn = document.getElementById('modal-cancel');
  const confirmBtn = document.getElementById('modal-confirm');

  textEl.textContent    = text;
  overlay.style.display = 'flex';

  const cleanup = () => { overlay.style.display = 'none'; };

  const newCancel  = cancelBtn.cloneNode(true);
  const newConfirm = confirmBtn.cloneNode(true);
  cancelBtn.replaceWith(newCancel);
  confirmBtn.replaceWith(newConfirm);

  newCancel.addEventListener('click', cleanup);
  newConfirm.addEventListener('click', () => { cleanup(); onConfirm(); });
}

// ===== START =====
init();
