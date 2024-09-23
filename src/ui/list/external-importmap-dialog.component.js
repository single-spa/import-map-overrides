import { h, Component } from "preact";

export default class ExternalImportMap extends Component {
  state = {
    url: this.props.dialogExternalMap.isNew
      ? ""
      : this.props.dialogExternalMap.url,
  };
  inputEl = null;
  componentDidMount() {
    this.inputEl.focus();
    this.dialogEl.addEventListener("keydown", this.keyDown);
  }
  componentWillUnmount() {
    this.dialogEl.removeEventListener("keydown", this.keyDown);
  }
  render() {
    return (
      <div className="imo-modal-container">
        <div className="imo-modal" />
        <dialog
          className="imo-module-dialog"
          open
          ref={(el) => (this.dialogEl = el)}
        >
          <form method="dialog" onSubmit={this.handleSubmit}>
            <h3 style={{ marginTop: 0 }}>
              {this.props.dialogExternalMap.isNew
                ? "Add External Import Map"
                : "Edit External Import Map"}
            </h3>
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="external-importmap-url">URL to import map:</label>
              <span style={{ position: "relative" }}>
                <input
                  id="external-importmap-url"
                  type="text"
                  value={this.state.url}
                  onInput={(evt) => this.setState({ url: evt.target.value })}
                  ref={(el) => (this.inputEl = el)}
                  required={this.props.dialogExternalMap.isNew}
                />
                <div
                  role="button"
                  tabIndex={0}
                  className="imo-clear-input"
                  onClick={() => this.setState({ url: "" })}
                >
                  <div>{"\u24E7"}</div>
                </div>
              </span>
            </div>
            <div className="imo-dialog-actions">
              <button
                type="button"
                onClick={this.props.cancel}
                style={{ marginRight: "16px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={this.state.url ? "imo-overridden" : "imo-default"}
              >
                {this.state.url || this.props.dialogExternalMap.isNew
                  ? "Apply override"
                  : "Remove override"}
              </button>
            </div>
          </form>
        </dialog>
      </div>
    );
  }
  handleSubmit = (evt) => {
    evt.preventDefault();

    if (!this.props.dialogExternalMap.isNew) {
      window.importMapOverrides.removeExternalOverride(
        this.props.dialogExternalMap.url,
      );
    }

    if (this.state.url) {
      window.importMapOverrides.addExternalOverride(this.state.url);
    }

    this.props.cancel();
  };
  keyDown = (evt) => {
    if (evt.key === "Escape") {
      evt.stopPropagation();
      this.props.cancel();
    }
  };
}
