import { h } from "preact";
import { render, fireEvent, screen } from "@testing-library/preact";
import "@testing-library/jest-dom";
import ExternalImportmapsTable from "./ext-importmaps-table.component";

describe("ExternalImportmapsTable", () => {
  const importMaps = [
    "https://example.com/import-map.json",
    "https://example.org/import-map.json",
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

  it("renders the table with the correct headers", () => {
    render(
      <ExternalImportmapsTable
        brokenMaps={[]}
        workingCurrentPageMaps={importMaps}
        workingNextPageMaps={[]}
      />
    );

    expect(screen.getByText("Import Map Status")).toBeInTheDocument();
    expect(screen.getByText("URL")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("renders the working current import maps in the table", () => {
    render(
      <ExternalImportmapsTable
        brokenMaps={[]}
        workingCurrentPageMaps={[
          "https://example.com/import-map.json",
          "https://example.org/import-map.json",
        ]}
        workingNextPageMaps={[]}
      />
    );

    expect(
      screen.getByText("https://example.com/import-map.json")
    ).toBeInTheDocument();
    expect(
      screen.getByText("https://example.org/import-map.json")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Override")).toBeTruthy();
  });

  it("renders the working next import maps in the table", () => {
    render(
      <ExternalImportmapsTable
        brokenMaps={[]}
        workingCurrentPageMaps={[]}
        workingNextPageMaps={[
          "https://example.com/import-map.json",
          "https://example.org/import-map.json",
        ]}
      />
    );

    expect(
      screen.getByText("https://example.com/import-map.json")
    ).toBeInTheDocument();
    expect(
      screen.getByText("https://example.org/import-map.json")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Pending refresh")).toBeTruthy();
  });

  it("renders the broken import maps in the table", () => {
    render(
      <ExternalImportmapsTable
        brokenMaps={[
          "https://example.com/import-map.json",
          "https://example.org/import-map.json",
        ]}
        workingCurrentPageMaps={[]}
        workingNextPageMaps={[]}
      />
    );

    expect(
      screen.getByText("https://example.com/import-map.json")
    ).toBeInTheDocument();
    expect(
      screen.getByText("https://example.org/import-map.json")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Invalid")).toBeTruthy();
  });

  it("calls the openDialogExternalMap function when clicking on a broken map row", () => {
    const openDialogExternalMap = jest.fn();

    render(
      <ExternalImportmapsTable
        brokenMaps={importMaps}
        workingCurrentPageMaps={[]}
        workingNextPageMaps={[]}
        openDialogExternalMap={openDialogExternalMap}
      />
    );

    fireEvent.click(screen.getByText("https://example.com/import-map.json"));

    expect(openDialogExternalMap).toBeCalledWith({
      isNew: false,
      url: "https://example.com/import-map.json",
    });
  });

  it("calls the openDialogExternalMap function when clicking on a next map row", () => {
    const openDialogExternalMap = jest.fn();

    render(
      <ExternalImportmapsTable
        brokenMaps={[]}
        workingCurrentPageMaps={[]}
        workingNextPageMaps={importMaps}
        openDialogExternalMap={openDialogExternalMap}
      />
    );

    fireEvent.click(screen.getByText("https://example.com/import-map.json"));

    expect(openDialogExternalMap).toBeCalledWith({
      isNew: false,
      url: "https://example.com/import-map.json",
    });
  });

  it("calls the openDialogExternalMap function when clicking on a current map row", () => {
    const openDialogExternalMap = jest.fn();

    render(
      <ExternalImportmapsTable
        brokenMaps={[]}
        workingCurrentPageMaps={importMaps}
        workingNextPageMaps={[]}
        openDialogExternalMap={openDialogExternalMap}
      />
    );

    fireEvent.click(screen.getByText("https://example.com/import-map.json"));

    expect(openDialogExternalMap).toBeCalledWith({
      isNew: false,
      url: "https://example.com/import-map.json",
    });
  });

  it("calls the reload function when clicking on the refresh button", () => {
    const reload = jest.spyOn(window.location, "reload");

    render(
      <ExternalImportmapsTable
        brokenMaps={[]}
        workingCurrentPageMaps={[]}
        workingNextPageMaps={["https://example.com/import-map.json"]}
      />
    );

    fireEvent.click(screen.getByText("Refresh to apply changes"));

    expect(window.location.reload).toHaveBeenCalled();
  });
});
