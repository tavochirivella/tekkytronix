const Helpers = (() => {
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function formatTime(ms) {
    if (ms < 10000) {
      // Menos de 10 segundos: mostrar con un decimal
      return `${(ms / 1000).toFixed(1)}s`;
    }
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
  }

  // Obtiene el atributo relevante de un item según la regla del nivel
  function getItemAttribute(item, attribute) {
    return item[attribute] || null;
  }

  return { shuffle, clamp, formatTime, getItemAttribute };
})();
