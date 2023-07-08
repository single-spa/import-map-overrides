import { escapeStringRegexp } from "./string-regex";

describe("escapeStringRegexp", () => {
  it("escapes a string for use in a regular expression", () => {
    expect(escapeStringRegexp("hello-world")).toBe("hello\\x2dworld");
  });

  it("throws an error if the argument is not a string", () => {
    expect(() => escapeStringRegexp(123)).toThrow();
  });
});
