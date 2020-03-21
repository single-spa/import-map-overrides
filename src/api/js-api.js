const localStoragePrefix = "import-map-override:";
const disabledOverridesLocalStorageKey = "import-map-overrides-disabled";

const portRegex = /^\d+$/g;

const importMapMetaElement = document.querySelector(
  'meta[name="importmap-type"]'
);

export const importMapType = importMapMetaElement
  ? importMapMetaElement.getAttribute("content")
  : "importmap";

const serverOverrides = importMapType === "server";

let defaultMapPromise;

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
  getOverrideMap(includeDisabled = false) {
    const overrides = { imports: {} };
    const disabledOverrides = imo.getDisabledOverrides();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(localStoragePrefix)) {
        const moduleName = key.slice(localStoragePrefix.length);
        if (includeDisabled || !disabledOverrides.includes(moduleName)) {
          overrides.imports[moduleName] = localStorage.getItem(key);
        }
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
    imo.enableOverride(moduleName);
    fireChangedEvent();
    return hasItem;
  },
  resetOverrides() {
    Object.keys(imo.getOverrideMap(true).imports).forEach((moduleName) => {
      imo.removeOverride(moduleName);
    });
    localStorage.removeItem(disabledOverridesLocalStorageKey);
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
    const outMap = { imports: {}, scopes: {} };
    for (let i in originalMap.imports) {
      outMap.imports[i] = originalMap.imports[i];
    }
    for (let i in newMap.imports) {
      outMap.imports[i] = newMap.imports[i];
    }
    for (let i in originalMap.scopes) {
      outMap.scopes[i] = originalMap.scopes[i];
    }
    for (let i in newMap.scopes) {
      outMap.scopes[i] = newMap.scopes[i];
    }
    return outMap;
  },
  getDefaultMap() {
    return (
      defaultMapPromise ||
      (defaultMapPromise = Array.prototype.reduce.call(
        document.querySelectorAll(
          `script[type="${importMapType}"], script[type="overridable-importmap"]`
        ),
        (promise, scriptEl) => {
          if (scriptEl.id === "import-map-overrides") {
            return promise;
          } else {
            let nextPromise;
            if (scriptEl.src) {
              nextPromise = fetch(scriptEl.src).then((resp) => resp.json());
            } else {
              nextPromise = Promise.resolve(JSON.parse(scriptEl.textContent));
            }

            return Promise.all([
              promise,
              nextPromise,
            ]).then(([originalMap, newMap]) =>
              imo.mergeImportMap(originalMap, newMap)
            );
          }
        },
        Promise.resolve({ imports: {} })
      ))
    );
  },
  getCurrentPageMap() {
    return imo.getDefaultMap().then((defaultMap) => {
      const overrideEl = document.querySelector("#import-map-overrides");
      const overrideMap = overrideEl
        ? JSON.parse(overrideEl.textContent)
        : { imports: {} };
      return imo.mergeImportMap(defaultMap, overrideMap);
    });
  },
  getNextPageMap() {
    return imo.getDefaultMap().then((defaultMap) => {
      return imo.mergeImportMap(defaultMap, imo.getOverrideMap());
    });
  },
  disableOverride(moduleName) {
    const disabledOverrides = imo.getDisabledOverrides();
    if (!disabledOverrides.includes(moduleName)) {
      localStorage.setItem(
        disabledOverridesLocalStorageKey,
        JSON.stringify(disabledOverrides.concat(moduleName))
      );
      fireChangedEvent();
      return true;
    } else {
      return false;
    }
  },
  enableOverride(moduleName) {
    const disabledOverrides = imo.getDisabledOverrides();
    const index = disabledOverrides.indexOf(moduleName);
    if (index >= 0) {
      disabledOverrides.splice(index, 1);
      localStorage.setItem(
        disabledOverridesLocalStorageKey,
        JSON.stringify(disabledOverrides)
      );
      fireChangedEvent();
      return true;
    } else {
      return false;
    }
  },
  getDisabledOverrides() {
    const disabledOverrides = localStorage.getItem(
      disabledOverridesLocalStorageKey
    );
    return disabledOverrides ? JSON.parse(disabledOverrides) : [];
  },
  isDisabled(moduleName) {
    return imo.getDisabledOverrides().includes(moduleName);
  },
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
  if (overridableImportMap.src) {
    throw Error(
      `import-map-overrides: external import maps with type="overridable-importmap" are not supported`
    );
  }
  let originalMap;
  try {
    originalMap = JSON.parse(overridableImportMap.textContent);
  } catch (e) {
    throw Error(
      `Invalid <script type="overridable-importmap"> - text content must be json`
    );
  }

  const finalMap = window.importMapOverrides.mergeImportMap(
    originalMap,
    overrideMap
  );
  insertOverrideMap(finalMap, overridableImportMap);
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
  overrideMapElement.textContent = JSON.stringify(map, null, 2);

  if (referenceNode) {
    referenceNode.insertAdjacentElement("afterend", overrideMapElement);
  } else {
    document.head.appendChild(overrideMapElement);
  }
}
