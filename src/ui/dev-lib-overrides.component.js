import { h, Component } from "preact";

export default class DevLibOverrides extends Component {
  componentDidMount() {
    window.importMapOverrides.getDefaultMap().then(addDevLibOverrides);
  }
  render() {
    return null;
  }
}

const devLibs = {
  react: (url) => url.replace("production.min", "development"),
  "react-dom": (url) => url.replace("production.min", "development"),
  "single-spa": (url) => url.replace("single-spa.min.js", "single-spa.dev.js"),
};

function addDevLibOverrides(notOverriddenMap) {
  Object.keys(notOverriddenMap.imports)
    .filter((libName) => devLibs[libName])
    .forEach((libName) => {
      window.importMapOverrides.addOverride(
        libName,
        devLibs[libName](notOverriddenMap.imports[libName])
      );
    });
}

export function overridesBesidesDevLibs() {
  return (
    Object.keys(window.importMapOverrides.getOverrideMap().imports).filter(
      (k) => !devLibs[k]
    ).length > 0
  );
}
