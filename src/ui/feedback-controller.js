const FeedbackController = (() => {
  function showCorrect(slotElements) {
    slotElements.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('slot--correct');
        el.classList.remove('slot--incorrect');
      }, i * 120);
    });

    EventBus.emit('feedback:correct', {});
  }

  function showIncorrect(slotElements, firstErrorIndex) {
    slotElements.forEach((el, i) => {
      el.classList.remove('slot--correct');
      if (i >= firstErrorIndex) {
        el.classList.add('slot--incorrect');
      }
    });

    setTimeout(() => {
      slotElements.forEach(el => el.classList.remove('slot--incorrect'));
    }, 800);

    EventBus.emit('feedback:incorrect', { firstErrorIndex });
  }

  function showMessage(text, type = 'info') {
    const existing = document.querySelector('.feedback-message');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = `feedback-message feedback-message--${type}`;
    msg.textContent = text;
    document.body.appendChild(msg);

    setTimeout(() => msg.remove(), 2000);
  }

  function showLevelComplete() {
    showMessage('¡Sistema reparado!', 'success');
    EventBus.emit('feedback:levelComplete', {});
  }

  return { showCorrect, showIncorrect, showMessage, showLevelComplete };
})();
