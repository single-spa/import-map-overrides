import { applyOverrides, getOverridesFromCookies } from "../server/server-api";
import http from "http";
import { serialize } from "cookie";

describe("applyOverrides", () => {
  it("should apply overrides to the import map", () => {
    // Arrange
    const importMap = {
      imports: {
        package1: "https://cdn.skypack.dev/package1",
      },
    };
    const overrides = {
      package1: "https://unpkg.com/package1",
      package2: "https://unpkg.com/package2",
    };

    // Act
    const result = applyOverrides(importMap, overrides);

    // Assert
    expect(importMap.imports.package1).toBe("https://cdn.skypack.dev/package1");
    expect(result.imports.package1).toBe("https://unpkg.com/package1");
    expect(result.imports.package2).toBe("https://unpkg.com/package2");
    expect(result.scopes).toEqual({});
  });

  it("should handle empty overrides", () => {
    // Arrange
    const importMap = {
      imports: {
        package1: "https://cdn.skypack.dev/package1",
      },
    };
    const overrides = {};

    // Act
    const result = applyOverrides(importMap, overrides);

    // Assert
    expect(result.imports.package1).toBe("https://cdn.skypack.dev/package1");
    expect(result.scopes).toEqual({});
  });

  it("should handle overrides with scopes", () => {
    // Arrange
    const importMap = {
      imports: {
        package1: "https://cdn.skypack.dev/package1",
      },
      scopes: {
        "https://example.com/": {
          package2: "https://cdn.skypack.dev/package2",
        },
      },
    };
    const overrides = {
      package2: "https://unpkg.com/package2",
    };

    // Act
    const result = applyOverrides(importMap, overrides);

    // Assert
    expect(result.scopes["https://example.com/"].package2).toBe(
      "https://cdn.skypack.dev/package2",
    );
  });
});

describe("getOverridesFromCookies", () => {
  const req = new http.IncomingMessage();

  beforeEach(() => {
    req.headers = {};
  });

  it("should return an empty object if no cookies are set", () => {
    // Act
    const result = getOverridesFromCookies(req);

    // Assert
    expect(result).toEqual({});
  });

  it("should return overrides from cookies", () => {
    // Arrange
    req.headers.cookie = serialize(
      "import-map-override:package1",
      "https://unpkg.com/package1",
    );

    // Act
    const result = getOverridesFromCookies(req);

    // Assert
    expect(result.package1).toBe("https://unpkg.com/package1");
  });

  it("should handle multiple overrides from cookies", () => {
    // Arrange
    req.headers.cookie = [
      serialize("import-map-override:package1", "https://unpkg.com/package1"),
      serialize("import-map-override:package2", "https://unpkg.com/package2"),
    ].join("; ");

    // Act
    const result = getOverridesFromCookies(req);

    // Assert
    expect(result.package1).toBe("https://unpkg.com/package1");
    expect(result.package2).toBe("https://unpkg.com/package2");
  });

  it("should handle port numbers in cookies", () => {
    // Arrange
    req.headers.cookie = serialize("import-map-override:package1", "8080");

    // Act
    const result = getOverridesFromCookies(
      req,
      (port, moduleName) => `http://localhost:${port}/${moduleName}.js`,
    );

    // Assert
    expect(result.package1).toBe("http://localhost:8080/package1.js");
  });

  it("should handle protocol-relative URLs in cookies", () => {
    // Arrange
    req.protocol = "https";
    req.headers.cookie = serialize(
      "import-map-override:package1",
      "//unpkg.com/package1",
    );

    // Act
    const result = getOverridesFromCookies(req);

    // Assert
    expect(result.package1).toBe("https://unpkg.com/package1");
  });

  it("should ignore cookies that do not start with the correct prefix", () => {
    // Arrange
    req.headers.cookie = serialize("some-other-cookie", "some-value");

    // Act
    const result = getOverridesFromCookies(req);

    // Assert
    expect(result).toEqual({});
  });

  it("should handle cookies with empty module names", () => {
    // Arrange
    req.headers.cookie = serialize(
      "import-map-override:",
      "https://unpkg.com/package1",
    );

    // Act
    const result = getOverridesFromCookies(req);

    // Assert
    expect(result).toEqual({});
  });
});
