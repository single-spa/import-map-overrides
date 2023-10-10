import { h } from "preact";
import { render, fireEvent, screen } from "@testing-library/preact";
import "@testing-library/jest-dom";
import ModuleDialog from "./module-dialog.component";

describe("ModuleDialog", () => {
  const module = {
    isNew: true,
    moduleName: "",
    overrideUrl: "",
    defaultUrl: "",
    statusClass: "",
  };

  const addNewModule = jest.fn();
  const close = jest.fn();
  const updateModuleUrl = jest.fn();

  beforeEach(() => {
    window.importMapOverrides = {
      getUrlFromPort: jest.fn(),
      isDisabled: jest.fn(),
      enableOverride: jest.fn(),
      disableOverride: jest.fn(),
    };
  });

  afterEach(() => {
    delete window.importMapOverrides;
  });

  it("renders the dialog with the correct title", () => {
    render(
      <ModuleDialog
        addNewModule={addNewModule}
        close={close}
        module={{
          isNew: false,
          moduleName: "wonderful-module",
          defaultUrl: "https://example.com",
        }}
        updateModuleUrl={updateModuleUrl}
      />
    );

    expect(screen.queryByLabelText("Module Name")).toBeNull();
    expect(screen.getByText("wonderful-module")).toBeInTheDocument();
    expect(screen.getByText("Default URL")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Override URL")).toBeInTheDocument();
  });

  it("extracts the port number to show in the override URL", () => {
    const overrideUrl = "//localhost:8080/wonderful-module.js";
    window.importMapOverrides.getUrlFromPort.mockReturnValue(overrideUrl);
    render(
      <ModuleDialog
        addNewModule={addNewModule}
        close={close}
        module={{
          isNew: false,
          moduleName: "wonderful-module",
          defaultUrl: "https://example.com",
          overrideUrl: overrideUrl,
        }}
        updateModuleUrl={updateModuleUrl}
      />
    );

    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Override URL")).toBeInTheDocument();
    expect(screen.getByDisplayValue("8080")).toBeInTheDocument();
  });

  it("renders the module name input when the module is new", () => {
    render(
      <ModuleDialog
        addNewModule={addNewModule}
        close={close}
        module={{
          isNew: true,
          moduleName: "",
        }}
        updateModuleUrl={updateModuleUrl}
      />
    );

    expect(screen.getByLabelText("Module Name")).toBeInTheDocument();
    expect(screen.getByLabelText("URL")).toBeInTheDocument();
  });

  it("renders the derived URL when the override URL is a port number", () => {
    const moduleWithPortOverrideUrl = {
      ...module,
      overrideUrl: "8080",
    };

    window.importMapOverrides.getUrlFromPort.mockReturnValue(
      "//my-localhost:1234/test.js"
    );
    render(
      <ModuleDialog
        addNewModule={addNewModule}
        close={close}
        module={moduleWithPortOverrideUrl}
        updateModuleUrl={updateModuleUrl}
      />
    );

    expect(screen.getByText("Derived URL")).toBeInTheDocument();
    expect(screen.getByText("//my-localhost:1234/test.js")).toBeInTheDocument();
  });

  it("calls the addNewModule function with the correct arguments when the form is submitted and the module is new", () => {
    const moduleName = "test-module";
    const overrideUrl = "https://example.com";

    render(
      <ModuleDialog
        addNewModule={addNewModule}
        close={close}
        module={module}
        updateModuleUrl={updateModuleUrl}
      />
    );

    const moduleNameInput = screen.getByLabelText("Module Name");
    fireEvent.input(moduleNameInput, { target: { value: moduleName } });

    const overrideUrlInput = screen.getByLabelText("URL");
    fireEvent.input(overrideUrlInput, { target: { value: overrideUrl } });

    const applyOverrideButton = screen.getByText("Apply override");
    fireEvent.click(applyOverrideButton);

    expect(addNewModule).toHaveBeenCalledWith(moduleName, overrideUrl);
  });

  it("calls the updateModuleUrl function with the correct arguments when the form is submitted and the module is not new", () => {
    const moduleName = "test-module";
    const overrideUrl = "https://example.com";
    const existingModule = {
      ...module,
      isNew: false,
      moduleName,
      overrideUrl,
    };

    render(
      <ModuleDialog
        addNewModule={addNewModule}
        close={close}
        module={existingModule}
        updateModuleUrl={updateModuleUrl}
      />
    );

    const overrideUrlInput = screen.getByLabelText("Override URL");
    fireEvent.input(overrideUrlInput, { target: { value: overrideUrl } });

    const applyOverrideButton = screen.getByText("Apply override");
    fireEvent.click(applyOverrideButton);

    expect(updateModuleUrl).toHaveBeenCalledWith(moduleName, overrideUrl);
  });

  it("calls enableModule when the form is submitted and the module is disabled", () => {
    const moduleName = "test-module";
    const overrideUrl = "https://example.com";
    const existingModule = {
      ...module,
      isNew: false,
      moduleName,
      overrideUrl,
      disabled: true,
    };
    window.importMapOverrides.isDisabled.mockReturnValue(true);

    render(
      <ModuleDialog
        addNewModule={addNewModule}
        close={close}
        module={existingModule}
        updateModuleUrl={updateModuleUrl}
      />
    );

    const overrideUrlInput = screen.getByLabelText("Override URL");
    fireEvent.input(overrideUrlInput, { target: { value: overrideUrl } });

    const applyOverrideButton = screen.getByText("Apply override");
    fireEvent.click(applyOverrideButton);

    expect(window.importMapOverrides.enableOverride).toHaveBeenCalledWith(
      moduleName
    );
  });

  it("calls disableModule when the Disable Override button is clicked", () => {
    const moduleName = "test-module";
    const overrideUrl = "https://example.com";
    const existingModule = {
      ...module,
      isNew: false,
      moduleName,
      overrideUrl,
      disabled: false,
    };

    render(
      <ModuleDialog
        addNewModule={addNewModule}
        close={close}
        module={existingModule}
        updateModuleUrl={updateModuleUrl}
      />
    );

    const disableOverrideButton = screen.getByText("Disable Override");
    fireEvent.click(disableOverrideButton);

    expect(window.importMapOverrides.disableOverride).toHaveBeenCalledWith(
      moduleName
    );
  });

  it("calls the close function when the Cancel button is clicked", () => {
    render(
      <ModuleDialog
        addNewModule={addNewModule}
        close={close}
        module={module}
        updateModuleUrl={updateModuleUrl}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(close).toHaveBeenCalled();
  });

  it("calls the close function when escape is pressed", () => {
    render(
      <ModuleDialog
        addNewModule={addNewModule}
        close={close}
        module={module}
        updateModuleUrl={updateModuleUrl}
      />
    );

    const dialog = screen.getByTestId("module-dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(close).toHaveBeenCalled();
  });
});
