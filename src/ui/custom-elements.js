import "./import-map-overrides.css";
import { render, h } from "preact";
import FullUI from "./full-ui.component";
import Popup from "./popup.component";
import List from "./list/list.component";

if (window.customElements) {
  window.customElements.define(
    "import-map-overrides-full",
    preactCustomElement(FullUI)
  );
  window.customElements.define(
    "import-map-overrides-popup",
    preactCustomElement(Popup)
  );
  window.customElements.define(
    "import-map-overrides-list",
    preactCustomElement(List)
  );
}

function preactCustomElement(Comp) {
  return class PreactCustomElement extends HTMLElement {
    connectedCallback() {
      render(h(Comp, this), this);
    }
    disconnectedCallback() {
      render(null, this);
    }
  };
}
