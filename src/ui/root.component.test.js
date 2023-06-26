import { h } from "preact";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/preact";
import Root from "./root.component";

jest.mock("./components/full-ui.component", () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="mocked-full-ui">{JSON.stringify(props)}</div>
  ),
}));

jest.mock("./contexts/imo-context-provider.component", () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="mocked-imo-context-provider">{props.children}</div>
  ),
}));

describe("Root", () => {
  it("renders the FullUI component with the correct props", () => {
    const props = {
      foo: "bar",
      baz: "qux",
    };
    render(<Root {...props} />);
    expect(
      screen.getByTestId("mocked-imo-context-provider")
    ).toBeInTheDocument();
    expect(screen.getByTestId("mocked-full-ui")).toBeInTheDocument();
    expect(screen.getByTestId("mocked-full-ui")).toHaveTextContent(
      JSON.stringify(props)
    );
  });
});
