import { h } from "preact";
import ImportMapOverridesContextProvider from "./contexts/imo-context-provider.component";
import FullUI from "./components/full-ui.component";

export default function Root(props) {
  return (
    <ImportMapOverridesContextProvider>
      <FullUI {...props} />
    </ImportMapOverridesContextProvider>
  );
}
