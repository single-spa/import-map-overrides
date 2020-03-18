const localStoragePrefix = "import-map-override:";

const portRegex = /^\d+$/g;

const importMapMetaElement = document.querySelector(
  'meta[name="importmap-type"]'
);

export const importMapType = importMapMetaElement
  ? importMapMetaElement.getAttribute("content")
  : "importmap";

const serverOverrides = importMapType === "server";

window.importMapOverrides = {
  addOverride(moduleName, url) {
    if (portRegex.test(url)) {
      url = window.importMapOverrides.getUrlFromPort(moduleName, url);
    }
    const key = localStoragePrefix + moduleName;
    localStorage.setItem(key, url);
    if (serverOverrides) {
      document.cookie = `${key}=${url}`;
    }
    fireChangedEvent();
    return window.importMapOverrides.getOverrideMap();
  },
  getOverrideMap() {
    const overrides = { imports: {} };
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(localStoragePrefix)) {
        overrides.imports[
          key.slice(localStoragePrefix.length)
        ] = localStorage.getItem(key);
      }
    }

    return overrides;
  },
  removeOverride(moduleName) {
    const key = localStoragePrefix + moduleName;
    const hasItem = localStorage.getItem(key) !== null;
    localStorage.removeItem(key);
    if (serverOverrides) {
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
    fireChangedEvent();
    return hasItem;
  },
  resetOverrides() {
    Object.keys(window.importMapOverrides.getOverrideMap().imports).forEach(
      moduleName => {
        window.importMapOverrides.removeOverride(moduleName);
      }
    );
    fireChangedEvent();
    return window.importMapOverrides.getOverrideMap();
  },
  hasOverrides() {
    return (
      Object.keys(window.importMapOverrides.getOverrideMap().imports).length > 0
    );
  },
  getUrlFromPort(moduleName, port) {
    const fileName = moduleName.replace(/@/g, "").replace(/\//g, "-");
    return `//localhost:${port}/${fileName}.js`;
  },
  enableUI() {
    const customElementName = "import-map-overrides-full";
    const showWhenLocalStorage = "show-when-local-storage";
    let customElement = document.querySelector(customElementName);

    if (!customElement) {
      customElement = document.createElement(customElementName);
      customElement.setAttribute(showWhenLocalStorage, "devtools");
      document.body.appendChild(customElement);
    }

    const localStorageKey = customElement.getAttribute(showWhenLocalStorage);
    if (localStorageKey) {
      localStorage.setItem(localStorageKey, true);
      customElement.renderWithPreact();
    }
  }
};

function fireChangedEvent() {
  // Set timeout so that event fires after the change has totally finished
  setTimeout(() => {
    if (window.CustomEvent) {
      window.dispatchEvent(new CustomEvent("import-map-overrides:change"));
    }
  });
}

const overrideMap = window.importMapOverrides.getOverrideMap();

if (window.importMap) {
} else {
  if (Object.keys(overrideMap.imports).length > 0) {
    const overrideMapElement = document.createElement("script");
    overrideMapElement.type = importMapType;
    overrideMapElement.id = "import-map-overrides"; // for debugging and for UI to identify this import map as special
    overrideMapElement.innerHTML = JSON.stringify(overrideMap);

    const importMaps = document.querySelectorAll(
      `script[type="${importMapType}"]`
    );
    if (importMaps.length > 0) {
      importMaps[importMaps.length - 1].insertAdjacentElement(
        "afterend",
        overrideMapElement
      );
    } else {
      document.head.appendChild(overrideMapElement);
    }
  }
}
