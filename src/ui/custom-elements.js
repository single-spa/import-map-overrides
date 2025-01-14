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
    preactCustomElement(Popup),
  );
  window.customElements.define(
    "import-map-overrides-list",
    preactCustomElement(List),
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
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "style-nonce") {
        this.styleNonce = newValue;
        if (this.shadow) {
          this.shadow.querySelector("style").nonce = this.styleNonce;
        }
      }

      this.renderWithPreact();
    }
    renderWithPreact() {
      if (!this.shadowRoot) {
        this.shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = styles.toString();
        if (this.styleNonce) {
          style.nonce = this.styleNonce;
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
