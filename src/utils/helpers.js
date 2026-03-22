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
    const s = Math.floor(ms / 1000);
    return `${s}s`;
  }

  // Obtiene el atributo relevante de un item según la regla del nivel
  function getItemAttribute(item, attribute) {
    return item[attribute] || null;
  }

  return { shuffle, clamp, formatTime, getItemAttribute };
})();
