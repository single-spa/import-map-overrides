import { h, Component } from "preact";
import List from "./list/list.component";

export default class Popup extends Component {
  componentDidMount() {
    window.addEventListener("keydown", this.keydownListener);
    window.addEventListener("import-map-overrides:change", this.doUpdate);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.keydownListener);
    window.removeEventListener("import-map-overrides:change", this.doUpdate);
  }
  doUpdate = () => this.forceUpdate();
  render(props) {
    return (
      <div className="imo-popup">
        <div className="imo-header">
          <div>
            <h1>Import Map Overrides</h1>
            <p>
              This developer tool allows you to view and override your import
              maps.{" "}
              <a
                target="_blank"
                href="https://github.com/joeldenning/import-map-overrides"
              >
                See documentation for more info
              </a>
              .
            </p>
          </div>
          <button className="imo-unstyled" onClick={props.close}>
            {"\u24E7"}
          </button>
        </div>
        <List importMapChanged={this.props.importMapChanged} />
      </div>
    );
  }
  keydownListener = (evt) => {
    if (evt.key === "Escape" && this.props.close) {
      this.props.close();
    }
  };
}
