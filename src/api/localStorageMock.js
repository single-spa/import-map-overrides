// Mocks for the localStorage
export const localStorageMock = (function () {
  let store = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    key(index) {
      return Object.keys(store)[index] || null;
    },
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();
