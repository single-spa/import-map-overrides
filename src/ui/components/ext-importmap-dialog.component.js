import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { CustomInput } from "./custom-input.component";
import { LinkIcon } from "./link-icon.component";

export default function ExternalImportMapDialog(props) {
  const { close, dialogExternalMap } = props;
  const [url, setUrl] = useState(
    dialogExternalMap.isNew ? "" : dialogExternalMap.url
  );
  const dialogRef = useRef(null);
  const urlRef = useRef(null);

  const handleKeyDown = (evt) => {
    if (evt.key === "Escape") {
      evt.stopPropagation();
      close();
    }
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();

    if (!dialogExternalMap.isNew) {
      window.importMapOverrides.removeExternalOverride(dialogExternalMap.url);
    }

    if (url) {
      window.importMapOverrides.addExternalOverride(url);
    }

    close();
  };

  useEffect(() => {
    urlRef.current.focus();
    dialogRef.current?.addEventListener("keydown", handleKeyDown);

    return () => {
      dialogRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <div className="imo-modal-container">
      <div className="imo-modal-overlay" />
      <dialog
        className="imo-module-dialog"
        ref={dialogRef}
        open
        data-testid="ext-import-map-dialog"
      >
        <form method="dialog" onSubmit={handleSubmit}>
          <div className="imo-module-dialog-content">
            <div className="imo-module-dialog-header">
              <h3>
                {dialogExternalMap.isNew
                  ? "Add External Import Map"
                  : "Edit External Import Map"}
              </h3>
            </div>
            <label
              htmlFor="external-importmap-url"
              id="external-importmap-url-label"
            >
              URL to import map
            </label>
            <CustomInput
              id="external-importmap-url"
              icon={<LinkIcon />}
              value={url}
              onChange={setUrl}
              ariaLabelledBy="external-importmap-url-label"
              inputRef={urlRef}
              required={dialogExternalMap.isNew}
            />
          </div>
          <div className="imo-module-dialog-actions">
            <button
              type="button"
              class="secondary"
              onClick={close}
              style={{ marginRight: "16px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={url ? "imo-overridden" : "imo-default"}
            >
              {url || dialogExternalMap.isNew ? "Apply override" : "Remove map"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
