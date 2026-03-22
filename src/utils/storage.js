const Storage = (() => {
  function _isAvailable() {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return true;
    } catch {
      return false;
    }
  }

  function get(key) {
    if (!_isAvailable()) return null;
    return localStorage.getItem(key);
  }

  function set(key, value) {
    if (!_isAvailable()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function remove(key) {
    if (!_isAvailable()) return;
    localStorage.removeItem(key);
  }

  return { get, set, remove };
})();
