import "regenerator-runtime/runtime";

describe("window.importMapOverrides", () => {
  const defaultMap = `<script type="importmap">
  {
    "imports": {
      "package1": "https://cdn.skypack.dev/package1",
      "package2": "https://cdn.skypack.dev/package2",
      "package3": "https://cdn.skypack.dev/package3"
    }
  }
  </script>`;

  beforeEach(jest.resetModules);

  const setDocumentAndLoadScript = (additionalContent) => {
    document.body.innerHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        ${defaultMap}
        ${additionalContent || ""}
      </head>
      <body></body>
    </html>
    `;
    return import("./js-api");
  };

  // Test getDefaultMap
  it("should return the default inline map", async () => {
    await setDocumentAndLoadScript();
    const map = await window.importMapOverrides.getDefaultMap();

    expect(map).toEqual({
      imports: {
        package1: "https://cdn.skypack.dev/package1",
        package2: "https://cdn.skypack.dev/package2",
        package3: "https://cdn.skypack.dev/package3",
      },
      scopes: {},
    });
  });
});
