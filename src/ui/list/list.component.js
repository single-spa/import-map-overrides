import { h, Component } from "preact";
import { importMapType } from "../../api/js-api";
import ModuleDialog from "./module-dialog.component";

export default class List extends Component {
  state = {
    finalImportMap: { imports: {} },
    dialogModule: null
  };
  componentDidMount() {
    const finalMapPromise = Array.prototype.reduce.call(
      document.querySelectorAll(`script[type="${importMapType}"]`),
      (promise, scriptEl) => {
        if (scriptEl.id === "import-map-overrides") {
          return promise;
        } else {
          let nextPromise;
          if (scriptEl.src) {
            nextPromise = fetch(scriptEl.src).then(resp => resp.json());
          } else {
            nextPromise = Promise.resolve(JSON.parse(scriptEl.textContent));
          }

          return Promise.all([promise, nextPromise]).then(
            ([originalMap, newMap]) => mergeImportMap(originalMap, newMap)
          );
        }
      },
      Promise.resolve(this.state.finalImportMap)
    );

    finalMapPromise.then(finalImportMap => {
      this.setState({ finalImportMap });
    });
  }
  render() {
    const overriddenModules = [],
      defaultModules = [];

    const overrideMap = window.importMapOverrides.getOverrideMap().imports;

    Object.keys(this.state.finalImportMap.imports).forEach(moduleName => {
      const mod = {
        moduleName,
        defaultUrl: this.state.finalImportMap.imports[moduleName],
        overrideUrl: overrideMap[moduleName]
      };
      if (overrideMap[moduleName]) {
        overriddenModules.push(mod);
      } else {
        defaultModules.push(mod);
      }
    });

    Object.keys(overrideMap).forEach(overrideKey => {
      if (!overriddenModules.some(m => m.moduleName === overrideKey)) {
        overriddenModules.push({
          moduleName: overrideKey,
          defaultUrl: null,
          overrideUrl: overrideMap[overrideKey]
        });
      }
    });

    overriddenModules.sort(sorter);
    defaultModules.sort(sorter);

    return (
      <div className="imo-list-container">
        <div>
          <h3>Overridden Modules</h3>
          <div className="imo-list">
            {overriddenModules.length === 0 && (
              <div>(No overridden modules)</div>
            )}
            {overriddenModules.map(mod => (
              <div>
                <button
                  className="imo-overridden"
                  onClick={() => this.setState({ dialogModule: mod })}
                >
                  {mod.moduleName}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>Default Modules</h3>
          <div className="imo-list">
            {defaultModules.length === 0 && <div>(No default modules)</div>}
            {defaultModules.map(mod => (
              <div>
                <button
                  className="imo-default"
                  onClick={() => this.setState({ dialogModule: mod })}
                >
                  {mod.moduleName}
                </button>
              </div>
            ))}
          </div>
        </div>
        {this.state.dialogModule && (
          <ModuleDialog
            module={this.state.dialogModule}
            cancel={this.cancel}
            updateModuleUrl={this.updateModuleUrl}
          />
        )}
      </div>
    );
  }

  cancel = () => {
    this.setState({ dialogModule: null });
  };

  updateModuleUrl = newUrl => {
    newUrl = newUrl || null;

    if (newUrl === null) {
      window.importMapOverrides.removeOverride(
        this.state.dialogModule.moduleName
      );
    } else {
      window.importMapOverrides.addOverride(
        this.state.dialogModule.moduleName,
        newUrl
      );
    }

    this.setState(
      prevState => ({
        dialogModule: null,
        finalImportMap: {
          imports: {
            ...prevState.finalImportMap.imports,
            [this.state.dialogModule.moduleName]: newUrl
          }
        }
      }),
      () => {
        if (this.props.importMapChanged) {
          this.props.importMapChanged();
        }
      }
    );
  };
}

function mergeImportMap(originalMap, newMap) {
  for (let i in newMap.imports) {
    originalMap.imports[i] = newMap.imports[i];
  }
  for (let i in newMap.scopes) {
    originalMap.scopes[i] = newMap.scopes[i];
  }
  return originalMap;
}

function sorter(first, second) {
  return first.moduleName > second.moduleName;
}
