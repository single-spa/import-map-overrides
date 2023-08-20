import { h } from "preact";
import { useContext } from "preact/hooks";
import { render, screen, waitFor } from "@testing-library/preact";
import ImportMapOverridesContextProvider, {
  ImportMapOverridesContext,
} from "./imo-context-provider.component";
import "@testing-library/jest-dom";

const TestComponent = () => {
  const {
    overriddenModules,
    nextOverriddenModules,
    disabledOverrides,
    defaultModules,
    externalOverrideModules,
    pendingRefreshDefaultModules,
    devLibModules,
    hasPendingModulesToRefresh,
    hasOverriddenModules,
  } = useContext(ImportMapOverridesContext);

  return (
    <div>
      <div data-testid="overridden-modules">
        {JSON.stringify(overriddenModules)}
      </div>
      <div data-testid="next-overridden-modules">
        {JSON.stringify(nextOverriddenModules)}
      </div>
      <div data-testid="disabled-overrides">
        {JSON.stringify(disabledOverrides)}
      </div>
      <div data-testid="default-modules">{JSON.stringify(defaultModules)}</div>
      <div data-testid="external-override-modules">
        {JSON.stringify(externalOverrideModules)}
      </div>
      <div data-testid="pending-refresh-default-modules">
        {JSON.stringify(pendingRefreshDefaultModules)}
      </div>
      <div data-testid="dev-lib-modules">{JSON.stringify(devLibModules)}</div>
      {hasPendingModulesToRefresh && (
        <div data-testid="has-pending-modules-to-refresh"></div>
      )}
      {hasOverriddenModules && <div data-testid="has-overridden-modules"></div>}
    </div>
  );
};

describe("ImportMapOverridesContextProvider", () => {
  const defaultMap = {
    imports: {
      module1: "https://cdn.skypack.dev/package1",
      module2: "https://cdn.skypack.dev/package2",
      module3: "https://cdn.skypack.dev/package3",
      module4: "https://cdn.skypack.dev/package4",
    },
  };

  afterEach(() => {
    delete window.importMapOverrides;
  });

  it("provides modules in the default map", async () => {
    const overrideMap = {
      imports: {},
    };
    const currentPageMap = {
      imports: {
        module1: "https://cdn.skypack.dev/package1",
        module2: "https://cdn.skypack.dev/package2",
        module3: "https://cdn.skypack.dev/package3",
      },
    };
    const nextPageMap = {
      imports: {
        module1: "https://cdn.skypack.dev/package1",
        module2: "https://cdn.skypack.dev/package2",
        module3: "https://cdn.skypack.dev/package3",
      },
    };

    // Mock the functions that return the import maps
    window.importMapOverrides = {
      getOverrideMap: jest.fn().mockReturnValue(overrideMap),
      getDefaultMap: jest.fn().mockResolvedValue(defaultMap),
      getDisabledOverrides: jest.fn().mockReturnValue([]),
      getCurrentPageMap: jest.fn().mockResolvedValue(currentPageMap),
      getNextPageMap: jest.fn().mockResolvedValue(nextPageMap),
    };

    render(
      <ImportMapOverridesContextProvider>
        <TestComponent />
      </ImportMapOverridesContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("default-modules")).toHaveTextContent(
        JSON.stringify([
          {
            moduleName: "module1",
            defaultUrl: "https://cdn.skypack.dev/package1",
            disabled: false,
          },
          {
            moduleName: "module2",
            defaultUrl: "https://cdn.skypack.dev/package2",
            disabled: false,
          },
          {
            moduleName: "module3",
            defaultUrl: "https://cdn.skypack.dev/package3",
            disabled: false,
          },
        ])
      );
    });
    expect(screen.getByTestId("next-overridden-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("overridden-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("disabled-overrides")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("external-override-modules")).toHaveTextContent(
      JSON.stringify([
        {
          moduleName: "module4",
          defaultUrl: "https://cdn.skypack.dev/package4",
          disabled: false,
        },
      ])
    );
    expect(
      screen.getByTestId("pending-refresh-default-modules")
    ).toHaveTextContent(JSON.stringify([]));
    expect(screen.getByTestId("dev-lib-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.queryByTestId("has-pending-modules-to-refresh")).toBeNull();
    expect(screen.queryByTestId("has-overridden-modules")).toBeNull();
  });

  it("provides modules to be overridden next", async () => {
    const overrideMap = {
      imports: {
        module2: "https://cdn.overridden.dev/package22",
      },
    };
    const currentPageMap = {
      imports: {
        module1: "https://cdn.skypack.dev/package1",
        module2: "https://cdn.skypack.dev/package2",
        module3: "https://cdn.skypack.dev/package3",
      },
    };
    const nextPageMap = {
      imports: {
        module1: "https://cdn.skypack.dev/package1",
        module2: "https://cdn.overridden.dev/package22",
        module3: "https://cdn.skypack.dev/package3",
      },
    };

    // Mock the functions that return the import maps
    window.importMapOverrides = {
      getOverrideMap: jest.fn().mockReturnValue(overrideMap),
      getDefaultMap: jest.fn().mockResolvedValue(defaultMap),
      getDisabledOverrides: jest.fn().mockReturnValue([]),
      getCurrentPageMap: jest.fn().mockResolvedValue(currentPageMap),
      getNextPageMap: jest.fn().mockResolvedValue(nextPageMap),
    };

    render(
      <ImportMapOverridesContextProvider>
        <TestComponent />
      </ImportMapOverridesContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("next-overridden-modules")).toHaveTextContent(
        JSON.stringify([
          {
            moduleName: "module2",
            defaultUrl: "https://cdn.skypack.dev/package2",
            overrideUrl: "https://cdn.overridden.dev/package22",
            disabled: false,
          },
        ])
      );
    });
    expect(screen.getByTestId("overridden-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("disabled-overrides")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("default-modules")).toHaveTextContent(
      JSON.stringify([
        {
          moduleName: "module1",
          defaultUrl: "https://cdn.skypack.dev/package1",
          disabled: false,
        },
        {
          moduleName: "module3",
          defaultUrl: "https://cdn.skypack.dev/package3",
          disabled: false,
        },
      ])
    );
    expect(screen.getByTestId("external-override-modules")).toHaveTextContent(
      JSON.stringify([
        {
          moduleName: "module4",
          defaultUrl: "https://cdn.skypack.dev/package4",
          disabled: false,
        },
      ])
    );
    expect(
      screen.getByTestId("pending-refresh-default-modules")
    ).toHaveTextContent(JSON.stringify([]));
    expect(screen.getByTestId("dev-lib-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(
      screen.getByTestId("has-pending-modules-to-refresh")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("has-overridden-modules")).toBeNull();
  });

  it("provides overridden modules", async () => {
    const overrideMap = {
      imports: {
        module2: "https://cdn.overridden.dev/package22",
      },
    };
    const currentPageMap = {
      imports: {
        module1: "https://cdn.skypack.dev/package1",
        module2: "https://cdn.overridden.dev/package22",
        module3: "https://cdn.skypack.dev/package3",
      },
    };
    const nextPageMap = currentPageMap;

    // Mock the functions that return the import maps
    window.importMapOverrides = {
      getOverrideMap: jest.fn().mockReturnValue(overrideMap),
      getDefaultMap: jest.fn().mockResolvedValue(defaultMap),
      getDisabledOverrides: jest.fn().mockReturnValue([]),
      getCurrentPageMap: jest.fn().mockResolvedValue(currentPageMap),
      getNextPageMap: jest.fn().mockResolvedValue(nextPageMap),
    };

    render(
      <ImportMapOverridesContextProvider>
        <TestComponent />
      </ImportMapOverridesContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("overridden-modules")).toHaveTextContent(
        JSON.stringify([
          {
            moduleName: "module2",
            defaultUrl: "https://cdn.skypack.dev/package2",
            overrideUrl: "https://cdn.overridden.dev/package22",
            disabled: false,
          },
        ])
      );
    });
    expect(screen.getByTestId("next-overridden-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("disabled-overrides")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("default-modules")).toHaveTextContent(
      JSON.stringify([
        {
          moduleName: "module1",
          defaultUrl: "https://cdn.skypack.dev/package1",
          disabled: false,
        },
        {
          moduleName: "module3",
          defaultUrl: "https://cdn.skypack.dev/package3",
          disabled: false,
        },
      ])
    );
    expect(screen.getByTestId("external-override-modules")).toHaveTextContent(
      JSON.stringify([
        {
          moduleName: "module4",
          defaultUrl: "https://cdn.skypack.dev/package4",
          disabled: false,
        },
      ])
    );
    expect(
      screen.getByTestId("pending-refresh-default-modules")
    ).toHaveTextContent(JSON.stringify([]));
    expect(screen.getByTestId("dev-lib-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.queryByTestId("has-pending-modules-to-refresh")).toBeNull();
    expect(screen.getByTestId("has-overridden-modules")).toBeInTheDocument();
  });

  it("provides disabled overrides", async () => {
    const overrideMap = {
      imports: {
        module2: "https://cdn.overridden.dev/package22",
      },
    };
    const currentPageMap = {
      imports: {
        module1: "https://cdn.skypack.dev/package1",
        module2: "https://cdn.overridden.dev/package22",
        module3: "https://cdn.skypack.dev/package3",
      },
    };
    const nextPageMap = currentPageMap;

    // Mock the functions that return the import maps
    window.importMapOverrides = {
      getOverrideMap: jest.fn().mockReturnValue(overrideMap),
      getDefaultMap: jest.fn().mockResolvedValue(defaultMap),
      getDisabledOverrides: jest.fn().mockReturnValue(["module2"]),
      getCurrentPageMap: jest.fn().mockResolvedValue(currentPageMap),
      getNextPageMap: jest.fn().mockResolvedValue(nextPageMap),
    };

    render(
      <ImportMapOverridesContextProvider>
        <TestComponent />
      </ImportMapOverridesContextProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("disabled-overrides")).toHaveTextContent(
        JSON.stringify([
          {
            moduleName: "module2",
            defaultUrl: "https://cdn.skypack.dev/package2",
            overrideUrl: "https://cdn.overridden.dev/package22",
            disabled: true,
          },
        ])
      );
    });
    expect(screen.getByTestId("next-overridden-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("overridden-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("default-modules")).toHaveTextContent(
      JSON.stringify([
        {
          moduleName: "module1",
          defaultUrl: "https://cdn.skypack.dev/package1",
          disabled: false,
        },
        {
          moduleName: "module3",
          defaultUrl: "https://cdn.skypack.dev/package3",
          disabled: false,
        },
      ])
    );
    expect(screen.getByTestId("external-override-modules")).toHaveTextContent(
      JSON.stringify([
        {
          moduleName: "module4",
          defaultUrl: "https://cdn.skypack.dev/package4",
          disabled: false,
        },
      ])
    );
    expect(
      screen.getByTestId("pending-refresh-default-modules")
    ).toHaveTextContent(JSON.stringify([]));
    expect(screen.getByTestId("dev-lib-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.queryByTestId("has-pending-modules-to-refresh")).toBeNull();
    expect(screen.queryByTestId("has-overridden-modules")).toBeNull();
  });

  it("provides modules to be refreshed", async () => {
    const overrideMap = {
      imports: {},
    };
    const currentPageMap = {
      imports: {
        module1: "https://cdn.skypack.dev/package1",
        module2: "https://cdn.overridden.dev/package22",
        module3: "https://cdn.skypack.dev/package3",
      },
    };
    const nextPageMap = {
      imports: {
        module1: "https://cdn.skypack.dev/package1",
        module2: "https://cdn.skypack.dev/package2",
        module3: "https://cdn.skypack.dev/package3",
      },
    };

    // Mock the functions that return the import maps
    window.importMapOverrides = {
      getOverrideMap: jest.fn().mockReturnValue(overrideMap),
      getDefaultMap: jest.fn().mockResolvedValue(defaultMap),
      getDisabledOverrides: jest.fn().mockReturnValue([]),
      getCurrentPageMap: jest.fn().mockResolvedValue(currentPageMap),
      getNextPageMap: jest.fn().mockResolvedValue(nextPageMap),
    };

    render(
      <ImportMapOverridesContextProvider>
        <TestComponent />
      </ImportMapOverridesContextProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("pending-refresh-default-modules")
      ).toHaveTextContent(
        JSON.stringify([
          {
            moduleName: "module2",
            defaultUrl: "https://cdn.skypack.dev/package2",
            disabled: false,
          },
        ])
      );
    });
    expect(screen.getByTestId("next-overridden-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("overridden-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("disabled-overrides")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(screen.getByTestId("default-modules")).toHaveTextContent(
      JSON.stringify([
        {
          moduleName: "module1",
          defaultUrl: "https://cdn.skypack.dev/package1",
          disabled: false,
        },
        {
          moduleName: "module3",
          defaultUrl: "https://cdn.skypack.dev/package3",
          disabled: false,
        },
      ])
    );
    expect(screen.getByTestId("external-override-modules")).toHaveTextContent(
      JSON.stringify([
        {
          moduleName: "module4",
          defaultUrl: "https://cdn.skypack.dev/package4",
          disabled: false,
        },
      ])
    );
    expect(screen.getByTestId("dev-lib-modules")).toHaveTextContent(
      JSON.stringify([])
    );
    expect(
      screen.getByTestId("has-pending-modules-to-refresh")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("has-overridden-modules")).toBeNull();
  });
});
