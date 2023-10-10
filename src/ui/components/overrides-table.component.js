import { h } from "preact";
import { useContext } from "preact/hooks";
import { ImportMapOverridesContext } from "../contexts/imo-context-provider.component";
import { includes } from "../../util/includes";

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

export default function OverridesTable(props) {
  const { filter, openModuleDialog } = props;
  const {
    nextOverriddenModules,
    pendingRefreshDefaultModules,
    disabledOverrides,
    overriddenModules,
    externalOverrideModules,
    devLibModules,
    defaultModules,
  } = useContext(ImportMapOverridesContext);

  const reload = (evt) => {
    evt.stopPropagation();
    window.location.reload();
  };

  const disableOverride = (evt, moduleName) => {
    evt.stopPropagation();
    window.importMapOverrides.disableOverride(moduleName);
  };

  const enableOverride = (evt, moduleName) => {
    evt.stopPropagation();
    window.importMapOverrides.enableOverride(moduleName);
  };

  const filterModules = (modules) =>
    modules.filter((mod) => includes(mod.moduleName, filter));

  return (
    <table className="imo-overrides-table">
      <thead>
        <tr>
          <th>Module Status</th>
          <th>Module Name</th>
          <th>Domain</th>
          <th>Filename</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {filterModules(nextOverriddenModules).map((mod) => (
          <tr
            role="button"
            tabIndex={0}
            onClick={() =>
              openModuleDialog({ ...mod, statusClass: "imo-refresh-override" })
            }
            key={mod.moduleName}
            className="imo-table-row-refresh-override"
          >
            <td>
              <div className="imo-status imo-refresh-override" />
              Inline Override
            </td>
            <td>{mod.moduleName}</td>
            <td>{toDomain(mod)}</td>
            <td>{toFileName(mod)}</td>
            <td>
              <span className="imo-table-action" onClick={reload} role="button">
                Refresh to apply changes
              </span>
            </td>
          </tr>
        ))}
        {filterModules(pendingRefreshDefaultModules).map((mod) => (
          <tr
            role="button"
            tabIndex={0}
            onClick={() =>
              openModuleDialog({ ...mod, statusClass: "imo-refresh-override" })
            }
            key={mod.moduleName}
            className="imo-table-row-refresh-override"
          >
            <td>
              <div className="imo-status imo-refresh-override" />
              Default
            </td>
            <td>{mod.moduleName}</td>
            <td>{toDomain(mod)}</td>
            <td>{toFileName(mod)}</td>
            <td>
              <span className="imo-table-action" onClick={reload} role="button">
                Refresh to apply changes
              </span>
            </td>
          </tr>
        ))}
        {filterModules(disabledOverrides).map((mod) => (
          <tr
            role="button"
            tabIndex={0}
            onClick={() =>
              openModuleDialog({ ...mod, statusClass: "imo-disabled-override" })
            }
            key={mod.moduleName}
            className="imo-table-row-disabled-override"
          >
            <td>
              <div className="imo-status imo-disabled-override" />
              Override disabled
            </td>
            <td>{mod.moduleName}</td>
            <td>{toDomain(mod)}</td>
            <td>{toFileName(mod)}</td>
            <td>
              <span
                className="imo-table-action"
                onClick={(evt) => enableOverride(evt, mod.moduleName)}
                role="button"
              >
                Enable override
              </span>
            </td>
          </tr>
        ))}
        {filterModules(overriddenModules).map((mod) => (
          <tr
            role="button"
            tabIndex={0}
            onClick={() =>
              openModuleDialog({ ...mod, statusClass: "imo-current-override" })
            }
            key={mod.moduleName}
            className="imo-table-row-current-override"
          >
            <td>
              <div className="imo-status imo-current-override" />
              Inline Override
            </td>
            <td>{mod.moduleName}</td>
            <td>{toDomain(mod)}</td>
            <td>{toFileName(mod)}</td>
            <td>
              <span
                className="imo-table-action"
                onClick={(evt) => disableOverride(evt, mod.moduleName)}
                role="button"
              >
                Disable override
              </span>
            </td>
          </tr>
        ))}
        {filterModules(externalOverrideModules).map((mod) => (
          <tr
            role="button"
            tabIndex={0}
            onClick={() =>
              openModuleDialog({ ...mod, statusClass: "imo-external-override" })
            }
            key={mod.moduleName}
          >
            <td>
              <div className="imo-status imo-external-override" />
              External Override
            </td>
            <td>{mod.moduleName}</td>
            <td>{toDomain(mod)}</td>
            <td>{toFileName(mod)}</td>
            <td>
              <span className="imo-table-action" role="button">
                Override
              </span>
            </td>
          </tr>
        ))}
        {filterModules(devLibModules).map((mod) => (
          <tr
            role="button"
            tabIndex={0}
            onClick={() =>
              openModuleDialog({ ...mod, statusClass: "imo-dev-lib-override" })
            }
            key={mod.moduleName}
            title="Automatically use dev version of certain npm libs"
          >
            <td>
              <div className="imo-status imo-dev-lib-override" />
              Dev Lib Override
            </td>
            <td>{mod.moduleName}</td>
            <td>{toDomain(mod)}</td>
            <td>{toFileName(mod)}</td>
            <td>
              <span
                className="imo-table-action"
                onClick={(evt) => disableOverride(evt, mod.moduleName)}
                role="button"
              >
                Disable override
              </span>
            </td>
          </tr>
        ))}
        {filterModules(defaultModules).map((mod) => (
          <tr
            role="button"
            tabIndex={0}
            onClick={() =>
              openModuleDialog({ ...mod, statusClass: "imo-default-module" })
            }
            key={mod.moduleName}
          >
            <td>
              <div className="imo-status imo-default-module" />
              Default
            </td>
            <td>{mod.moduleName}</td>
            <td>{toDomain(mod)}</td>
            <td>{toFileName(mod)}</td>
            <td>
              <span className="imo-table-action" role="button">
                Override
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
