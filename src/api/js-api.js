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
      url = imo.getUrlFromPort(moduleName, url);
    }
    const key = localStoragePrefix + moduleName;
    localStorage.setItem(key, url);
    if (serverOverrides) {
      document.cookie = `${key}=${url}`;
    }
    fireChangedEvent();
    return imo.getOverrideMap();
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
    Object.keys(imo.getOverrideMap().imports).forEach(moduleName => {
      imo.removeOverride(moduleName);
    });
    fireChangedEvent();
    return imo.getOverrideMap();
  },
  hasOverrides() {
    return Object.keys(imo.getOverrideMap().imports).length > 0;
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
  },
  mergeImportMap(originalMap, newMap) {
    for (let i in newMap.imports) {
      originalMap.imports[i] = newMap.imports[i];
    }
    for (let i in newMap.scopes) {
      originalMap.scopes[i] = newMap.scopes[i];
    }
    return originalMap;
  }
};

const imo = window.importMapOverrides;

function fireChangedEvent() {
  // Set timeout so that event fires after the change has totally finished
  setTimeout(() => {
    if (window.CustomEvent) {
      window.dispatchEvent(new CustomEvent("import-map-overrides:change"));
    }
  });
}

const overrideMap = window.importMapOverrides.getOverrideMap();
const overridableImportMap = document.querySelector(
  'script[type="overridable-importmap"]'
);

if (overridableImportMap) {
  let originalMap;
  try {
    originalMap = JSON.parse(overridableImportMap.textContent);
  } catch (e) {
    throw Error(
      `Invalid <script type="overridable-importmap"> - text content must be json`
    );
  }

  window.importMapOverrides.mergeImportMap(originalMap, overrideMap);
  insertOverrideMap(originalMap, overridableImportMap);
} else {
  if (Object.keys(overrideMap.imports).length > 0) {
    const importMaps = document.querySelectorAll(
      `script[type="${importMapType}"]`
    );
    insertOverrideMap(
      overrideMap,
      importMaps ? importMaps[importMaps.length - 1] : null
    );
  }
}

function insertOverrideMap(map, referenceNode) {
  const overrideMapElement = document.createElement("script");
  overrideMapElement.type = importMapType;
  overrideMapElement.id = "import-map-overrides"; // for debugging and for UI to identify this import map as special
  overrideMapElement.innerHTML = JSON.stringify(map, null, 2);

  if (referenceNode) {
    referenceNode.insertAdjacentElement("afterend", overrideMapElement);
  } else {
    document.head.appendChild(overrideMapElement);
  }
}
