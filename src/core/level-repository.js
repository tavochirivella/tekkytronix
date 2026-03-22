const LevelRepository = (() => {
  let _levels = [];
  let _loaded = false;

  async function load() {
    if (_loaded) return;
    try {
      const response = await fetch('./src/data/levels.json');
      if (!response.ok) throw new Error('No se pudo cargar levels.json');
      _levels = await response.json();
      _loaded = true;
    } catch (err) {
      console.error('[LevelRepository] Error cargando niveles:', err);
      _levels = [];
    }
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
