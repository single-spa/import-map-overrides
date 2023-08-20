import { h } from "preact";
import { useEffect } from "preact/hooks";
import List from "./list.component";

function CloseButton({ onClick }) {
  return (
    <div className="imo-close-button" data-testid="close-btn" onClick={onClick}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.4142 12.9346L17.7071 17.2275C18.0976 17.618 18.0976 18.2512 17.7071 18.6417C17.3166 19.0322 16.6834 19.0322 16.2929 18.6417L12 14.3488L7.70711 18.6417C7.31658 19.0322 6.68342 19.0322 6.29289 18.6417C5.90237 18.2512 5.90237 17.618 6.29289 17.2275L10.5858 12.9346L6.29289 8.64168C5.90237 8.25115 5.90237 7.61799 6.29289 7.22746C6.68342 6.83694 7.31658 6.83694 7.70711 7.22746L12 11.5204L16.2929 7.22746C16.6834 6.83694 17.3166 6.83694 17.7071 7.22746C18.0976 7.61799 18.0976 8.25115 17.7071 8.64168L13.4142 12.9346Z"
        />
      </svg>
    </div>
  );
}

export default function Popup(props) {
  useEffect(() => {
    const keydownListener = (evt) => {
      if (evt.key === "Escape" && props.close) {
        props.close();
      }
    };
    window.addEventListener("keydown", keydownListener);
    return () => {
      window.removeEventListener("keydown", keydownListener);
    };
  }, [props.close]);

  return (
    <div className="imo-popup-container">
      <div className="imo-popup-nav">
        <CloseButton onClick={props.close} />
      </div>
      <div className="imo-popup-content">
        <div className="imo-popup-header">
          <h1>Import Map Overrides</h1>
          <p>
            This developer tool allows you to view and override your import
            maps. Start by clicking on a module that you'd like to override.{" "}
            <a
              target="_blank"
              href="https://github.com/joeldenning/import-map-overrides"
            >
              See documentation for more info
            </a>
            .
          </p>
        </div>
        <List />
      </div>
    </div>
  );
}
