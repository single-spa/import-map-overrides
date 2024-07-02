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

const allowedMapTypes = ["importmap", "systemjs-importmap", "importmap-shim"];

const validateType = (type) => {
  if (allowedMapTypes.indexOf(type) === -1) {
    throw Error(
      `Invalid import map type '${type}'. Must be one of ${allowedMapTypes.join(
        ", "
      )}`
    );
  }
};

const getLocalStorageModuleKey = (type, moduleName) => {
  return `${localStoragePrefix}${type}:${moduleName}`;
};

const getExternalOverridesKey = (type) => {
  return `${externalOverridesLocalStorageKey}:${type}`;
};

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
  // server only not supported
  const serverOnly = importMapMetaElement
    ? importMapMetaElement.hasAttribute("server-only")
    : false;

  let defaultMapPromise;

  window.importMapOverrides = {
    addOverride(moduleName, url, type = "importmap") {
      validateType(type);
      const portRegex = /^\d+$/g;
      if (portRegex.test(url)) {
        url = imo.getUrlFromPort(moduleName, url);
      }
      const key = getLocalStorageModuleKey(type, moduleName);
      localStorage.setItem(key, url);
      if (serverOverrides) {
        document.cookie = `${key}=${url}`;
      }
      fireChangedEvent();
      return imo.getOverrideMap(type);
    },
    getOverrideMap(includeDisabled = false) {
      const overrides = allowedMapTypes.reduce((acc, type) => {
        acc[type] = createEmptyImportMap();
        return acc;
      }, {});
      const disabledOverrides = allowedMapTypes.reduce((acc, type) => {
        acc[type] = imo.getDisabledOverrides(type);
        return acc;
      }, {});

      const setOverride = (moduleName, path, type) => {
        if (
          includeDisabled ||
          !(disabledOverrides[type].indexOf(moduleName) >= 0)
        ) {
          overrides[type].imports[moduleName] = path;
        }
      };

      // get from localstorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        allowedMapTypes.forEach((type) => {
          const keyType = `${localStoragePrefix}${type}`;
          if (key.indexOf(`${keyType}:`) === 0) {
            setOverride(key.split(":")[2], localStorage.getItem(key), type);
          }
        });
      }

      // get from url if query param exist
      const queryParam = getParameterByName(
        queryParamOverridesName,
        window.location != window.parent.location
          ? document.referrer
          : window.location.href
      );

      // todo - will not work
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
    removeOverride(moduleName, type) {
      const key = getLocalStorageModuleKey(type, moduleName);
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
      allowedMapTypes.forEach((type) => {
        Object.keys(imo.getOverrideMap(true)[type].imports).forEach(
          (moduleName) => {
            imo.removeOverride(moduleName, type);
          }
        );
        localStorage.removeItem(`${disabledOverridesLocalStorageKey}:${type}`);
        localStorage.removeItem(getExternalOverridesKey(type));
      });
      fireChangedEvent();
      return imo.getOverrideMap();
    },
    hasOverrides() {
      return allowedMapTypes.some(
        (type) => Object.keys(imo.getOverrideMap(true)[type].imports).length > 0
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
    // will not work
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
    // will not work
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
    disableOverride(moduleName, type) {
      const disabledOverrides = imo.getDisabledOverrides(type);
      if (!includes(disabledOverrides, moduleName)) {
        localStorage.setItem(
          `${disabledOverridesLocalStorageKey}:${type}`,
          JSON.stringify(disabledOverrides.concat(moduleName))
        );
        fireChangedEvent();
        return true;
      } else {
        return false;
      }
    },
    enableOverride(moduleName, type) {
      const disabledOverrides = imo.getDisabledOverrides(type);
      const index = disabledOverrides.indexOf(moduleName);
      if (index >= 0) {
        disabledOverrides.splice(index, 1);
        localStorage.setItem(
          `${disabledOverridesLocalStorageKey}:${type}`,
          JSON.stringify(disabledOverrides)
        );
        fireChangedEvent();
        return true;
      } else {
        return false;
      }
    },
    getDisabledOverrides(type) {
      const disabledOverrides = localStorage.getItem(
        `${disabledOverridesLocalStorageKey}:${type}`
      );
      return disabledOverrides ? JSON.parse(disabledOverrides) : [];
    },
    isDisabled(moduleName, type) {
      return includes(imo.getDisabledOverrides(type), moduleName);
    },
    getExternalOverrides(type) {
      let localStorageValue = localStorage.getItem(
        getExternalOverridesKey(type)
      );
      return localStorageValue ? JSON.parse(localStorageValue).sort() : [];
    },
    addExternalOverride(url, type) {
      url = new URL(url, document.baseURI).href;
      const overrides = imo.getExternalOverrides(type);
      if (includes(overrides, url)) {
        return false;
      } else {
        localStorage.setItem(
          getExternalOverridesKey(type),
          JSON.stringify(overrides.concat(url))
        );
        fireChangedEvent();
        return true;
      }
    },
    removeExternalOverride(url, type) {
      const overrides = imo.getExternalOverrides(type);
      if (includes(overrides, url)) {
        localStorage.setItem(
          getExternalOverridesKey(type),
          JSON.stringify(overrides.filter((override) => override !== url))
        );
        fireChangedEvent();
        return true;
      } else {
        return false;
      }
    },
    // will not work
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
      return promise.then(
        () => !includes(imo.invalidExternalMaps, importMapUrl)
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

  const initialOverrideMap = imo.getOverrideMap(true);
  // const initialExternalOverrideMaps = imo.getExternalOverrides();

  let referenceNode;

  if (!serverOnly) {
    const overridableImportMap = document.querySelector(
      'script[type="overridable-importmap"]'
    );

    referenceNode = overridableImportMap;

    if (!referenceNode) {
      let importMaps = [];
      allowedMapTypes.forEach((type) => {
        importMaps = [
          ...importMaps,
          ...document.querySelectorAll(`script[type="${type}"]`),
        ];
      });
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
        imo.mergeImportMap(originalMap, initialOverrideMap["importmap"]),
        `import-map-overrides`,
        referenceNode,
        "importmap"
      );
    }
    insertAllExternalOverrideMaps();
    ["systemjs-importmap", "importmap-shim"].forEach((type) => {
      if (Object.keys(initialOverrideMap[type].imports).length > 0) {
        referenceNode = document.querySelector(`script[type="${type}"]`);
        insertOverrideMap(
          initialOverrideMap[type],
          `import-map-overrides`,
          referenceNode,
          type
        );
      }
    });
  }

  fireEvent("init");

  function insertOverrideMap(map, id, referenceNode, type) {
    const overrideMapElement = document.createElement("script");
    overrideMapElement.type = type;
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
    return fetch(url)
      .then(
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
      )
      .then((importMap) => expandRelativeUrlsInImportMap(importMap, url));
  }

  function createEmptyImportMap() {
    return { imports: {}, scopes: {} };
  }

  // will not work
  function insertAllExternalOverrideMaps() {
    // if (initialExternalOverrideMaps.length > 0) {
    //   initialExternalOverrideMaps.forEach((mapUrl, index) => {
    //     referenceNode = insertOverrideMap(
    //       mapUrl,
    //       `import-map-overrides-external-${index}`
    //     );
    //   });
    // }
  }
}

function expandRelativeUrl(url, baseUrl) {
  try {
    const outUrl = new URL(url, baseUrl);
    return outUrl.href;
  } catch (err) {
    return url;
  }
}

function expandRelativeUrlImports(imports, baseUrl) {
  return Object.entries(imports).reduce((result, [key, value]) => {
    result[key] = expandRelativeUrl(value, baseUrl);
    return result;
  }, {});
}

function expandRelativeUrlsInImportMap(importMap, baseUrl) {
  return {
    imports: expandRelativeUrlImports(importMap.imports || {}, baseUrl),
    scopes: Object.keys(importMap.scopes || {}).reduce((result, scopeKey) => {
      result[scopeKey] = expandRelativeUrlImports(
        importMap.scopes[scopeKey],
        baseUrl
      );
      return result;
    }, {}),
  };
}

function canAccessLocalStorage() {
  try {
    localStorage.getItem("test");
    return true;
  } catch {
    return false;
  }
}
