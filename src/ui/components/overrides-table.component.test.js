import { h } from "preact";
import { render, fireEvent, screen } from "@testing-library/preact";
import "@testing-library/jest-dom";
import OverridesTable from "./overrides-table.component";
import { ImportMapOverridesContext } from "../contexts/imo-context-provider.component";

describe("OverridesTable", () => {
  const filter = "";
  const openModuleDialog = jest.fn();

  const emptyImoContextData = {
    nextOverriddenModules: [],
    pendingRefreshDefaultModules: [],
    disabledOverrides: [],
    overriddenModules: [],
    externalOverrideModules: [],
    devLibModules: [],
    defaultModules: [],
    hasPendingModulesToRefresh: false,
    hasOverriddenModules: false,
  };
  const someModules = [
    {
      moduleName: "module1",
      overrideUrl: "https://example.com/module1.js",
      defaultUrl: "https://cdn.example.com/module1.js",
    },
    {
      moduleName: "module2",
      overrideUrl: "https://another.com/module2.js",
      defaultUrl: "https://cdn.another.com/module2.js",
    },
  ];

  const original = window.location;

  beforeAll(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload: jest.fn() },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: original,
    });
  });

  beforeEach(() => {
    window.importMapOverrides = {
      disableOverride: jest.fn(),
      enableOverride: jest.fn(),
    };
  });

  afterEach(() => {
    delete window.importMapOverrides;
  });

  const expectOpenModuleDialog = (statusClass) => {
    const row = screen.getByText("module1");
    fireEvent.click(row);

    expect(openModuleDialog).toHaveBeenCalledWith({
      moduleName: "module1",
      overrideUrl: "https://example.com/module1.js",
      defaultUrl: "https://cdn.example.com/module1.js",
      statusClass: statusClass,
    });
  };

  const expectReload = () => {
    const refreshButton = screen.getAllByText("Refresh to apply changes")[0];
    fireEvent.click(refreshButton);

    expect(window.location.reload).toHaveBeenCalled();
  };

  const expectDisable = () => {
    const disableOverrideButton = screen.getAllByText("Disable override")[0];
    fireEvent.click(disableOverrideButton);

    expect(window.importMapOverrides.disableOverride).toHaveBeenCalledWith(
      "module1"
    );
  };

  it("renders the headers", () => {
    render(
      <ImportMapOverridesContext.Provider value={{ ...emptyImoContextData }}>
        <OverridesTable filter={filter} openModuleDialog={openModuleDialog} />
      </ImportMapOverridesContext.Provider>
    );

    expect(screen.getByText("Module Status")).toBeInTheDocument();
    expect(screen.getByText("Module Name")).toBeInTheDocument();
    expect(screen.getByText("Domain")).toBeInTheDocument();
    expect(screen.getByText("Filename")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("renders the nextOverriddenModules", () => {
    render(
      <ImportMapOverridesContext.Provider
        value={{
          ...emptyImoContextData,
          nextOverriddenModules: someModules,
          hasPendingModulesToRefresh: true,
        }}
      >
        <OverridesTable filter={filter} openModuleDialog={openModuleDialog} />
      </ImportMapOverridesContext.Provider>
    );

    expect(
      screen.getAllByText("Inline Override", { exact: false })
    ).toBeTruthy();
    expect(screen.getByText("module1")).toBeInTheDocument();
    expect(screen.getByText("module2")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("another.com")).toBeInTheDocument();
    expect(screen.getByText("module1.js")).toBeInTheDocument();
    expect(screen.getByText("module2.js")).toBeInTheDocument();
    expect(screen.getAllByText("Refresh to apply changes")).toBeTruthy();

    expectOpenModuleDialog("imo-refresh-override");
    expectReload();
  });

  it("renders the pendingRefreshDefaultModules", () => {
    render(
      <ImportMapOverridesContext.Provider
        value={{
          ...emptyImoContextData,
          pendingRefreshDefaultModules: someModules,
          hasPendingModulesToRefresh: true,
        }}
      >
        <OverridesTable filter={filter} openModuleDialog={openModuleDialog} />
      </ImportMapOverridesContext.Provider>
    );

    expect(screen.getAllByText("Default", { exact: false })).toBeTruthy();
    expect(screen.getByText("module1")).toBeInTheDocument();
    expect(screen.getByText("module2")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("another.com")).toBeInTheDocument();
    expect(screen.getByText("module1.js")).toBeInTheDocument();
    expect(screen.getByText("module2.js")).toBeInTheDocument();
    expect(screen.getAllByText("Refresh to apply changes")).toBeTruthy();

    expectOpenModuleDialog("imo-refresh-override");
    expectReload();
  });

  it("renders the disabledOverrides", () => {
    render(
      <ImportMapOverridesContext.Provider
        value={{
          ...emptyImoContextData,
          disabledOverrides: someModules,
        }}
      >
        <OverridesTable filter={filter} openModuleDialog={openModuleDialog} />
      </ImportMapOverridesContext.Provider>
    );

    expect(screen.getAllByText("Disabled", { exact: false })).toBeTruthy();
    expect(screen.getByText("module1")).toBeInTheDocument();
    expect(screen.getByText("module2")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("another.com")).toBeInTheDocument();
    expect(screen.getByText("module1.js")).toBeInTheDocument();
    expect(screen.getByText("module2.js")).toBeInTheDocument();
    expect(screen.getAllByText("Enable override")).toBeTruthy();

    expectOpenModuleDialog("imo-disabled-override");
    const enableOverrideButton = screen.getAllByText("Enable override")[0];
    fireEvent.click(enableOverrideButton);

    expect(window.importMapOverrides.enableOverride).toHaveBeenCalledWith(
      "module1"
    );
  });

  it("renders the overriddenModules", () => {
    render(
      <ImportMapOverridesContext.Provider
        value={{
          ...emptyImoContextData,
          overriddenModules: someModules,
        }}
      >
        <OverridesTable filter={filter} openModuleDialog={openModuleDialog} />
      </ImportMapOverridesContext.Provider>
    );

    expect(
      screen.getAllByText("Inline override", { exact: false })
    ).toBeTruthy();
    expect(screen.getByText("module1")).toBeInTheDocument();
    expect(screen.getByText("module2")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("another.com")).toBeInTheDocument();
    expect(screen.getByText("module1.js")).toBeInTheDocument();
    expect(screen.getByText("module2.js")).toBeInTheDocument();
    expect(screen.getAllByText("Disable override")).toBeTruthy();

    expectOpenModuleDialog("imo-current-override");
    expectDisable();
  });

  it("renders the externalOverrideModules", () => {
    render(
      <ImportMapOverridesContext.Provider
        value={{
          ...emptyImoContextData,
          externalOverrideModules: someModules,
        }}
      >
        <OverridesTable filter={filter} openModuleDialog={openModuleDialog} />
      </ImportMapOverridesContext.Provider>
    );

    expect(
      screen.getAllByText("External override", { exact: false })
    ).toBeTruthy();
    expect(screen.getByText("module1")).toBeInTheDocument();
    expect(screen.getByText("module2")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("another.com")).toBeInTheDocument();
    expect(screen.getByText("module1.js")).toBeInTheDocument();
    expect(screen.getByText("module2.js")).toBeInTheDocument();
    expect(screen.getAllByText("Override")).toBeTruthy();

    expectOpenModuleDialog("imo-external-override");
  });

  it("renders the devLibModules", () => {
    render(
      <ImportMapOverridesContext.Provider
        value={{
          ...emptyImoContextData,
          devLibModules: someModules,
        }}
      >
        <OverridesTable filter={filter} openModuleDialog={openModuleDialog} />
      </ImportMapOverridesContext.Provider>
    );

    expect(
      screen.getAllByText("Dev Lib Override", { exact: false })
    ).toBeTruthy();
    expect(screen.getByText("module1")).toBeInTheDocument();
    expect(screen.getByText("module2")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("another.com")).toBeInTheDocument();
    expect(screen.getByText("module1.js")).toBeInTheDocument();
    expect(screen.getByText("module2.js")).toBeInTheDocument();
    expect(screen.getAllByText("Disable override")).toBeTruthy();

    expectOpenModuleDialog("imo-dev-lib-override");
    expectDisable();
  });

  it("renders the defaultModules", () => {
    render(
      <ImportMapOverridesContext.Provider
        value={{
          ...emptyImoContextData,
          defaultModules: someModules,
        }}
      >
        <OverridesTable filter={filter} openModuleDialog={openModuleDialog} />
      </ImportMapOverridesContext.Provider>
    );

    expect(screen.getAllByText("Default", { exact: false })).toBeTruthy();
    expect(screen.getByText("module1")).toBeInTheDocument();
    expect(screen.getByText("module2")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText("another.com")).toBeInTheDocument();
    expect(screen.getByText("module1.js")).toBeInTheDocument();
    expect(screen.getByText("module2.js")).toBeInTheDocument();
    expect(screen.getAllByText("Override")).toBeTruthy();

    expectOpenModuleDialog("imo-default-module");
  });
});
