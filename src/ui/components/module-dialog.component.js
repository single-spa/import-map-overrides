import { Fragment, h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { CustomInput } from "./custom-input.component";
import { LinkIcon } from "./link-icon.component";

const portRegex = /^\d+$/;

function getInitialOverrideUrl(module) {
  const regex = new RegExp(`//localhost:([0-9]+)/`);
  const match = regex.exec(module.overrideUrl);
  if (
    match &&
    module.overrideUrl ===
      window.importMapOverrides.getUrlFromPort(module.moduleName, match[1])
  ) {
    return match[1];
  } else if (module.overrideUrl) {
    return module.overrideUrl;
  } else {
    return "";
  }
}

export default function ModuleDialog(props) {
  const { addNewModule, close, module, updateModuleUrl } = props;
  const [overrideUrl, setOverrideUrl] = useState(getInitialOverrideUrl(module));
  const [moduleName, setModuleName] = useState("");
  const dialogRef = useRef(null);
  const moduleNameRef = useRef(null);
  const overrideUrlRef = useRef(null);

  function getDerivedUrl() {
    const lModuleName = module.isNew ? moduleName : module.moduleName;
    return portRegex.test(overrideUrl)
      ? window.importMapOverrides.getUrlFromPort(lModuleName, overrideUrl)
      : overrideUrl;
  }

  function focusFirstInput() {
    const firstInput = moduleNameRef.current ?? overrideUrlRef.current;
    firstInput?.focus();
  }

  function keyDown(evt) {
    if (evt.key === "Escape") {
      evt.stopPropagation();
      close();
    }
  }

  useEffect(() => {
    focusFirstInput();
    dialogRef.current?.addEventListener("keydown", keyDown);
    return () => {
      dialogRef.current?.removeEventListener("keydown", keyDown);
    };
  }, []);

  function handleOverrideUrlChange(newUrl) {
    setOverrideUrl(newUrl);
  }

  function handleModuleNameChange(newName) {
    setModuleName(newName);
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    if (
      module.moduleName &&
      window.importMapOverrides.isDisabled(module.moduleName)
    ) {
      window.importMapOverrides.enableOverride(module.moduleName);
    }
    if (module.isNew) {
      addNewModule(moduleName, overrideUrl);
    } else {
      updateModuleUrl(module.moduleName, overrideUrl);
    }
    close();
  }

  return (
    <div className="imo-modal-container">
      <div className="imo-modal-overlay" />
      <dialog
        className="imo-module-dialog"
        ref={dialogRef}
        open
        data-testid="module-dialog"
      >
        <form method="dialog" onSubmit={handleSubmit}>
          <div className="imo-module-dialog-content">
            <div className="imo-module-dialog-header">
              {module.statusClass && (
                <div className={`imo-status ${module.statusClass}`} />
              )}
              <h3>{module.moduleName}</h3>
            </div>
            {!module.isNew && (
              <Fragment>
                <label htmlFor="default-url">Default URL</label>
                <div id="default-url" class="imo-module-dialog-value">
                  {module.defaultUrl}
                </div>
              </Fragment>
            )}
            {module.isNew && (
              <Fragment>
                <label id="module-name-label" htmlFor="module-name">
                  Module Name
                </label>
                <CustomInput
                  id="module-name"
                  value={moduleName}
                  onChange={handleModuleNameChange}
                  ariaLabelledBy="module-name-label"
                  inputRef={moduleNameRef}
                  required
                />
              </Fragment>
            )}
            <label id="override-url-label" htmlFor="override-url">
              {module.isNew ? "URL" : "Override URL"}
            </label>
            <CustomInput
              id="override-url"
              icon={<LinkIcon />}
              value={overrideUrl}
              onChange={handleOverrideUrlChange}
              ariaLabelledBy="override-url-label"
              inputRef={overrideUrlRef}
            />
            {portRegex.test(overrideUrl) && (
              <Fragment>
                <label id="derived-url-label" htmlFor="derived-url">
                  Derived URL
                </label>
                <div id="derived-url" class="imo-module-dialog-value">
                  {getDerivedUrl()}
                </div>
              </Fragment>
            )}
          </div>
          <div className="imo-module-dialog-actions">
            <button
              type="button"
              class="secondary"
              tabIndex={5}
              onClick={close}
            >
              Cancel
            </button>
            {module.overrideUrl && !module.disabled && (
              <button
                type="button"
                onClick={() => {
                  window.importMapOverrides.disableOverride(module.moduleName);
                  close();
                }}
                tabIndex={6}
              >
                Disable Override
              </button>
            )}
            <button type="submit" tabIndex={7}>
              {overrideUrl
                ? "Apply override"
                : module.defaultUrl
                ? "Reset to default"
                : "Remove module"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
