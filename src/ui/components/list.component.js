import { h, Fragment } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { ImportMapOverridesContext } from "../contexts/imo-context-provider.component";
import { includes } from "../../util/includes.js";
import OverridesTable from "./overrides-table.component";
import ExternalImportmapsTable from "./ext-importmaps-table.component";
import ModuleDialog from "./module-dialog.component";
import ExtImportMapDialog from "./ext-importmap-dialog.component";

function SearchIcon() {
  return (
    <div className="imo-icon imo-list-search-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="17"
        viewBox="0 0 16 17"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.9748 10.9683C10.985 10.9773 10.995 10.9867 11.0047 10.9965L13.8047 13.7965C14.0651 14.0568 14.0651 14.479 13.8047 14.7393C13.5444 14.9997 13.1223 14.9997 12.8619 14.7393L10.0619 11.9393C10.0522 11.9295 10.0428 11.9196 10.0337 11.9094C9.19238 12.5525 8.14081 12.9346 7 12.9346C4.23858 12.9346 2 10.696 2 7.93457C2 5.17315 4.23858 2.93457 7 2.93457C9.76142 2.93457 12 5.17315 12 7.93457C12 9.07538 11.6179 10.127 10.9748 10.9683ZM7 11.6012C9.02504 11.6012 10.6667 9.95961 10.6667 7.93457C10.6667 5.90953 9.02504 4.2679 7 4.2679C4.97496 4.2679 3.33333 5.90953 3.33333 7.93457C3.33333 9.95961 4.97496 11.6012 7 11.6012Z"
        />
      </svg>
    </div>
  );
}

function PlusIcon() {
  return (
    <div className="imo-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="17"
        viewBox="0 0 16 17"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M8.82358 8.11099H12.1764C12.6313 8.11099 13 8.47972 13 8.93457C13 9.38942 12.6313 9.75815 12.1764 9.75815H8.82358V13.111C8.82358 13.5658 8.45485 13.9346 8 13.9346C7.54515 13.9346 7.17642 13.5658 7.17642 13.111V9.75815H3.82358C3.36873 9.75815 3 9.38942 3 8.93457C3 8.47972 3.36873 8.11099 3.82358 8.11099H7.17642V4.75815C7.17642 4.3033 7.54515 3.93457 8 3.93457C8.45485 3.93457 8.82358 4.3033 8.82358 4.75815V8.11099Z"
        />
      </svg>
    </div>
  );
}

function SearchBox({ value, onInput, inputRef }) {
  return (
    <div className="imo-list-search-container">
      <SearchIcon />
      <input
        aria-label="Search modules"
        placeholder="Search modules..."
        value={value}
        onInput={onInput}
        ref={inputRef}
      />
    </div>
  );
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

export default function List() {
  const [dialogModule, setDialogModule] = useState(null);
  const [dialogExtImportMap, setDialogExtImportMap] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const extImportMaps = getExternalMaps();

  const openModuleDialog = (mod) => {
    setDialogModule(mod);
  };

  const openDialogExternalMap = (extMap) => {
    setDialogExtImportMap(extMap);
  };

  const handleInputChange = (evt) => {
    setSearchVal(evt.target.value);
  };

  const updateModuleUrl = (moduleName, newUrl) => {
    if (!newUrl) {
      window.importMapOverrides.removeOverride(moduleName);
    } else {
      window.importMapOverrides.addOverride(moduleName, newUrl);
    }
  };

  const addNewModule = (name, url) => {
    if (name && url) {
      window.importMapOverrides.addOverride(name, url);
    }
  };

  return (
    <Fragment>
      <div className="imo-list-container">
        <div className="imo-table-toolbar">
          <SearchBox
            value={searchVal}
            onInput={handleInputChange}
            inputRef={inputRef}
          />
          <button onClick={() => window.importMapOverrides.resetOverrides()}>
            Reset all overrides
          </button>
        </div>
        <OverridesTable
          filter={searchVal}
          openModuleDialog={openModuleDialog}
        />
        <ExternalImportmapsTable
          {...extImportMaps}
          openDialogExternalMap={openDialogExternalMap}
        />
        <div className="imo-table-actions">
          <button
            onClick={() =>
              openModuleDialog({
                moduleName: "New module",
                isNew: true,
              })
            }
          >
            <PlusIcon />
            Add new module
          </button>
          <button
            onClick={() =>
              openDialogExternalMap({
                isNew: true,
                url: "",
              })
            }
          >
            <PlusIcon />
            Add import map
          </button>
        </div>
      </div>
      {dialogModule && (
        <ModuleDialog
          module={dialogModule}
          close={() => setDialogModule(null)}
          updateModuleUrl={updateModuleUrl}
          addNewModule={addNewModule}
        />
      )}
      {dialogExtImportMap && (
        <ExtImportMapDialog
          dialogExternalMap={dialogExtImportMap}
          close={() => setDialogExtImportMap(null)}
        />
      )}
    </Fragment>
  );
}
