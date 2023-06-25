import { isDisabled, queryParamOverridesName } from "./js-api";

describe("js-api", () => {
  it("isDisabled should be false by default", () => {
    expect(isDisabled).toBe(false);
  });

  it("queryParamOverridesName should be imo by default", () => {
    expect(queryParamOverridesName).toBe("imo");
  });

  it("should create a global object importMapOverrides", () => {
    expect(window.importMapOverrides).toBeDefined();
  });
});
