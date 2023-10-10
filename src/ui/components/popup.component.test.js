import { h } from "preact";
import { render, fireEvent, screen } from "@testing-library/preact";
import "@testing-library/jest-dom";
import Popup from "./popup.component";

jest.mock("./list.component", () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-list" />,
}));

describe("Popup", () => {
  it("renders the component with the correct content", () => {
    render(<Popup />);

    expect(screen.getByText("Import Map Overrides")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This developer tool allows you to view and override your import maps. Start by clicking on a module that you'd like to override.",
        { exact: false }
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("See documentation for more info")
    ).toBeInTheDocument();
    expect(screen.getByTestId("mocked-list")).toBeInTheDocument();
  });

  it("calls the close prop when the close button is clicked", () => {
    const close = jest.fn();
    render(<Popup close={close} />);
    fireEvent.click(screen.getByTestId("close-btn"));
    expect(close).toHaveBeenCalled();
  });

  it("calls the close prop when the escape key is pressed", () => {
    const close = jest.fn();
    render(<Popup close={close} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(close).toHaveBeenCalled();
  });
});
