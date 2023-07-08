import { includes } from "./includes";

describe("includes", () => {
  it("returns true if the item is in the array", () => {
    expect(includes([1, 2, 3], 2)).toBe(true);
  });

  it("returns false if the item is not in the array", () => {
    expect(includes([1, 2, 3], 4)).toBe(false);
  });

  it("throws an error if the first argument is not an array or string", () => {
    expect(() => includes(123, 1)).toThrow();
  });

  it("returns true if the string contains the substring", () => {
    expect(includes("hello-world", "world")).toBe(true);
  });

  it("returns false if the string does not contain the substring", () => {
    expect(includes("hello-world", "goodbye")).toBe(false);
  });
});
