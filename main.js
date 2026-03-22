// ===== TEKKYTRONIX — main.js =====
// Vertical Slice: Fase 1

// Emojis por tema y atributo
const ITEM_VISUALS = {
  planets: { red: '🔴', blue: '🔵', yellow: '🟡', purple: '🟣' },
  symbols: { circle: '⭕', triangle: '🔺' },
  robots:  { red: '🤖', blue: '🤖', yellow: '🤖', purple: '🤖' }
};

const ROBOT_COLORS = { yellow: '🟡', purple: '🟣' };

let _currentLevel = null;
let _slots = [];        // Array de { el, itemId | null }
let _draggedItemId = null;

// ===== INIT =====
async function init() {
  _registerScreens();
  _bindStartScreen();

  const saved = ProgressManager.load();
  ProgressManager.applyToState(saved);

  await LevelRepository.load();

  ScreenManager.show(CONSTANTS.SCREENS.START);
}

function _registerScreens() {
  ScreenManager.register(CONSTANTS.SCREENS.START,    document.getElementById('screen-start'));
  ScreenManager.register(CONSTANTS.SCREENS.LEVEL,    document.getElementById('screen-level'));
  ScreenManager.register(CONSTANTS.SCREENS.FEEDBACK, document.getElementById('screen-feedback'));
}

// ===== START SCREEN =====
function _bindStartScreen() {
  document.getElementById('btn-start').addEventListener('click', () => {
    const unlocked = GameStateManager.get('unlockedLevels');
    _loadLevel(unlocked[0]);
  });
}

// ===== LEVEL =====
function _loadLevel(levelId) {
  const level = LevelRepository.getById(levelId);
  if (!level) {
    FeedbackController.showMessage('Error cargando nivel', 'error');
    return;
  }

  _currentLevel = level;
  GameStateManager.resetForLevel(levelId);
  GameStateManager.startTimer();

  _renderLevel(level);
  ScreenManager.show(CONSTANTS.SCREENS.LEVEL);
}

function _renderLevel(level) {
  document.getElementById('level-title').textContent = level.title;
  document.getElementById('level-counter').textContent = `Nivel ${_getLevelIndex(level.id) + 1}`;

  _renderSlots(level);
  _renderItems(level);
  _bindLevelButtons(level);
}

function _getLevelIndex(levelId) {
  return LevelRepository.getAll().findIndex(l => l.id === levelId);
}

function _renderSlots(level) {
  const container = document.getElementById('slots-container');
  container.innerHTML = '';
  _slots = [];

  for (let i = 0; i < level.slots; i++) {
    const el = document.createElement('div');
    el.className = 'slot';
    el.dataset.index = i;

    _bindSlotDrop(el, i);
    container.appendChild(el);
    _slots.push({ el, itemId: null, itemData: null });
  }
}

function _renderItems(level) {
  const container = document.getElementById('items-container');
  container.innerHTML = '';

  const shuffled = Helpers.shuffle(level.availableItems);

  shuffled.forEach(item => {
    const el = _createItemElement(item, level.theme);
    container.appendChild(el);
  });
}

function _createItemElement(item, theme) {
  const el = document.createElement('div');
  el.className = 'item';
  el.dataset.itemId = item.id;
  el.title = item.label;

  // Color class
  const colorAttr = item.color || item.shape;
  if (colorAttr) el.classList.add(`item--${colorAttr}`);

  // Shape class
  if (item.shape) el.classList.add(`item--${item.shape}`);

  // Emoji visual
  el.textContent = _getItemEmoji(item, theme);

  // Drag events
  el.setAttribute('draggable', 'true');
  el.addEventListener('dragstart', e => _onDragStart(e, item));
  el.addEventListener('dragend',   e => _onDragEnd(e));

  // Touch events
  _bindTouchDrag(el, item);

  return el;
}

function _getItemEmoji(item, theme) {
  if (theme === 'robots') {
    return ROBOT_COLORS[item.color] || '🤖';
  }
  const map = ITEM_VISUALS[theme];
  if (!map) return '●';
  return map[item.color] || map[item.shape] || '●';
}

// ===== DRAG & DROP (mouse) =====
function _onDragStart(e, item) {
  _draggedItemId = item.id;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function _onDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  _draggedItemId = null;
}

function _bindSlotDrop(el, index) {
  el.addEventListener('dragover', e => {
    e.preventDefault();
    el.classList.add('drag-over');
  });

  el.addEventListener('dragleave', () => {
    el.classList.remove('drag-over');
  });

  el.addEventListener('drop', e => {
    e.preventDefault();
    el.classList.remove('drag-over');
    if (_draggedItemId) _placeItemInSlot(index, _draggedItemId);
  });
}

// ===== TOUCH DRAG =====
function _bindTouchDrag(el, item) {
  let clone = null;
  let originSlotIndex = null;

  el.addEventListener('touchstart', e => {
    _draggedItemId = item.id;
    el.classList.add('dragging');

    clone = el.cloneNode(true);
    clone.style.cssText = `
      position: fixed; pointer-events: none; z-index: 1000;
      opacity: 0.85; transform: scale(1.1);
      width: ${el.offsetWidth}px; height: ${el.offsetHeight}px;
    `;
    document.body.appendChild(clone);
    _moveClone(clone, e.touches[0]);

    // Detectar si viene de un slot
    originSlotIndex = _slots.findIndex(s => s.itemId === item.id);
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    e.preventDefault();
    if (clone) _moveClone(clone, e.touches[0]);
    _highlightSlotUnder(e.touches[0]);
  }, { passive: false });

  el.addEventListener('touchend', e => {
    el.classList.remove('dragging');
    if (clone) { clone.remove(); clone = null; }
    _clearSlotHighlights();

    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotEl = target?.closest('.slot');

    if (slotEl) {
      const index = parseInt(slotEl.dataset.index);
      _placeItemInSlot(index, _draggedItemId);
    } else if (originSlotIndex !== -1 && originSlotIndex !== undefined) {
      // Si venía de un slot y no cayó en ninguno, devolver
    }

    _draggedItemId = null;
  });
}

function _moveClone(clone, touch) {
  clone.style.left = `${touch.clientX - 40}px`;
  clone.style.top  = `${touch.clientY - 40}px`;
}

function _highlightSlotUnder(touch) {
  _slots.forEach(({ el }) => el.classList.remove('drag-over'));
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  const slotEl = target?.closest('.slot');
  if (slotEl) slotEl.classList.add('drag-over');
}

function _clearSlotHighlights() {
  _slots.forEach(({ el }) => el.classList.remove('drag-over'));
}

// ===== PLACE ITEM =====
function _placeItemInSlot(slotIndex, itemId) {
  const level = _currentLevel;
  const itemData = level.availableItems.find(i => i.id === itemId);
  if (!itemData) return;

  // Si el slot ya tenía un item, devolver el anterior
  const prevItem = _slots[slotIndex].itemId;
  if (prevItem) _returnItemToBank(prevItem);

  // Si el item ya estaba en otro slot, limpiar ese slot
  const prevSlot = _slots.findIndex(s => s.itemId === itemId);
  if (prevSlot !== -1 && prevSlot !== slotIndex) {
    _slots[prevSlot].itemId = null;
    _slots[prevSlot].itemData = null;
    _renderSlotContent(prevSlot, null, null, level.theme);
  }

  _slots[slotIndex].itemId = itemId;
  _slots[slotIndex].itemData = itemData;
  _renderSlotContent(slotIndex, itemData, itemId, level.theme);

  // Marcar item como usado en el banco
  _markItemUsed(itemId);
}

function _renderSlotContent(slotIndex, itemData, itemId, theme) {
  const slotEl = _slots[slotIndex].el;
  slotEl.innerHTML = '';
  slotEl.classList.remove('slot--correct', 'slot--incorrect');

  if (!itemData) return;

  const inner = document.createElement('div');
  inner.className = 'item';
  const colorAttr = itemData.color || itemData.shape;
  if (colorAttr) inner.classList.add(`item--${colorAttr}`);
  if (itemData.shape) inner.classList.add(`item--${itemData.shape}`);
  inner.textContent = _getItemEmoji(itemData, theme);
  inner.style.cursor = 'default';
  inner.style.width = '100%';
  inner.style.height = '100%';
  inner.style.border = 'none';
  inner.style.background = 'transparent';

  // Click para devolver al banco
  slotEl.addEventListener('click', () => _removeFromSlot(slotIndex), { once: true });

  slotEl.appendChild(inner);
}

function _markItemUsed(itemId) {
  const el = document.querySelector(`[data-item-id="${itemId}"]`);
  if (el) el.classList.add('used');
}

function _returnItemToBank(itemId) {
  const el = document.querySelector(`[data-item-id="${itemId}"]`);
  if (el) el.classList.remove('used');
}

function _removeFromSlot(slotIndex) {
  const itemId = _slots[slotIndex].itemId;
  if (!itemId) return;
  _slots[slotIndex].itemId = null;
  _slots[slotIndex].itemData = null;
  _renderSlotContent(slotIndex, null, null, _currentLevel.theme);
  _returnItemToBank(itemId);
}

// ===== CHECK =====
function _check() {
  const level = _currentLevel;
  const attribute = level.rule.attributes[0];

  // Construir la respuesta del jugador
  const playerAnswer = _slots.map(s => {
    if (!s.itemData) return null;
    return s.itemData[attribute];
  });

  // Validar que todos los slots estén llenos
  if (playerAnswer.includes(null)) {
    FeedbackController.showMessage('Completa todos los espacios', 'info');
    return;
  }

  GameStateManager.incrementAttempts();

  const result = RuleEngine.evaluate(level, playerAnswer);
  const slotEls = _slots.map(s => s.el);

  if (result.correct) {
    FeedbackController.showCorrect(slotEls);
    const elapsed = GameStateManager.stopTimer();
    const attempts = GameStateManager.get('attempts');
    ProgressManager.recordLevelResult(level.id, attempts, elapsed);

    const nextId = LevelRepository.getNextId(level.id);
    if (nextId) GameStateManager.unlockLevel(nextId);

    setTimeout(() => _showFeedbackScreen(attempts, elapsed, !!nextId), 1200);
  } else {
    FeedbackController.showIncorrect(slotEls, result.firstErrorIndex ?? 0);
    _showErrorHint(result.errorType);
  }
}

function _showErrorHint(errorType) {
  const messages = {
    impulsive: 'Observa el patrón antes de actuar',
    visual:    'Revisa bien la posición de cada elemento',
    rule:      'Ese elemento no pertenece al patrón',
    incomplete: 'Completa todos los espacios'
  };
  FeedbackController.showMessage(messages[errorType] || 'Intenta de nuevo', 'error');
}

// ===== FEEDBACK SCREEN =====
function _showFeedbackScreen(attempts, elapsed, hasNext) {
  const statsEl = document.getElementById('feedback-stats');
  statsEl.textContent = `Intentos: ${attempts} · Tiempo: ${Helpers.formatTime(elapsed)}`;

  const btnNext   = document.getElementById('btn-next');
  const btnReplay = document.getElementById('btn-replay');

  btnNext.style.display = hasNext ? 'block' : 'none';

  // Limpiar listeners previos
  btnNext.replaceWith(btnNext.cloneNode(true));
  btnReplay.replaceWith(btnReplay.cloneNode(true));

  document.getElementById('btn-next').addEventListener('click', () => {
    const nextId = LevelRepository.getNextId(_currentLevel.id);
    if (nextId) _loadLevel(nextId);
    else ScreenManager.show(CONSTANTS.SCREENS.START);
  });

  document.getElementById('btn-replay').addEventListener('click', () => {
    _loadLevel(_currentLevel.id);
  });

  ScreenManager.show(CONSTANTS.SCREENS.FEEDBACK);
}

// ===== LEVEL BUTTONS =====
function _bindLevelButtons(level) {
  const btnCheck = document.getElementById('btn-check');
  const btnReset = document.getElementById('btn-reset');

  btnCheck.replaceWith(btnCheck.cloneNode(true));
  btnReset.replaceWith(btnReset.cloneNode(true));

  document.getElementById('btn-check').addEventListener('click', _check);
  document.getElementById('btn-reset').addEventListener('click', () => _loadLevel(level.id));
}

// ===== START =====
init();
