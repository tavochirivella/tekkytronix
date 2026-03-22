const LevelRepository = (() => {
  let _levels = [];
  let _loaded = false;

  function load() {
    if (_loaded) return;
    if (typeof LEVELS_DATA === 'undefined') {
      console.error('[LevelRepository] LEVELS_DATA no está definido. Verifica que levels.js está incluido.');
      return;
    }
    _levels = LEVELS_DATA;
    _loaded = true;
  }

  function getById(id) {
    const level = _levels.find(l => l.id === id);
    if (!level) console.warn(`[LevelRepository] Nivel no encontrado: ${id}`);
    return level || null;
  }

  function getAll() {
    return [..._levels];
  }

  function getNextId(currentId) {
    const index = _levels.findIndex(l => l.id === currentId);
    if (index === -1 || index >= _levels.length - 1) return null;
    return _levels[index + 1].id;
  }

  function isLoaded() {
    return _loaded;
  }

  return { load, getById, getAll, getNextId, isLoaded };
})();
