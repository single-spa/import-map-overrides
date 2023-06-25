import { escapeStringRegexp } from "../util/string-regex";
import { includes } from "../util/includes.js";
import { getParameterByName } from "../util/url-parameter";

const localStoragePrefix = "import-map-override:";
const disabledOverridesLocalStorageKey = "import-map-overrides-disabled";
const externalOverridesLocalStorageKey = "import-map-overrides-external-maps";
const overrideAttribute = "data-is-importmap-override";
const domainsMeta = "import-map-overrides-domains";
const allowListPrefix = "allowlist:";
const denyListPrefix = "denylist:";
export const queryParamOverridesName = "imo";

const importMapMetaElement = document.querySelector(
  'meta[name="importmap-type"]'
);

const domainsElement = document.querySelector(`meta[name="${domainsMeta}"]`);

const externalOverrideMapPromises = {};

export const importMapType = importMapMetaElement
  ? importMapMetaElement.getAttribute("content")
  : "importmap";

export let isDisabled;

if (domainsElement) {
  const content = domainsElement.getAttribute("content");
  if (!content) {
    console.warn(`Invalid ${domainsMeta} meta element - content required.`);
  }

  const matchHostname = (domain) =>
    new RegExp(escapeStringRegexp(domain).replace("\\*", ".+")).test(
      window.location.hostname
    );

  if (content.indexOf(allowListPrefix) === 0) {
    const allowedDomains = content.slice(allowListPrefix.length).split(",");
    isDisabled = !allowedDomains.some(matchHostname);
  } else if (content.indexOf(denyListPrefix) === 0) {
    const deniedDomains = content.slice(denyListPrefix.length).split(",");
    isDisabled = deniedDomains.some(matchHostname);
  } else {
    // eslint-disable-next-line no-console
    console.log(
      `Invalid ${domainsMeta} meta content attribute - must start with ${allowListPrefix} or ${denyListPrefix}`
    );
  }
} else {
  isDisabled = false;
}

if (!canAccessLocalStorage()) {
  console.warn(
    "Disabling import-map-overrides, since local storage is not readable"
  );
  isDisabled = true;
}

if (!isDisabled) {
  init();
}

function init() {
  const serverOverrides = importMapMetaElement
    ? importMapMetaElement.hasAttribute("server-cookie")
    : false;
  const serverOnly = importMapMetaElement
    ? importMapMetaElement.hasAttribute("server-only")
    : false;

  let defaultMapPromise;

  window.importMapOverrides = {
    addOverride(moduleName, url) {
      const portRegex = /^\d+$/g;
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

      const setOverride = (moduleName, path) => {
        if (includeDisabled || !(disabledOverrides.indexOf(moduleName) >= 0)) {
          overrides.imports[moduleName] = path;
        }
      };

      // get from localstorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.indexOf(localStoragePrefix) === 0) {
          setOverride(
            key.slice(localStoragePrefix.length),
            localStorage.getItem(key)
          );
        }
      }

      // get from url if query param exist
      const queryParam = getParameterByName(
        queryParamOverridesName,
        window.location != window.parent.location
          ? document.referrer
          : window.location.href
      );

      if (queryParam) {
        let queryParamImportMap;
        try {
          queryParamImportMap = JSON.parse(queryParam);
        } catch (e) {
          throw Error(
            `Invalid importMap query param - text content must be json`
          );
        }
        Object.keys(queryParamImportMap.imports).forEach((moduleName) => {
          setOverride(moduleName, queryParamImportMap.imports[moduleName]);
        });
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

              return Promise.all([promise, nextPromise]).then(
                ([originalMap, newMap]) =>
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
      if (!includes(disabledOverrides, moduleName)) {
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
      return includes(imo.getDisabledOverrides(), moduleName);
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
      if (includes(overrides, url)) {
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
      if (includes(overrides, url)) {
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
          (externalOverrideMapPromises[externalOverride] =
            fetchExternalMap(externalOverride));
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
        (externalOverrideMapPromises[importMapUrl] =
          fetchExternalMap(importMapUrl));
      return promise.then(() =>
        includes(imo.invalidExternalMaps, importMapUrl)
      );
    },
    invalidExternalMaps: [],
  };

  const imo = window.importMapOverrides;

  let canFireCustomEvents = true;
  try {
    if (CustomEvent) {
      new CustomEvent("a");
    } else {
      canFireCustomEvents = false;
    }
  } catch (err) {
    canFireCustomEvents = false;
  }

  function fireChangedEvent() {
    fireEvent("change");
  }

  function fireEvent(type) {
    // Set timeout so that event fires after the change has totally finished
    setTimeout(() => {
      const eventType = `import-map-overrides:${type}`;
      const event = canFireCustomEvents
        ? new CustomEvent(eventType)
        : document.createEvent("CustomEvent");
      if (!canFireCustomEvents) {
        event.initCustomEvent(eventType, true, true, null);
      }
      window.dispatchEvent(event);
    });
  }

  const initialOverrideMap = imo.getOverrideMap();
  const initialExternalOverrideMaps = imo.getExternalOverrides();

  let referenceNode;

  if (!serverOnly) {
    const overridableImportMap = document.querySelector(
      'script[type="overridable-importmap"]'
    );

    referenceNode = overridableImportMap;

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
      insertAllExternalOverrideMaps();
    } else {
      insertAllExternalOverrideMaps();
      if (Object.keys(initialOverrideMap.imports).length > 0) {
        referenceNode = insertOverrideMap(
          initialOverrideMap,
          `import-map-overrides`,
          referenceNode
        );
      }
    }
  }

  fireEvent("init");

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

  function insertAllExternalOverrideMaps() {
    if (initialExternalOverrideMaps.length > 0) {
      initialExternalOverrideMaps.forEach((mapUrl, index) => {
        referenceNode = insertOverrideMap(
          mapUrl,
          `import-map-overrides-external-${index}`
        );
      });
    }
  }
}

function canAccessLocalStorage() {
  try {
    localStorage.getItem("test");
    return true;
  } catch {
    return false;
  }
}
