import { h } from "preact";
import { render, fireEvent, screen } from "@testing-library/preact";
import "@testing-library/jest-dom";
import List from "./list.component";

jest.mock("./overrides-table.component", () => ({ filter }) => (
  <div data-testid="overrides-table">{filter}</div>
));
jest.mock("./ext-importmaps-table.component", () => () => (
  <div data-testid="ext-importmaps-table" />
));
jest.mock("./module-dialog.component", () => () => (
  <div data-testid="module-dialog" />
));
jest.mock("./ext-importmap-dialog.component", () => () => (
  <div data-testid="ext-importmap-dialog" />
));

describe("List", () => {
  beforeEach(() => {
    window.importMapOverrides = {
      getExternalOverrides: jest.fn(() => []),
      getCurrentPageExternalOverrides: jest.fn(() => []),
      invalidExternalMaps: [],
      resetOverrides: jest.fn(),
      addOverride: jest.fn(),
      removeOverride: jest.fn(),
    };
  });

  afterEach(() => {
    delete window.importMapOverrides;
  });

  it("renders the main elements", () => {
    render(<List />);

    expect(screen.getByLabelText("Search modules")).toBeInTheDocument();
    expect(screen.getByText("Reset all overrides")).toBeInTheDocument();
    expect(screen.getByTestId("overrides-table")).toBeInTheDocument();
    expect(screen.getByTestId("ext-importmaps-table")).toBeInTheDocument();
  });

  it("opens the module dialog when the add new module button is clicked", () => {
    render(<List />);

    expect(screen.queryByTestId("module-dialog")).toBeNull();

    const addNewModuleButton = screen.getByText("Add new module");
    fireEvent.click(addNewModuleButton);

    expect(screen.getByTestId("module-dialog")).toBeInTheDocument();
  });

  it("opens the import map dialog when the add import map button is clicked", () => {
    render(<List />);

    expect(screen.queryByTestId("ext-importmap-dialog")).toBeNull();

    const addImportMapButton = screen.getByText("Add import map");
    fireEvent.click(addImportMapButton);

    expect(screen.getByTestId("ext-importmap-dialog")).toBeInTheDocument();
  });

  it("calls the resetOverrides function when the reset button is clicked", () => {
    render(<List />);

    const resetButton = screen.getByText("Reset all overrides");
    fireEvent.click(resetButton);

    expect(window.importMapOverrides.resetOverrides).toHaveBeenCalled();
  });

  it("renders the override table with the correct filter when searching for a module", () => {
    render(<List />);

    const searchInput = screen.getByLabelText("Search modules");
    fireEvent.input(searchInput, { target: { value: "strange-filter" } });

    expect(screen.getByTestId("overrides-table")).toHaveTextContent(
      "strange-filter"
    );
  });
});
