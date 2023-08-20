import { h } from "preact";
import { useEffect } from "preact/hooks";
import { devLibs } from "../../util/dev-libs";

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

export default function DevLibOverrides() {
  useEffect(() => {
    window.importMapOverrides.getCurrentPageMap().then(addDevLibOverrides);
  }, []);

  return null;
}
