const ScreenManager = (() => {
  const screens = {};

  function register(name, element) {
    screens[name] = element;
  }

  function show(name) {
    Object.entries(screens).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle('screen--active', key === name);
      el.classList.toggle('screen--hidden', key !== name);
    });

    GameStateManager.set('screen', name);
    EventBus.emit('screen:changed', { screen: name });
  }

  function current() {
    return GameStateManager.get('screen');
  }

  return { register, show, current };
})();
