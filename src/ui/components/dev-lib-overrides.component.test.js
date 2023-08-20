import { h } from "preact";
import { render, waitFor } from "@testing-library/preact";
import DevLibOverrides from "./dev-lib-overrides.component";

describe("DevLibOverrides", () => {
  beforeEach(() => {
    window.importMapOverrides = {
      getCurrentPageMap: jest.fn(),
      addOverride: jest.fn(),
    };
  });

  afterEach(() => {
    delete window.importMapOverrides;
  });

  it("calls addDevLibOverrides when the component mounts", async () => {
    window.importMapOverrides.getCurrentPageMap.mockResolvedValueOnce({
      imports: {
        react: "https://cdn.skypack.dev/package1",
        "react-dom": "https://cdn.skypack.dev/package2",
        module3: "https://cdn.skypack.dev/package3",
      },
    });

    render(<DevLibOverrides />);

    expect(window.importMapOverrides.getCurrentPageMap).toHaveBeenCalled();
    await waitFor(() =>
      expect(window.importMapOverrides.addOverride).toHaveBeenCalledTimes(2)
    );
  });
});
