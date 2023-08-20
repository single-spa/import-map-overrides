import { h } from "preact";
import { useContext, useState } from "preact/hooks";
import Popup from "./popup.component";
import DevLibOverrides from "./dev-lib-overrides.component";
import { overridesBesidesDevLibs } from "../../util/dev-libs";
import { ImportMapOverridesContext } from "../contexts/imo-context-provider.component";

function validateTriggerPosition(position) {
  const validPositions = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];

  return validPositions.indexOf(position) >= 0 ? position : "bottom-right";
}

function TriggerButton({
  triggerPosition,
  toggleTrigger,
  atLeastOneOverride,
  pendingRefresh,
}) {
  return (
    <div>
      <button
        data-testid="trigger-button"
        onClick={toggleTrigger}
        className={`imo-unstyled imo-trigger imo-trigger-${triggerPosition} ${
          pendingRefresh
            ? "imo-trigger-pending-refresh"
            : atLeastOneOverride
            ? "imo-trigger-applied-overrides"
            : ""
        }`}
      >
        {"{\u00B7\u00B7\u00B7}"}
      </button>
    </div>
  );
}

const FullUI = (props) => {
  const shouldShow =
    !props.customElement.hasAttribute("show-when-local-storage") ||
    localStorage.getItem(
      props.customElement.getAttribute("show-when-local-storage")
    ) === "true";
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { hasOverriddenModules, hasPendingModulesToRefresh } = useContext(
    ImportMapOverridesContext
  );
  const devLibslocalStorageValue = localStorage.getItem(
    "import-map-overrides-dev-libs"
  );
  const triggerPosition = validateTriggerPosition(
    props.customElement.getAttribute("trigger-position")
  );
  const useDevLibs =
    devLibslocalStorageValue === "true" ||
    props.customElement.hasAttribute("dev-libs");
  const atLeastOneOverride = useDevLibs
    ? overridesBesidesDevLibs()
    : hasOverriddenModules;

  const togglePopup = () => setIsPopupVisible(!isPopupVisible);

  if (!shouldShow) {
    return null;
  }

  return (
    <div>
      {!isPopupVisible && (
        <TriggerButton
          triggerPosition={triggerPosition}
          toggleTrigger={togglePopup}
          pendingRefresh={hasPendingModulesToRefresh}
          atLeastOneOverride={atLeastOneOverride}
        />
      )}
      {useDevLibs && <DevLibOverrides />}
      {isPopupVisible && <Popup close={togglePopup} />}
    </div>
  );
};

export default FullUI;
