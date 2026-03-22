const HUD = (() => {
  let _timerInterval = null;
  let _startTime = null;

  // Timer corre internamente pero NO se muestra (evita ansiedad en niños)
  function startTimer() {
    _startTime = Date.now();
    // No se muestra el timer — se registra internamente para métricas
  }

  function stopTimer() {
    clearInterval(_timerInterval);
    _timerInterval = null;
  }

  function resetTimer() {
    stopTimer();
    _startTime = null;
  }

  function setAttempts(n) {
    const el = document.getElementById('hud-attempts');
    if (el) el.textContent = `Intentos: ${n}`;
  }

  return { startTimer, stopTimer, resetTimer, setAttempts };
})();
