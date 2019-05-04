const localStoragePrefix = 'import-map-override:'

window.importMapOverrides = {
  addOverride(moduleName, url) {
    const key = localStoragePrefix + moduleName
    localStorage.setItem(key, url)
    return window.importMapOverrides.getOverrideMap()
  },
  getOverrideMap() {
    const overrides = {imports: {}}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(localStoragePrefix)) {
        overrides.imports[key.slice(localStoragePrefix.length)] = localStorage.getItem(key)
      }
    }

    return overrides
  },
  removeOverride(moduleName) {
    const key = localStoragePrefix + moduleName
    const hasItem = localStorage.getItem(key) !== null
    localStorage.removeItem(key)
    return hasItem
  },
  resetOverrides() {
    Object.keys(window.importMapOverrides.getOverrideMap().imports).map(moduleName => {
      window.importMapOverrides.removeOverride(moduleName)
    })
    return window.importMapOverrides.getOverrideMap()
  },
}

const overrideMap = window.importMapOverrides.getOverrideMap()

if (Object.keys(overrideMap.imports).length > 0) {
  const importMapMetaElement = document.querySelector('meta[name="importmap-type"]')
  const scriptType = importMapMetaElement ? importMapMetaElement.getAttribute('content') : 'import-map'
  const overrideMapElement = document.createElement('script')
  overrideMapElement.type = scriptType
  overrideMapElement.id = 'import-map-overrides' // just for debugging -- easier to find in html with an ID
  overrideMapElement.innerHTML = JSON.stringify(overrideMap)

  const importMaps = document.querySelectorAll(`script[type="${scriptType}"]`)
  if (importMaps.length > 0) {
    importMaps[importMaps.length - 1].insertAdjacentElement('afterend', overrideMapElement)
  } else {
    document.head.appendChild(overrideMapElement)
  }
}