import { h, Component, render } from "preact";
import { includes } from "../../util/includes.js";
import ModuleDialog from "./module-dialog.component";
import ExternalImportMap from "./external-importmap-dialog.component";
import { devLibs } from "../dev-lib-overrides.component";

export default class List extends Component {
  state = {
    notOverriddenMap: { imports: {} },
    currentPageMap: { imports: {} },
    nextPageMap: { imports: {} },
    dialogModule: null,
    dialogExternalMap: null,
    searchVal: "",
  };
  componentDidMount() {
    window.importMapOverrides.getDefaultMap().then((notOverriddenMap) => {
      this.setState({ notOverriddenMap });
    });
    window.importMapOverrides.getCurrentPageMap().then((currentPageMap) => {
      this.setState({ currentPageMap });
    });
    window.importMapOverrides.getNextPageMap().then((nextPageMap) => {
      this.setState({ nextPageMap });
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

    if (!prevState.dialogExternalMap && this.state.dialogExternalMap) {
      this.dialogContainer = document.createElement("div");
      document.body.appendChild(this.dialogContainer);
      render(
        <ExternalImportMap
          dialogExternalMap={this.state.dialogExternalMap}
          cancel={this.cancel}
        />,
        this.dialogContainer
      );
    } else if (prevState.dialogExternalMap && !this.state.dialogExternalMap) {
      render(null, this.dialogContainer);
      this.dialogContainer.remove();
      delete this.dialogContainer;
    }
  }
  render() {
    const overriddenModules = [],
      nextOverriddenModules = [],
      disabledOverrides = [],
      defaultModules = [],
      externalOverrideModules = [],
      pendingRefreshDefaultModules = [],
      devLibModules = [];

    const overrideMap = window.importMapOverrides.getOverrideMap(true).imports;

    const notOverriddenKeys = Object.keys(this.state.notOverriddenMap.imports);

    const disabledModules = window.importMapOverrides.getDisabledOverrides();

    notOverriddenKeys.filter(this.filterModuleNames).forEach((moduleName) => {
      const mod = {
        moduleName,
        defaultUrl: this.state.notOverriddenMap.imports[moduleName],
        overrideUrl: overrideMap[moduleName],
        disabled: includes(disabledModules, moduleName),
      };
      if (mod.disabled) {
        disabledOverrides.push(mod);
      } else if (overrideMap[moduleName]) {
        if (
          this.state.currentPageMap.imports[moduleName] ===
          overrideMap[moduleName]
        ) {
          if (
            devLibs[moduleName] &&
            devLibs[moduleName](
              this.state.currentPageMap.imports[moduleName]
            ) === overrideMap[moduleName]
          ) {
            devLibModules.push(mod);
          } else {
            overriddenModules.push(mod);
          }
        } else {
          nextOverriddenModules.push(mod);
        }
      } else if (
        this.state.notOverriddenMap.imports[moduleName] ===
        this.state.currentPageMap.imports[moduleName]
      ) {
        defaultModules.push(mod);
      } else if (
        this.state.notOverriddenMap.imports[moduleName] ===
        this.state.nextPageMap.imports[moduleName]
      ) {
        pendingRefreshDefaultModules.push(mod);
      } else {
        externalOverrideModules.push(mod);
      }
    });

    Object.keys(overrideMap)
      .filter(this.filterModuleNames)
      .forEach((moduleName) => {
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

    const { brokenMaps, workingCurrentPageMaps, workingNextPageMaps } =
      getExternalMaps();

    return (
      <div className="imo-list-container">
        <div className="imo-table-header-actions">
          <input
            className="imo-list-search"
            aria-label="Search modules"
            placeholder="Search modules"
            value={this.state.searchVal}
            onInput={(evt) => this.setState({ searchVal: evt.target.value })}
            ref={(ref) => (this.inputRef = ref)}
          />
          <div className="imo-add-new">
            <button
              onClick={() =>
                this.setState({
                  dialogModule: { moduleName: "New module", isNew: true },
                })
              }
            >
              Add new module
            </button>
          </div>
          <div className="imo-add-new">
            <button
              onClick={() => {
                this.setState({
                  dialogExternalMap: { url: "", isNew: true },
                });
              }}
            >
              Add import map
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
            {nextOverriddenModules.map((mod) => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
                key={mod.moduleName}
              >
                <td onClick={this.reload} role="button" tabIndex={0}>
                  <div className="imo-status imo-next-override" />
                  <div>Inline Override</div>
                  <div className="imo-needs-refresh" />
                </td>
                <td>{mod.moduleName}</td>
                <td>{toDomain(mod)}</td>
                <td>{toFileName(mod)}</td>
              </tr>
            ))}
            {pendingRefreshDefaultModules.map((mod) => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
                key={mod.moduleName}
              >
                <td style={{ position: "relative" }}>
                  <div className="imo-status imo-next-default" />
                  <div>Default</div>
                  <div className="imo-needs-refresh" />
                </td>
                <td>{mod.moduleName}</td>
                <td>{toDomain(mod)}</td>
                <td>{toFileName(mod)}</td>
              </tr>
            ))}
            {disabledOverrides.map((mod) => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
                key={mod.moduleName}
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
            {overriddenModules.map((mod) => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
                key={mod.moduleName}
              >
                <td>
                  <div className="imo-status imo-current-override" />
                  <div>Inline Override</div>
                </td>
                <td>{mod.moduleName}</td>
                <td>{toDomain(mod)}</td>
                <td>{toFileName(mod)}</td>
              </tr>
            ))}
            {externalOverrideModules.map((mod) => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
                key={mod.moduleName}
              >
                <td>
                  <div className="imo-status imo-external-override" />
                  <div>External Override</div>
                </td>
                <td>{mod.moduleName}</td>
                <td>{toDomain(mod)}</td>
                <td>{toFileName(mod)}</td>
              </tr>
            ))}
            {devLibModules.map((mod) => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
                key={mod.moduleName}
                title="Automatically use dev version of certain npm libs"
              >
                <td>
                  <div className="imo-status imo-dev-lib-override" />
                  <div>Dev Lib Override</div>
                </td>
                <td>{mod.moduleName}</td>
                <td>{toDomain(mod)}</td>
                <td>{toFileName(mod)}</td>
              </tr>
            ))}
            {defaultModules.map((mod) => (
              <tr
                role="button"
                tabIndex={0}
                onClick={() => this.setState({ dialogModule: mod })}
                key={mod.moduleName}
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
        {(brokenMaps.length > 0 ||
          workingCurrentPageMaps.length > 0 ||
          workingNextPageMaps.length > 0) && (
          <table className="imo-overrides-table">
            <thead>
              <th>Import Map Status</th>
              <th>URL</th>
            </thead>
            <tbody>
              {brokenMaps.map((url) => (
                <tr
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    this.setState({ dialogExternalMap: { isNew: false, url } })
                  }
                  key={url}
                >
                  <td>
                    <div className="imo-status imo-disabled-override" />
                    <div>Invalid</div>
                  </td>
                  <td>{url}</td>
                </tr>
              ))}
              {workingNextPageMaps.map((url) => (
                <tr
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    this.setState({ dialogExternalMap: { isNew: false, url } })
                  }
                  key={url}
                >
                  <td>
                    <div className="imo-status imo-next-override" />
                    <div>Pending refresh</div>
                  </td>
                  <td>{url}</td>
                </tr>
              ))}
              {workingCurrentPageMaps.map((url) => (
                <tr
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    this.setState({ dialogExternalMap: { isNew: false, url } })
                  }
                  key={url}
                >
                  <td>
                    <div className="imo-status imo-current-override" />
                    <div>Override</div>
                  </td>
                  <td>{url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  reload = (evt) => {
    evt.stopPropagation();
    window.location.reload();
  };

  cancel = () => {
    this.setState({ dialogModule: null, dialogExternalMap: null });
  };

  updateModuleUrl = (newUrl) => {
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

  doUpdate = () => {
    this.forceUpdate();
    window.importMapOverrides.getNextPageMap().then((nextPageMap) => {
      this.setState({ nextPageMap });
    });
  };

  addNewModule = (name, url) => {
    if (name && url) {
      window.importMapOverrides.addOverride(name, url);
    }
    this.setState({ dialogModule: null });
  };

  filterModuleNames = (moduleName) => {
    return this.state.searchVal.trim().length > 0
      ? includes(moduleName, this.state.searchVal)
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

function getExternalMaps() {
  const allExternalMaps = window.importMapOverrides.getExternalOverrides();
  const allCurrentPageMaps =
    window.importMapOverrides.getCurrentPageExternalOverrides();
  const brokenMaps = [],
    workingCurrentPageMaps = [],
    workingNextPageMaps = [];

  for (let externalMap of allExternalMaps) {
    if (includes(window.importMapOverrides.invalidExternalMaps, externalMap)) {
      brokenMaps.push(externalMap);
    } else {
      if (includes(allCurrentPageMaps, externalMap)) {
        workingCurrentPageMaps.push(externalMap);
      } else {
        workingNextPageMaps.push(externalMap);
      }
    }
  }

  return {
    brokenMaps,
    workingCurrentPageMaps,
    workingNextPageMaps,
  };
}
