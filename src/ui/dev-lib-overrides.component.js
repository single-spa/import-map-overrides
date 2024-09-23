import { h, Component } from "preact";

export default class DevLibOverrides extends Component {
  componentDidMount() {
    window.importMapOverrides.getCurrentPageMap().then(addDevLibOverrides);
  }
  render() {
    return null;
  }
}

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

function addDevLibOverrides(notOverriddenMap) {
  Object.keys(notOverriddenMap.imports)
    .filter((libName) => devLibs[libName])
    .forEach((libName) => {
      window.importMapOverrides.addOverride(
        libName,
        devLibs[libName](notOverriddenMap.imports[libName]),
      );
    });
}

export function overridesBesidesDevLibs() {
  return (
    Object.keys(window.importMapOverrides.getOverrideMap().imports).filter(
      (k) => !devLibs[k],
    ).length > 0
  );
}
