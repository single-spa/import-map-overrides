import { getParameterByName } from "./url-parameter";

describe("getParameterByName", () => {
  it("returns the value of the specified parameter", () => {
    const url = "http://localhost:3000/?name=Brian";
    expect(getParameterByName("name", url)).toBe("Brian");
  });

  it("returns null if the parameter is not present", () => {
    const url = "http://localhost:3000/";
    expect(getParameterByName("name", url)).toBe(null);
  });

  it("decodes the value of the parameter", () => {
    const url = "http://localhost:3000/?name=Brian%20Love";
    expect(getParameterByName("name", url)).toBe("Brian Love");
  });
});
