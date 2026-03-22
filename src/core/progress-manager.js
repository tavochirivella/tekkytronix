const ProgressManager = (() => {
  const STORAGE_KEY = 'tekkytronix_save';
  const SCHEMA_VERSION = 2;

  const _defaults = {
    version: SCHEMA_VERSION,
    unlockedLevels: ['level_01'],
    lastLevelId: null,
    totalRepaired: 0,
    audioEnabled: true,
    metrics: {}
  };

  function _safeRead() {
    try {
      const raw = Storage.get(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Migrar version 1 → 2
      if (data.version === 1) {
        return { ..._defaults, unlockedLevels: data.unlockedLevels || ['level_01'], metrics: data.metrics || {} };
      }
      if (data.version !== SCHEMA_VERSION) return null;
      return data;
    } catch {
      return null;
    }
  }

  function load() {
    const saved = _safeRead();
    if (!saved) return { ..._defaults };
    return saved;
  }

  function save(data) {
    try {
      Storage.set(STORAGE_KEY, JSON.stringify({ ...data, version: SCHEMA_VERSION }));
    } catch (err) {
      console.warn('[ProgressManager] No se pudo guardar progreso:', err);
    }
  }

  function applyToState(saved) {
    GameStateManager.set('unlockedLevels', saved.unlockedLevels || ['level_01']);
    GameStateManager.set('audioEnabled', saved.audioEnabled ?? true);
    GameStateManager.set('performanceMetrics', saved.metrics || {});
    GameStateManager.set('totalRepaired', saved.totalRepaired || 0);
  }

  function saveFromState() {
    const state = GameStateManager.get();
    save({
      unlockedLevels: state.unlockedLevels,
      lastLevelId: state.currentLevelId,
      totalRepaired: state.totalRepaired,
      audioEnabled: state.audioEnabled,
      metrics: state.performanceMetrics
    });
  }

  function recordLevelResult(levelId, attempts, elapsedTime) {
    const state = GameStateManager.get();
    const metrics = state.performanceMetrics || {};
    // Solo registrar si es la primera vez o fue mejor intento
    const prev = metrics[levelId];
    if (!prev || attempts <= prev.attempts) {
      metrics[levelId] = { attempts, elapsedTime, completedAt: Date.now() };
      GameStateManager.set('performanceMetrics', metrics);
    }
    GameStateManager.incrementRepaired();
    saveFromState();
  }

  function getLastLevelId() {
    const saved = _safeRead();
    return saved?.lastLevelId || null;
  }

  function clear() {
    Storage.remove(STORAGE_KEY);
  }

  return { load, save, applyToState, saveFromState, recordLevelResult, getLastLevelId, clear };
})();
