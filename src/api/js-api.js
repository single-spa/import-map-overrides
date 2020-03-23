const localStoragePrefix = "import-map-override:";
const disabledOverridesLocalStorageKey = "import-map-overrides-disabled";
const externalOverridesLocalStorageKey = "import-map-overrides-external-maps";
const overrideAttribute = "data-is-importmap-override";

const portRegex = /^\d+$/g;

const importMapMetaElement = document.querySelector(
  'meta[name="importmap-type"]'
);

const externalOverrideMapPromises = {};

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
    const overrides = createEmptyImportMap();
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
    localStorage.removeItem(externalOverridesLocalStorageKey);
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
      customElement.setAttribute(showWhenLocalStorage, "true");
      document.body.appendChild(customElement);
    }

    const localStorageKey = customElement.getAttribute(showWhenLocalStorage);
    if (localStorageKey) {
      localStorage.setItem(localStorageKey, true);
      customElement.renderWithPreact();
    }
  },
  mergeImportMap(originalMap, newMap) {
    const outMap = createEmptyImportMap();
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
          if (scriptEl.hasAttribute(overrideAttribute)) {
            return promise;
          } else {
            let nextPromise;
            if (scriptEl.src) {
              nextPromise = fetchExternalMap(scriptEl.src);
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
        Promise.resolve(createEmptyImportMap())
      ))
    );
  },
  getCurrentPageMap() {
    return Promise.all([
      imo.getDefaultMap(),
      imo.getExternalOverrideMap(imo.getCurrentPageExternalOverrides()),
    ]).then(([defaultMap, externalOverridesMap]) => {
      return imo.mergeImportMap(
        imo.mergeImportMap(defaultMap, externalOverridesMap),
        initialOverrideMap
      );
    });
  },
  getCurrentPageExternalOverrides() {
    const currentPageExternalOverrides = [];
    document
      .querySelectorAll(
        `[${overrideAttribute}]:not([id="import-map-overrides"])`
      )
      .forEach((externalOverrideEl) => {
        currentPageExternalOverrides.push(externalOverrideEl.src);
      });
    return currentPageExternalOverrides;
  },
  getNextPageMap() {
    return Promise.all([
      imo.getDefaultMap(),
      imo.getExternalOverrideMap(),
    ]).then(([defaultMap, externalOverridesMap]) => {
      return imo.mergeImportMap(
        imo.mergeImportMap(defaultMap, externalOverridesMap),
        imo.getOverrideMap()
      );
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
  getExternalOverrides() {
    let localStorageValue = localStorage.getItem(
      externalOverridesLocalStorageKey
    );
    return localStorageValue ? JSON.parse(localStorageValue).sort() : [];
  },
  addExternalOverride(url) {
    url = new URL(url, document.baseURI).href;
    const overrides = imo.getExternalOverrides();
    if (overrides.includes(url)) {
      return false;
    } else {
      localStorage.setItem(
        externalOverridesLocalStorageKey,
        JSON.stringify(overrides.concat(url))
      );
      fireChangedEvent();
      return true;
    }
  },
  removeExternalOverride(url) {
    const overrides = imo.getExternalOverrides();
    if (overrides.includes(url)) {
      localStorage.setItem(
        externalOverridesLocalStorageKey,
        JSON.stringify(overrides.filter((override) => override !== url))
      );
      fireChangedEvent();
      return true;
    } else {
      return false;
    }
  },
  getExternalOverrideMap(externalOverrides = imo.getExternalOverrides()) {
    return externalOverrides.reduce((result, externalOverride) => {
      const fetchPromise =
        externalOverrideMapPromises[externalOverride] ||
        (externalOverrideMapPromises[externalOverride] = fetchExternalMap(
          externalOverride
        ));
      return Promise.all([result, fetchPromise]).then(
        ([firstMap, secondMap]) => {
          return imo.mergeImportMap(firstMap, secondMap);
        }
      );
    }, Promise.resolve(createEmptyImportMap()));
  },
  isExternalMapValid(importMapUrl) {
    const promise =
      externalOverrideMapPromises[importMapUrl] ||
      (externalOverrideMapPromises[importMapUrl] = fetchExternalMap(
        importMapUrl
      ));
    return promise.then(() => invalidExternalMaps.includes(importMapUrl));
  },
  invalidExternalMaps: [],
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

const initialOverrideMap = imo.getOverrideMap();
const initialExternalOverrideMaps = imo.getExternalOverrides();

const overridableImportMap = document.querySelector(
  'script[type="overridable-importmap"]'
);

let referenceNode = overridableImportMap;

if (!referenceNode) {
  const importMaps = document.querySelectorAll(
    `script[type="${importMapType}"]`
  );
  referenceNode = importMaps ? importMaps[importMaps.length - 1] : null;
}

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

  referenceNode = insertOverrideMap(
    imo.mergeImportMap(originalMap, initialOverrideMap),
    `import-map-overrides`,
    referenceNode
  );

  if (initialExternalOverrideMaps.length > 0) {
    initialExternalOverrideMaps.forEach((mapUrl, index) => {
      referenceNode = insertOverrideMap(
        mapUrl,
        `import-map-overrides-external-${index}`
      );
    });
  }
} else {
  if (Object.keys(overrideMap.imports).length > 0) {
    referenceNode = insertOverrideMap(
      overrideMap,
      `import-map-overrides`,
      referenceNode
    );
  }
}

function insertOverrideMap(map, id, referenceNode) {
  const overrideMapElement = document.createElement("script");
  overrideMapElement.type = importMapType;
  overrideMapElement.id = id; // for debugging and for UI to identify this import map as special
  overrideMapElement.setAttribute(overrideAttribute, "");
  if (typeof map === "string") {
    overrideMapElement.src = map;
  } else {
    overrideMapElement.textContent = JSON.stringify(map, null, 2);
  }

  if (referenceNode) {
    referenceNode.insertAdjacentElement("afterend", overrideMapElement);
  } else {
    document.head.appendChild(overrideMapElement);
  }

  return overrideMapElement;
}

function fetchExternalMap(url) {
  return fetch(url).then(
    (r) => {
      if (r.ok) {
        return r.json().catch((err) => {
          console.warn(
            Error(
              `External override import map contained invalid json, at url ${r.url}. ${err}`
            )
          );
          imo.invalidExternalMaps.push(r.url);
          return createEmptyImportMap();
        });
      } else {
        console.warn(
          Error(
            `Unable to download external override import map from url ${r.url}. Server responded with status ${r.status}`
          )
        );
        imo.invalidExternalMaps.push(r.url);
        return createEmptyImportMap();
      }
    },
    () => {
      console.warn(
        Error(`Unable to download external import map at url '${url}'`)
      );
      imo.invalidExternalMaps.push(new URL(url, document.baseURI).href);
      return createEmptyImportMap();
    }
  );
}

function createEmptyImportMap() {
  return { imports: {}, scopes: {} };
}
