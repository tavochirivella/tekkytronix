const ProgressManager = (() => {
  const STORAGE_KEY = 'tekkytronix_save';
  const SCHEMA_VERSION = 1;

  const _defaults = {
    version: SCHEMA_VERSION,
    unlockedLevels: ['level_01'],
    completedLevels: [],
    audioEnabled: true,
    metrics: {}
  };

  function _safeRead() {
    try {
      const raw = Storage.get(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
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
    GameStateManager.set('unlockedLevels', saved.unlockedLevels);
    GameStateManager.set('audioEnabled', saved.audioEnabled);
    GameStateManager.set('performanceMetrics', saved.metrics || {});
  }

  function saveFromState() {
    const state = GameStateManager.get();
    save({
      unlockedLevels: state.unlockedLevels,
      completedLevels: Object.keys(state.performanceMetrics),
      audioEnabled: state.audioEnabled,
      metrics: state.performanceMetrics
    });
  }

  function recordLevelResult(levelId, attempts, elapsedTime) {
    const state = GameStateManager.get();
    const metrics = state.performanceMetrics || {};
    metrics[levelId] = { attempts, elapsedTime, completedAt: Date.now() };
    GameStateManager.set('performanceMetrics', metrics);
    saveFromState();
  }

  function clear() {
    Storage.remove(STORAGE_KEY);
  }

  return { load, save, applyToState, saveFromState, recordLevelResult, clear };
})();
