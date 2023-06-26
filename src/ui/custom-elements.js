import { render, h } from "preact";
import { isDisabled } from "../api/js-api";
import Root from "./root.component";
import Popup from "./components/popup.component";
import List from "./components/list.component";
import styles from "./import-map-overrides.css";

if (window.customElements && !isDisabled) {
  window.customElements.define(
    "import-map-overrides-full",
    preactCustomElement(Root, ["show-when-local-storage", "trigger-position"])
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
      if (!this.shadowRoot) {
        this.shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = styles.toString();
        this.shadow.appendChild(style);
      } else {
        this.shadow = this.shadowRoot;
      }
      this.renderedEl = render(
        h(Comp, { customElement: this }),
        this.shadow,
        this.renderedEl
      );
    }
  };
}
