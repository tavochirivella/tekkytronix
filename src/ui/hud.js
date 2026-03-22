const HUD = (() => {
  let _timerInterval = null;
  let _startTime = null;

  function startTimer() {
    _startTime = Date.now();
    _timerInterval = setInterval(_tick, 1000);
  }

  function stopTimer() {
    clearInterval(_timerInterval);
    _timerInterval = null;
  }

  function resetTimer() {
    stopTimer();
    _setTimerDisplay(0);
  }

  function _tick() {
    const elapsed = Date.now() - _startTime;
    _setTimerDisplay(elapsed);
  }

  function _setTimerDisplay(ms) {
    const el = document.getElementById('hud-timer');
    if (el) el.textContent = Helpers.formatTime(ms);
  }

  function setAttempts(n) {
    const el = document.getElementById('hud-attempts');
    if (el) el.textContent = `Intentos: ${n}`;
  }

  return { startTimer, stopTimer, resetTimer, setAttempts };
})();
