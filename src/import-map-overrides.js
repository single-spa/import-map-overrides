const localStoragePrefix = 'import-map-override:'

window.importMapOverrides = {
  addOverride: function addOverride(moduleName, url) {
    const key = localStoragePrefix + moduleName
    localStorage.setItem(key, url)
    document.cookie = `${key}=${url};`
  },
  getOverrideMap: function getOverrideMap() {
    const overrides = {imports: {}}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(localStoragePrefix)) {
        overrides.imports[key.slice(localStoragePrefix.length)] = localStorage.getItem(key)
      }
    }

    return overrides
  },
}

const overrideMap = window.importMapOverrides.getOverrideMap()

if (Object.keys(overrideMap.imports).length > 0) {
  const importMapMetaElement = document.querySelector('meta[name="importmap-type"]')
  const scriptType = importMapMetaElement && importMapMetaElement.getAttribute('content') || 'import-map'
  const overrideMapElement = document.createElement('script')
  overrideMapElement.type = scriptType
  overrideMapElement.innerHTML = JSON.stringify(overrideMap)

  const importMaps = document.querySelectorAll(`script[type="${scriptType}"]`)
  if (importMaps.length > 0) {
    importMaps[importMaps.length - 1].insertAdjacentElement('afterend', overrideMapElement)
  } else {
    document.head.appendChild(overrideMapElement)
  }
}