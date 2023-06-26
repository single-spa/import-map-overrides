const removeMin = (url) => url.replace(".min.js", ".js");

export const devLibs = {
  react: (url) => url.replace("production.min", "development"),
  "react-dom": (url) => url.replace("production.min", "development"),
  "single-spa": (url) => url.replace("single-spa.min.js", "single-spa.dev.js"),
  vue: removeMin,
  "vue-router": removeMin,
  "@angular/core": removeMin,
  "@angular/common": removeMin,
  "@angular/router": removeMin,
  "@angular/platform-browser": removeMin,
};

export function overridesBesidesDevLibs() {
  return (
    Object.keys(window.importMapOverrides.getOverrideMap().imports).filter(
      (k) => !devLibs[k]
    ).length > 0
  );
}
