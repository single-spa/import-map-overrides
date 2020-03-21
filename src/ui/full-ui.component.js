import { h, Component } from "preact";
import Popup from "./popup.component";
import DevLibOverrides, {
  overridesBesidesDevLibs
} from "./dev-lib-overrides.component";

export default class FullUI extends Component {
  state = {
    showingPopup: false
  };
  componentDidMount() {
    window.addEventListener("import-map-overrides:change", this.doUpdate);
  }
  componentWillUnmount() {
    window.removeEventListener("import-map-overrides:change", this.doUpdate);
  }
  doUpdate = () => this.forceUpdate();
  render(props, state) {
    const shouldShow =
      !props.customElement.hasAttribute("show-when-local-storage") ||
      localStorage.getItem(
        props.customElement.getAttribute("show-when-local-storage")
      ) === "true";

    if (!shouldShow) {
      return null;
    }

    return (
      <div>
        <button
          onClick={this.toggleTrigger}
          className={`imo-unstyled imo-trigger ${
            this.atLeastOneOverride() ? "imo-current-override" : ""
          }`}
        >
          {"{\u00B7\u00B7\u00B7}"}
        </button>
        {this.useDevLibs() && <DevLibOverrides />}
        {state.showingPopup && (
          <Popup
            close={this.toggleTrigger}
            importMapChanged={this.importMapChanged}
          />
        )}
      </div>
    );
  }
  toggleTrigger = () => {
    this.setState(prevState => ({
      showingPopup: !prevState.showingPopup
    }));
  };
  importMapChanged = () => {
    this.forceUpdate();
  };
  useDevLibs = () => {
    const localStorageValue = localStorage.getItem(
      "import-map-overrides-dev-libs"
    );
    return localStorageValue
      ? localStorageValue === "true"
      : this.props.customElement.hasAttribute("dev-libs");
  };
  atLeastOneOverride = () => {
    if (this.useDevLibs()) {
      return overridesBesidesDevLibs();
    } else {
      return (
        Object.keys(window.importMapOverrides.getOverrideMap().imports).length >
        0
      );
    }
  };
}
