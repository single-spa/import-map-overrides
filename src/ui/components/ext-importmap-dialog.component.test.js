import { h } from "preact";
import { render, fireEvent, screen } from "@testing-library/preact";
import "@testing-library/jest-dom";
import ExternalImportMapDialog from "./ext-importmap-dialog.component";

describe("ExternalImportMapDialog", () => {
  const dialogExternalMap = {
    isNew: true,
    url: "",
  };

  it("renders the dialog with the correct title", () => {
    render(
      <ExternalImportMapDialog
        close={() => {}}
        dialogExternalMap={dialogExternalMap}
      />
    );

    expect(screen.getByText("Add External Import Map")).toBeInTheDocument();
  });

  it("renders the dialog with the correct title when editing an existing map", () => {
    const existingMap = {
      isNew: false,
      url: "https://example.com/import-map.json",
    };
    render(
      <ExternalImportMapDialog
        close={() => {}}
        dialogExternalMap={existingMap}
      />
    );

    expect(screen.getByText("Edit External Import Map")).toBeInTheDocument();
  });

  it("calls the close function when the cancel button is clicked", () => {
    const handleClose = jest.fn();
    render(
      <ExternalImportMapDialog
        close={handleClose}
        dialogExternalMap={dialogExternalMap}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it("calls the close function when the escape key is pressed", () => {
    const handleClose = jest.fn();
    render(
      <ExternalImportMapDialog
        close={handleClose}
        dialogExternalMap={dialogExternalMap}
      />
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(handleClose).toHaveBeenCalled();
  });

  describe("when submitting", () => {
    beforeEach(() => {
      window.importMapOverrides = {
        removeExternalOverride: jest.fn(),
        addExternalOverride: jest.fn(),
      };
    });

    afterEach(() => {
      delete window.importMapOverrides;
    });

    it("calls the addExternalOverride function with the specified map URL", () => {
      const handleSubmit = jest.fn();
      render(
        <ExternalImportMapDialog
          close={() => {}}
          dialogExternalMap={dialogExternalMap}
        />
      );

      const urlInput = screen.getByLabelText("URL to import map");
      fireEvent.input(urlInput, {
        target: { value: "https://example.com/importmap.json" },
      });

      const applyButton = screen.getByText("Apply override");
      fireEvent.click(applyButton);

      expect(
        window.importMapOverrides.addExternalOverride
      ).toHaveBeenCalledWith("https://example.com/importmap.json");
    });

    it("calls the removeExternalOverride function when the form is submitted with an empty URL", () => {
      const removeExternalOverride = jest.fn();
      const existingMap = {
        isNew: false,
        url: "https://example.com/importmap-to-remove.json",
      };
      render(
        <ExternalImportMapDialog
          close={() => {}}
          dialogExternalMap={existingMap}
        />
      );

      const urlInput = screen.getByLabelText("URL to import map");
      fireEvent.input(urlInput, {
        target: { value: "" },
      });

      const removeButton = screen.getByText("Remove map");
      fireEvent.click(removeButton);

      expect(
        window.importMapOverrides.removeExternalOverride
      ).toHaveBeenCalledWith("https://example.com/importmap-to-remove.json");
    });
  });
});
