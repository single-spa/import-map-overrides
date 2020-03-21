import { h, Component, render } from "preact";
import { importMapType } from "../../api/js-api";
import ModuleDialog from "./module-dialog.component";

export default class List extends Component {
  state = {
    notOverriddenMap: { imports: {} },
    currentPageMap: { imports: {} },
    dialogModule: null,
    searchVal: ""
  };
  componentDidMount() {
    window.importMapOverrides.getDefaultMap().then(notOverriddenMap => {
      this.setState({ notOverriddenMap });
    });
    window.importMapOverrides.getCurrentPageMap().then(currentPageMap => {
      this.setState({ currentPageMap });
    });
    window.addEventListener("import-map-overrides:change", this.doUpdate);
    this.inputRef.focus();
  }
  componentWillUnmount() {
    window.removeEventListener("import-map-overrides:change", this.doUpdate);
  }
  componentDidUpdate(prevProps, prevState) {
    if (!prevState.dialogModule && this.state.dialogModule) {
      this.dialogContainer = document.createElement("div");
      document.body.appendChild(this.dialogContainer);
      render(
        <ModuleDialog
          module={this.state.dialogModule}
          cancel={this.cancel}
          updateModuleUrl={this.updateModuleUrl}
          addNewModule={this.addNewModule}
        />,
        this.dialogContainer
      );
    } else if (prevState.dialogModule && !this.state.dialogModule) {
      render(null, this.dialogContainer);
      this.dialogContainer.remove();
      delete this.dialogContainer;
    }
  }
  render() {
    const overriddenModules = [],
      nextOverriddenModules = [],
      disabledOverrides = [],
      defaultModules = [];

    const overrideMap = window.importMapOverrides.getOverrideMap(true).imports;

    const notOverriddenKeys = Object.keys(this.state.notOverriddenMap.imports);

    const disabledModules = window.importMapOverrides.getDisabledOverrides();

    notOverriddenKeys.filter(this.filterModuleNames).forEach(moduleName => {
      const mod = {
        moduleName,
        defaultUrl: this.state.notOverriddenMap.imports[moduleName],
        overrideUrl: overrideMap[moduleName],
        disabled: disabledModules.includes(moduleName)
      };
      if (mod.disabled) {
        disabledOverrides.push(mod);
      } else if (overrideMap[moduleName]) {
        if (
          this.state.currentPageMap.imports[moduleName] ===
          overrideMap[moduleName]
        ) {
          overriddenModules.push(mod);
        } else {
          nextOverriddenModules.push(mod);
        }
      } else {
        defaultModules.push(mod);
      }
    });

    Object.keys(overrideMap)
      .filter(this.filterModuleNames)
      .forEach(moduleName => {
        if (!notOverriddenKeys.includes(moduleName)) {
          const mod = {
            moduleName,
            defaultUrl: null,
            overrideUrl: overrideMap[moduleName],
            disabled: disabledModules.includes(moduleName)
          };

          if (mod.disabled) {
            disabledOverrides.push(mod);
          } else if (
            this.state.currentPageMap.imports[moduleName] ===
            overrideMap[moduleName]
          ) {
            overriddenModules.push(mod);
          } else {
            nextOverriddenModules.push(mod);
          }
        }
      });

    overriddenModules.sort(sorter);
    defaultModules.sort(sorter);
    nextOverriddenModules.sort(sorter);

    return (
      <div className="imo-list-container">
        <div className="imo-table-header-actions">
          <input
            className="imo-list-search"
            aria-label="Search modules"
            placeholder="Search modules"
            value={this.state.searchVal}
            onInput={evt => this.setState({ searchVal: evt.target.value })}
            ref={ref => (this.inputRef = ref)}
          />
          <div className="imo-add-new">
            <button
              onClick={() =>
                this.setState({
                  dialogModule: { moduleName: "New module", isNew: true }
                })
              }
            >
              Add new module
            </button>
          </div>
          <div className="imo-add-new">
            <button onClick={() => window.importMapOverrides.resetOverrides()}>
              Reset all overrides
            </button>
          </div>
        </div>
        <table className="imo-overrides-table">
          <thead>
            <tr>
              <th>Module Status</th>
              <th>Module Name</th>
              <th>Domain</th>
              <th>Filename</th>
            </tr>
          </thead>
          <tbody>
            {nextOverriddenModules.map(mod => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
              >
                <td>
                  <div className="imo-status imo-next-override" />
                  <div>Pending refresh</div>
                </td>
                <td>{mod.moduleName}</td>
                <td>{toDomain(mod)}</td>
                <td>{toFileName(mod)}</td>
              </tr>
            ))}
            {disabledOverrides.map(mod => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
              >
                <td>
                  <div className="imo-status imo-disabled-override" />
                  <div>Override disabled</div>
                </td>
                <td>{mod.moduleName}</td>
                <td>{toDomain(mod)}</td>
                <td>{toFileName(mod)}</td>
              </tr>
            ))}
            {overriddenModules.map(mod => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
              >
                <td>
                  <div className="imo-status imo-current-override" />
                  <div>Override</div>
                </td>
                <td>{mod.moduleName}</td>
                <td>{toDomain(mod)}</td>
                <td>{toFileName(mod)}</td>
              </tr>
            ))}
            {defaultModules.map(mod => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
              >
                <td>
                  <div className="imo-status imo-default-module" />
                  <div>Default</div>
                </td>
                <td>{mod.moduleName}</td>
                <td>{toDomain(mod)}</td>
                <td>{toFileName(mod)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

    this.setState({ dialogModule: null });
  };

  doUpdate = () => this.forceUpdate();

  addNewModule = (name, url) => {
    if (name && url) {
      window.importMapOverrides.addOverride(name, url);
    }
    this.setState({ dialogModule: null });
  };

  filterModuleNames = moduleName => {
    return this.state.searchVal.trim().length > 0
      ? moduleName.includes(this.state.searchVal)
      : true;
  };
}

function sorter(first, second) {
  return first.moduleName > second.moduleName;
}

const currentBase =
  (document.querySelector("base") && document.querySelector("base").href) ||
  location.origin + "/";

function toDomain(mod) {
  const urlStr = toUrlStr(mod);
  const url = toURL(urlStr);
  return url ? url.host : urlStr;
}

function toFileName(mod) {
  const urlStr = toUrlStr(mod);
  const url = toURL(urlStr);
  return url ? url.pathname.slice(url.pathname.lastIndexOf("/") + 1) : urlStr;
}

function toUrlStr(mod) {
  return mod.overrideUrl || mod.defaultUrl;
}

function toURL(urlStr) {
  try {
    return new URL(urlStr, currentBase);
  } catch {
    return null;
  }
}
