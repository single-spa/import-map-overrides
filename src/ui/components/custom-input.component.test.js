import { h } from "preact";
import { render, fireEvent, screen } from "@testing-library/preact";
import "@testing-library/jest-dom";
import { CustomInput } from "./custom-input.component";

describe("CustomInput", () => {
  it("renders an input element with the provided props", () => {
    render(
      <CustomInput
        id="test-input"
        value="test value"
        onChange={() => {}}
        ariaLabelledBy="test-label"
        inputRef={{ current: null }}
        required={true}
      />
    );

    const input = screen.getByDisplayValue("test value");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "test-input");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("tabindex", "1");
    expect(input).toHaveAttribute("required");
  });

  it("calls the onChange function when the input value changes", () => {
    const handleChange = jest.fn();
    render(
      <CustomInput
        id="test-input"
        value="test value"
        onChange={handleChange}
        ariaLabelledBy="test-label"
        inputRef={{ current: null }}
        required={true}
      />
    );

    const input = screen.getByDisplayValue("test value");
    fireEvent.input(input, { target: { value: "new value" } });

    expect(handleChange).toHaveBeenCalledWith("new value");
  });

  it("resets the input value when the reset button is clicked", () => {
    const handleChange = jest.fn();
    render(
      <CustomInput
        id="test-input"
        value="test value"
        onChange={handleChange}
        ariaLabelledBy="test-label"
        inputRef={{ current: { focus: jest.fn() } }}
        required={true}
      />
    );

    const input = screen.getByDisplayValue("test value");
    fireEvent.input(input, { target: { value: "new value" } });

    const resetButton = screen.getByRole("button");
    fireEvent.click(resetButton);

    expect(handleChange).toHaveBeenCalledWith("");
    expect(input).toHaveFocus();
  });

  it("renders an icon when the icon prop is specified", () => {
    render(
      <CustomInput
        id="test-input"
        value="test value"
        onChange={() => {}}
        ariaLabelledBy="test-label"
        inputRef={{ current: null }}
        required={true}
        icon={<svg data-testid="test-icon" />}
      />
    );

    const icon = screen.getByTestId("test-icon");

    expect(icon).toBeInTheDocument();
  });
});
