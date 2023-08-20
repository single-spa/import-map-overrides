import { h } from "preact";
import { render, screen } from "@testing-library/preact";
import "@testing-library/jest-dom";
import { ImportMapOverridesContext } from "../contexts/imo-context-provider.component";
import FullUI from "./full-ui.component";
import { overridesBesidesDevLibs } from "../../util/dev-libs";

jest.mock("./popup.component", () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-popup" />,
}));

jest.mock("./dev-lib-overrides.component", () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-dev-lib-overrides" />,
}));

jest.mock("../../util/dev-libs");

describe("FullUI", () => {
  it("renders the TriggerButton when shouldShow is true and isPopupVisible is false", () => {
    const contextValue = {
      hasOverriddenModules: false,
      hasPendingModulesToRefresh: false,
    };

    render(
      <ImportMapOverridesContext.Provider value={contextValue}>
        <FullUI customElement={document.createElement("div")} />
      </ImportMapOverridesContext.Provider>
    );

    expect(screen.getByTestId("trigger-button")).toBeInTheDocument();
  });

  it("does not render the TriggerButton when shouldShow is false", () => {
    const contextValue = {
      hasOverriddenModules: false,
      hasPendingModulesToRefresh: false,
    };
    const customElement = document.createElement("div");
    customElement.setAttribute("show-when-local-storage", "some-key");
    localStorage.setItem("some-key", "false");

    render(
      <ImportMapOverridesContext.Provider value={contextValue}>
        <FullUI customElement={customElement} />
      </ImportMapOverridesContext.Provider>
    );

    expect(screen.queryByTestId("trigger-button")).not.toBeInTheDocument();
  });

  it("renders the DevLibOverrides component when useDevLibs is true", () => {
    const contextValue = {
      hasOverriddenModules: false,
      hasPendingModulesToRefresh: false,
    };
    const customElement = document.createElement("div");
    customElement.setAttribute("dev-libs", "");
    overridesBesidesDevLibs.mockReturnValueOnce(true);

    render(
      <ImportMapOverridesContext.Provider value={contextValue}>
        <FullUI customElement={customElement} />
      </ImportMapOverridesContext.Provider>
    );

    expect(screen.getByTestId("mocked-dev-lib-overrides")).toBeInTheDocument();
  });

  it("renders the Popup component when isPopupVisible is true", async () => {
    const contextValue = {
      hasOverriddenModules: false,
      hasPendingModulesToRefresh: false,
    };

    render(
      <ImportMapOverridesContext.Provider value={contextValue}>
        <FullUI customElement={document.createElement("div")} />
      </ImportMapOverridesContext.Provider>
    );

    const button = screen.getByTestId("trigger-button");
    button.click();

    expect(await screen.findByTestId("mocked-popup")).toBeInTheDocument();
  });

  it("renders the TriggerButton with pendingRefresh and atLeastOneOverride props when there are overridden modules and pending modules to refresh", () => {
    const contextValue = {
      hasOverriddenModules: true,
      hasPendingModulesToRefresh: false,
    };

    render(
      <ImportMapOverridesContext.Provider value={contextValue}>
        <FullUI customElement={document.createElement("div")} />
      </ImportMapOverridesContext.Provider>
    );

    const button = screen.getByTestId("trigger-button");

    expect(button).toHaveClass("imo-trigger-applied-overrides");
  });

  it("renders the TriggerButton with pendingRefresh and atLeastOneOverride props when there are overridden modules and pending modules to refresh", () => {
    const contextValue = {
      hasOverriddenModules: false,
      hasPendingModulesToRefresh: true,
    };

    render(
      <ImportMapOverridesContext.Provider value={contextValue}>
        <FullUI customElement={document.createElement("div")} />
      </ImportMapOverridesContext.Provider>
    );

    const button = screen.getByTestId("trigger-button");

    expect(button).toHaveClass("imo-trigger-pending-refresh");
  });
});
