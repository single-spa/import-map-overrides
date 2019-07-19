import "./import-map-overrides.css";
import { render, h } from "preact";
import FullUI from "./full-ui.component";
import Popup from "./popup.component";
import List from "./list/list.component";

if (window.customElements) {
  window.customElements.define(
    "import-map-overrides-full",
    preactCustomElement(FullUI, ["show-when-local-storage"])
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

function preactCustomElement(Comp, observedAttributes = []) {
  return class PreactCustomElement extends HTMLElement {
    connectedCallback() {
      this.renderWithPreact();
    }
    disconnectedCallback() {
      render(null, this);
      this.renderedEl = null;
    }
    static get observedAttributes() {
      return observedAttributes;
    }
    attributeChangedCallback() {
      this.renderWithPreact();
    }
    renderWithPreact() {
      this.renderedEl = render(
        h(Comp, { customElement: this }),
        this,
        this.renderedEl
      );
    }
  };
}
