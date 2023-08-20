import { h, createContext } from "preact";
import { useEffect, useState } from "preact/hooks";
import { devLibs } from "../../util/dev-libs";
import { includes } from "../../util/includes";

const ImportMapOverridesContext = createContext({
  overriddenModules: [],
  nextOverriddenModules: [],
  disabledOverrides: [],
  defaultModules: [],
  externalOverrideModules: [],
  pendingRefreshDefaultModules: [],
  devLibModules: [],
});

function ImportMapOverridesContextProvider({ children }) {
  const [maps, setMaps] = useState({
    currentPageMap: null,
    nextPageMap: null,
    notOverriddenMap: null,
  });
  const [contextValue, setContextValue] = useState({
    overriddenModules: [],
    nextOverriddenModules: [],
    disabledOverrides: [],
    defaultModules: [],
    externalOverrideModules: [],
    pendingRefreshDefaultModules: [],
    devLibModules: [],
    hasPendingModulesToRefresh: false,
    hasOverriddenModules: false,
  });

  function refreshContext() {
    const { currentPageMap, nextPageMap, notOverriddenMap } = maps;

    if (!currentPageMap || !nextPageMap || !notOverriddenMap) {
      return;
    }

    const defaultModules = [],
      devLibModules = [],
      disabledOverrides = [],
      externalOverrideModules = [],
      nextOverriddenModules = [],
      pendingRefreshDefaultModules = [],
      overriddenModules = [];

    const overrideMap = window.importMapOverrides.getOverrideMap(true).imports;
    const notOverriddenKeys = Object.keys(notOverriddenMap.imports);
    const disabledModules = window.importMapOverrides.getDisabledOverrides();

    notOverriddenKeys.forEach((moduleName) => {
      const mod = {
        moduleName,
        defaultUrl: notOverriddenMap.imports[moduleName],
        overrideUrl: overrideMap[moduleName],
        disabled: includes(disabledModules, moduleName),
      };
      if (mod.disabled) {
        disabledOverrides.push(mod);
      } else if (overrideMap[moduleName]) {
        if (currentPageMap.imports[moduleName] === overrideMap[moduleName]) {
          if (
            devLibs[moduleName] &&
            devLibs[moduleName](currentPageMap.imports[moduleName]) ===
              overrideMap[moduleName]
          ) {
            devLibModules.push(mod);
          } else {
            overriddenModules.push(mod);
          }
        } else {
          nextOverriddenModules.push(mod);
        }
      } else if (
        notOverriddenMap.imports[moduleName] ===
        currentPageMap.imports[moduleName]
      ) {
        defaultModules.push(mod);
      } else if (
        notOverriddenMap.imports[moduleName] === nextPageMap.imports[moduleName]
      ) {
        pendingRefreshDefaultModules.push(mod);
      } else {
        externalOverrideModules.push({
          ...mod,
          overrideUrl: currentPageMap.imports[moduleName],
        });
      }
    });

    Object.keys(overrideMap).forEach((moduleName) => {
      if (!includes(notOverriddenKeys, moduleName)) {
        const mod = {
          moduleName,
          defaultUrl: null,
          overrideUrl: overrideMap[moduleName],
          disabled: includes(disabledModules, moduleName),
        };

        if (mod.disabled) {
          disabledOverrides.push(mod);
        } else if (
          currentPageMap.imports[moduleName] === overrideMap[moduleName]
        ) {
          overriddenModules.push(mod);
        } else {
          nextOverriddenModules.push(mod);
        }
      }
    });

    function sorter(first, second) {
      return first.moduleName > second.moduleName;
    }

    defaultModules.sort(sorter);
    nextOverriddenModules.sort(sorter);
    overriddenModules.sort(sorter);

    setContextValue({
      defaultModules,
      devLibModules,
      disabledOverrides,
      externalOverrideModules,
      nextOverriddenModules,
      overriddenModules,
      pendingRefreshDefaultModules,
      hasPendingModulesToRefresh:
        nextOverriddenModules.length > 0 ||
        pendingRefreshDefaultModules.length > 0,
      hasOverriddenModules: overriddenModules.length > 0,
    });
  }

  function updateNextPageMap() {
    window.importMapOverrides.getNextPageMap().then((map) => {
      setMaps((prevMaps) => ({ ...prevMaps, nextPageMap: map }));
    });
  }

  useEffect(() => {
    const promises = [
      window.importMapOverrides.getDefaultMap(),
      window.importMapOverrides.getCurrentPageMap(),
      window.importMapOverrides.getNextPageMap(),
    ];

    Promise.all(promises).then((maps) => {
      setMaps({
        notOverriddenMap: maps[0],
        currentPageMap: maps[1],
        nextPageMap: maps[2],
      });
    });

    window.addEventListener("import-map-overrides:change", updateNextPageMap);

    return () => {
      window.removeEventListener(
        "import-map-overrides:change",
        updateNextPageMap
      );
    };
  }, []);

  useEffect(refreshContext, [maps]);

  return (
    <ImportMapOverridesContext.Provider value={contextValue}>
      {children}
    </ImportMapOverridesContext.Provider>
  );
}

export default ImportMapOverridesContextProvider;

export { ImportMapOverridesContext };
