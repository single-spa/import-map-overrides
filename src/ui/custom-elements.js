import styles from "./import-map-overrides.css";
import { render, h } from "preact";
import FullUI from "./full-ui.component";
import Popup from "./popup.component";
import List from "./list/list.component";
import { isDisabled } from "../api/js-api";

if (window.customElements && !isDisabled) {
  window.customElements.define(
    "import-map-overrides-full",
    preactCustomElement(FullUI, [
      "show-when-local-storage",
      "style-nonce",
      "trigger-position",
    ]),
  );
  window.customElements.define(
    "import-map-overrides-popup",
    preactCustomElement(Popup, ["style-nonce"]),
  );
  window.customElements.define(
    "import-map-overrides-list",
    preactCustomElement(List, ["style-nonce"]),
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
      if (!this.shadowRoot) {
        this.shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = styles.toString();
        if (this.getAttribute("style-nonce")) {
          style.setAttribute("nonce", this.getAttribute("style-nonce"));
        }
        this.shadow.appendChild(style);
      } else {
        this.shadow = this.shadowRoot;
      }
      this.renderedEl = render(
        h(Comp, { customElement: this }),
        this.shadow,
        this.renderedEl,
      );
    }
  };
}
