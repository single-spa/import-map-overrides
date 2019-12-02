import { h, Component } from "preact";
import { getDefaultMap } from "./list/list.component";

export default class DevLibOverrides extends Component {
  componentDidMount() {
    getDefaultMap().then(addDevLibOverrides);
  }
  render() {
    return null;
  }
}

const devLibs = {
  react: url => url.replace("production.min", "development"),
  "react-dom": url => url.replace("production.min", "development")
};

function addDevLibOverrides(notOverriddenMap) {
  Object.keys(notOverriddenMap.imports)
    .filter(libName => devLibs[libName])
    .forEach(libName => {
      window.importMapOverrides.addOverride(
        libName,
        devLibs[libName](notOverriddenMap.imports[libName])
      );
    });
}

export function overridesBesidesDevLibs() {
  return (
    Object.keys(window.importMapOverrides.getOverrideMap().imports).filter(
      k => !devLibs[k]
    ).length > 0
  );
}
