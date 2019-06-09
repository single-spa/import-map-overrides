import { h, Component } from "preact";

export default class ModuleDialog extends Component {
  state = {
    overrideUrl: this.props.module.overrideUrl
  };
  inputEl = null;
  componentDidMount() {
    this.inputEl.select();
    this.dialogEl.addEventListener("keydown", this.keyDown);
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.module !== prevProps.module) {
      this.setState({ overrideUrl: this.props.module.overrideUrl }, () => {
        this.inputEl.select();
      });
    }
  }
  componentWillUnmount() {
    this.dialogEl.removeEventListener("keydown", this.keyDown);
  }
  render({ module }) {
    return (
      <dialog
        className={`imo-module-dialog ${
          this.state.overrideUrl > 0 ? "imo-overridden" : "imo-default"
        }`}
        open
        ref={this.dialogRef}
      >
        <form method="dialog" onSubmit={this.handleSubmit}>
          <h3 style={{ marginTop: 0 }}>{module.moduleName}</h3>
          <table>
            <tbody>
              <tr>
                <td>Default URL:</td>
                <td>{module.defaultUrl}</td>
              </tr>
              <tr>
                <td>
                  <span id="override-url-label">Override URL:</span>
                </td>
                <td>
                  <input
                    ref={this.handleInputRef}
                    type="text"
                    value={this.state.overrideUrl}
                    aria-labelledby="override-url-label"
                    onInput={evt =>
                      this.setState({ overrideUrl: evt.target.value })
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
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
              className={
                this.state.overrideUrl ? "imo-overridden" : "imo-default"
              }
            >
              Apply
            </button>
          </div>
        </form>
      </dialog>
    );
  }

  handleInputRef = el => {
    this.inputEl = el;
  };

  dialogRef = el => {
    this.dialogEl = el;
  };

  handleSubmit = evt => {
    evt.preventDefault();
    this.props.updateModuleUrl(this.state.overrideUrl);
  };

  keyDown = evt => {
    if (evt.key === "Escape") {
      evt.stopPropagation();
      this.props.cancel();
    }
  };
}
