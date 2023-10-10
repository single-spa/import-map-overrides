import { overridesBesidesDevLibs } from "./dev-libs";

describe("overridesBesidesDevLibs", () => {
  beforeEach(() => {
    window.importMapOverrides = {
      getOverrideMap: jest.fn(),
    };
  });

  afterEach(() => {
    delete window.importMapOverrides;
  });

  it("returns false when there are no overrides besides dev libs", () => {
    window.importMapOverrides.getOverrideMap.mockReturnValueOnce({
      imports: {
        react: "https://cdn.example.com/dev-libs.js",
        "react-dom": "https://cdn.example.com/react-dom.production.min.js",
        "vue-router": "https://cdn.example.com/vue-router.production.min.js",
      },
    });

    expect(overridesBesidesDevLibs()).toBe(false);
  });

  it("returns true when there are overrides besides dev libs", () => {
    window.importMapOverrides.getOverrideMap.mockReturnValueOnce({
      imports: {
        react: "https://cdn.example.com/react.production.min.js",
        "react-dom": "https://cdn.example.com/react-dom.production.min.js",
        "something-else": "https://cdn.example.com/something-else.js",
      },
    });

    expect(overridesBesidesDevLibs()).toBe(true);
  });
});
