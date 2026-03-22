const GameStateManager = (() => {
  const state = {
    screen: 'start',
    currentLevelId: null,
    unlockedLevels: ['level_01'],
    attempts: 0,
    elapsedTime: 0,
    currentInteractionState: {},
    audioEnabled: true,
    performanceMetrics: {},
    totalRepaired: 0,      // contador total de sistemas reparados (persistido)
    sessionRepaired: 0     // contador de esta sesión (no persistido)
  };

  let _startTime = null;

  function get(key) {
    return key ? state[key] : { ...state };
  }

  function set(key, value) {
    if (!(key in state)) return;
    state[key] = value;
    EventBus.emit('state:changed', { key, value });
  }

  function startTimer() {
    _startTime = Date.now();
  }

  function stopTimer() {
    if (!_startTime) return 0;
    const elapsed = Date.now() - _startTime;
    state.elapsedTime = elapsed;
    _startTime = null;
    return elapsed;
  }

  function incrementAttempts() {
    state.attempts += 1;
  }

  function resetForLevel(levelId) {
    state.currentLevelId = levelId;
    state.attempts = 0;
    state.elapsedTime = 0;
    state.currentInteractionState = {};
    _startTime = null;
  }

  function unlockLevel(levelId) {
    if (!state.unlockedLevels.includes(levelId)) {
      state.unlockedLevels.push(levelId);
      EventBus.emit('level:unlocked', { levelId });
    }
  }

  function incrementRepaired() {
    state.totalRepaired += 1;
    state.sessionRepaired += 1;
  }

  return { get, set, startTimer, stopTimer, incrementAttempts, resetForLevel, unlockLevel, incrementRepaired };
})();
