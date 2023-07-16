import "regenerator-runtime/runtime";

// Mocks for the localStorage
const localStorageMock = (function () {
  let store = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    key(index) {
      return Object.keys(store)[index] || null;
    },
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

describe("window.importMapOverrides", () => {
  let localStorageBackup;

  const defaultMap = `<script type="importmap">
  {
    "imports": {
      "package1": "https://cdn.skypack.dev/package1",
      "package2": "https://cdn.skypack.dev/package2",
      "package3": "https://cdn.skypack.dev/package3"
    }
  }
  </script>`;

  beforeEach(() => {
    jest.resetModules();
    fetch.resetMocks();
    localStorageBackup = window.localStorage;
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageBackup,
    });
  });

  const setDocumentAndLoadScript = (maps = [defaultMap]) => {
    document.head.innerHTML = `${maps.map((map) => map || "").join("\n")}`;
    return import("./js-api");
  };

  describe("getDefaultMap", () => {
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

    // Test getDefaultMap
    // Test the case where there is no default map
    it("should return an empty map when there is no default map", async () => {
      await setDocumentAndLoadScript([""]);
      const map = await window.importMapOverrides.getDefaultMap();

      expect(map).toEqual({
        imports: {},
        scopes: {},
      });
    });

    // Test the case where the map is empty
    it("should return an empty map when the default map is empty", async () => {
      await setDocumentAndLoadScript(["<script type='importmap'></script>"]);
      const map = await window.importMapOverrides.getDefaultMap();

      expect(map).toEqual({
        imports: {},
        scopes: {},
      });
    });

    // Test the case where the map is malformed
    it("should return an empty map when the default map is malformed", async () => {
      await setDocumentAndLoadScript([
        "<script type='importmap'>Malformed</script>",
      ]);
      const map = await window.importMapOverrides.getDefaultMap();

      expect(map).toEqual({
        imports: {},
        scopes: {},
      });
    });

    // Test the case where there are multiple inline maps
    it("should return the union of all maps when there are multiple inline maps", async () => {
      await setDocumentAndLoadScript([
        defaultMap,
        `<script type="importmap">
      {
        "imports": {
          "package4": "https://cdn.skypack.dev/package4",
          "package5": "https://cdn.skypack.dev/package5",
          "package6": "https://cdn.skypack.dev/package6"
        }
      }
      </script>`,
      ]);
      const map = await window.importMapOverrides.getDefaultMap();

      expect(map).toEqual({
        imports: {
          package1: "https://cdn.skypack.dev/package1",
          package2: "https://cdn.skypack.dev/package2",
          package3: "https://cdn.skypack.dev/package3",
          package4: "https://cdn.skypack.dev/package4",
          package5: "https://cdn.skypack.dev/package5",
          package6: "https://cdn.skypack.dev/package6",
        },
        scopes: {},
      });
    });

    // Test the case where there are multiple maps and one has the attribute
    // data-is-importmap-override
    it("should return the union of all maps except the ones having the attribute data-is-importmap-override", async () => {
      await setDocumentAndLoadScript([
        defaultMap,
        `<script type="importmap" data-is-importmap-override>
      {
        "imports": {
          "package4": "https://cdn.skypack.dev/package4",
          "package5": "https://cdn.skypack.dev/package5",
        }
      }
      </script>`,
        `<script type="importmap">
      {
        "imports": {
          "package6": "https://cdn.skypack.dev/package6",
          "package7": "https://cdn.skypack.dev/package7"
        }
      }
      </script>`,
      ]);
      const map = await window.importMapOverrides.getDefaultMap();

      expect(map).toEqual({
        imports: {
          package1: "https://cdn.skypack.dev/package1",
          package2: "https://cdn.skypack.dev/package2",
          package3: "https://cdn.skypack.dev/package3",
          package6: "https://cdn.skypack.dev/package6",
          package7: "https://cdn.skypack.dev/package7",
        },
        scopes: {},
      });
    });

    // Test the case where there are multiple maps and one is external
    it("should return the union of all maps including the external ones", async () => {
      await setDocumentAndLoadScript([
        defaultMap,
        `<script type="importmap" src="https://example.com/importmap.json"></script>`,
      ]);

      fetch.mockResponseOnce(
        JSON.stringify({
          imports: {
            package4: "https://cdn.skypack.dev/package4",
            package5: "https://cdn.skypack.dev/package5",
          },
        })
      );

      const map = await window.importMapOverrides.getDefaultMap();

      expect(map).toEqual({
        imports: {
          package1: "https://cdn.skypack.dev/package1",
          package2: "https://cdn.skypack.dev/package2",
          package3: "https://cdn.skypack.dev/package3",
          package4: "https://cdn.skypack.dev/package4",
          package5: "https://cdn.skypack.dev/package5",
        },
        scopes: {},
      });
    });
  });

  describe("getOverrideMap", () => {
    it("should return an empty map when there is no override map", async () => {
      await setDocumentAndLoadScript();
      const map = await window.importMapOverrides.getOverrideMap();

      expect(map).toEqual({
        imports: {},
        scopes: {},
      });
    });

    it("should return return an override map when overrides are stored in the local storage", async () => {
      await setDocumentAndLoadScript();
      window.localStorage.setItem(
        "import-map-override:package3",
        "https://cdn.skypack.dev/package33"
      );
      window.localStorage.setItem(
        "import-map-override:package4",
        "https://cdn.skypack.dev/package4"
      );
      const map = await window.importMapOverrides.getOverrideMap();

      expect(map).toEqual({
        imports: {
          package3: "https://cdn.skypack.dev/package33",
          package4: "https://cdn.skypack.dev/package4",
        },
        scopes: {},
      });
    });
  });

  describe("Add/Remove/Enable/Disable overrides", () => {
    const changeEventListener = jest.fn();

    beforeEach(() => {
      window.addEventListener(
        "import-map-overrides:change",
        changeEventListener
      );
    });

    afterEach(() => {
      window.removeEventListener(
        "import-map-overrides:change",
        changeEventListener
      );
    });

    async function assertChangeEventListenerIsCalled() {
      // Verify that the event listener is called
      await new Promise((resolve) =>
        changeEventListener.mockImplementation(() => {
          resolve();
        })
      );
    }

    describe("getDisabledOverrides", () => {
      it("should return an empty array when there is no override", async () => {
        await setDocumentAndLoadScript();

        expect(window.importMapOverrides.getDisabledOverrides()).toEqual([]);
      });

      it("should return an array of disabled overrides", async () => {
        await setDocumentAndLoadScript();
        window.localStorage.setItem(
          "import-map-overrides-disabled",
          JSON.stringify(["package3", "package4"])
        );

        expect(window.importMapOverrides.getDisabledOverrides()).toEqual([
          "package3",
          "package4",
        ]);
      });
    });

    describe("isDisabled", () => {
      it("should return true if the override is disabled", async () => {
        await setDocumentAndLoadScript();
        window.localStorage.setItem(
          "import-map-overrides-disabled",
          JSON.stringify(["package3"])
        );

        expect(window.importMapOverrides.isDisabled("package3")).toEqual(true);
      });

      it("should return false if the override is not disabled", async () => {
        await setDocumentAndLoadScript();
        window.localStorage.setItem(
          "import-map-overrides-disabled",
          JSON.stringify(["package3"])
        );

        expect(window.importMapOverrides.isDisabled("package4")).toEqual(false);
      });
    });

    describe("disableOverride", () => {
      it("should disable an override and return true if it wasn't disabled before", async () => {
        await setDocumentAndLoadScript();
        const result = await window.importMapOverrides.disableOverride(
          "package3"
        );

        expect(window.importMapOverrides.getDisabledOverrides()).toEqual([
          "package3",
        ]);
        expect(result).toEqual(true);
        await assertChangeEventListenerIsCalled();
      });

      it("should maintain override disabled and return false if it was already disabled before", async () => {
        await setDocumentAndLoadScript();
        window.localStorage.setItem(
          "import-map-overrides-disabled",
          JSON.stringify(["package3"])
        );
        const result = await window.importMapOverrides.disableOverride(
          "package3"
        );

        expect(window.importMapOverrides.getDisabledOverrides()).toEqual([
          "package3",
        ]);
        expect(result).toEqual(false);
      });
    });

    describe("enableOverride", () => {
      it("should re-enable a disabled override and return true", async () => {
        await setDocumentAndLoadScript();
        window.localStorage.setItem(
          "import-map-overrides-disabled",
          JSON.stringify(["package3"])
        );
        const result = await window.importMapOverrides.enableOverride(
          "package3"
        );

        expect(window.importMapOverrides.getDisabledOverrides()).toEqual([]);
        expect(result).toEqual(true);
        await assertChangeEventListenerIsCalled();
      });

      it("should return false if override was not disabled before", async () => {
        await setDocumentAndLoadScript();
        const result = await window.importMapOverrides.enableOverride(
          "package3"
        );

        expect(window.importMapOverrides.getDisabledOverrides()).toEqual([]);
        expect(result).toEqual(false);
      });
    });

    describe("addOverride", () => {
      it("should add an override", async () => {
        await setDocumentAndLoadScript();
        const map = await window.importMapOverrides.addOverride(
          "package3",
          "https://cdn.skypack.dev/package33.js"
        );

        expect(localStorage.getItem("import-map-override:package3")).toEqual(
          "https://cdn.skypack.dev/package33.js"
        );
        expect(map).toEqual({
          imports: {
            package3: "https://cdn.skypack.dev/package33.js",
          },
          scopes: {},
        });
        await assertChangeEventListenerIsCalled();
      });

      it("should add an override by specifying only the port number", async () => {
        await setDocumentAndLoadScript();
        const map = await window.importMapOverrides.addOverride(
          "@demo/package33",
          "8080"
        );

        expect(
          localStorage.getItem("import-map-override:@demo/package33")
        ).toEqual("//localhost:8080/demo-package33.js");
        expect(map).toEqual({
          imports: {
            "@demo/package33": "//localhost:8080/demo-package33.js",
          },
          scopes: {},
        });
        await assertChangeEventListenerIsCalled();
      });
    });

    describe("removeOverride", () => {
      it("should remove an existing override", async () => {
        await setDocumentAndLoadScript();
        window.localStorage.setItem(
          "import-map-override:package3",
          "https://cdn.skypack.dev/package33"
        );
        const result = await window.importMapOverrides.removeOverride(
          "package3"
        );

        expect(localStorage.getItem("import-map-override:package3")).toEqual(
          null
        );
        expect(result).toBe(true);
        await assertChangeEventListenerIsCalled();
      });
    });

    describe("resetOverrides", () => {
      it("should remove all overrides", async () => {
        await setDocumentAndLoadScript();
        window.localStorage.setItem(
          "import-map-override:package3",
          "https://cdn.skypack.dev/package33"
        );
        window.localStorage.setItem(
          "import-map-override:package4",
          "https://cdn.skypack.dev/package4"
        );
        const map = await window.importMapOverrides.resetOverrides();

        expect(localStorage.getItem("import-map-override:package3")).toEqual(
          null
        );
        expect(localStorage.getItem("import-map-override:package4")).toEqual(
          null
        );
        expect(map).toEqual({
          imports: {},
          scopes: {},
        });
        await assertChangeEventListenerIsCalled();
      });
    });

    describe("hasOverrides", () => {
      it("should return true if there are overrides", async () => {
        await setDocumentAndLoadScript();
        window.localStorage.setItem(
          "import-map-override:package3",
          "https://cdn.skypack.dev/package33"
        );

        expect(window.importMapOverrides.hasOverrides()).toEqual(true);
      });

      it("should return false if there are no overrides", async () => {
        await setDocumentAndLoadScript();

        expect(window.importMapOverrides.hasOverrides()).toEqual(false);
      });
    });
  });

  describe("enableUI", () => {
    it("should enable the UI", async () => {
      await setDocumentAndLoadScript();
      const customElement = document.createElement("import-map-overrides-full");
      customElement.setAttribute("show-when-local-storage", "true");
      customElement.renderWithPreact = jest.fn();
      customElement.setAttribute("show-when-local-storage", "swlsKey");
      document.body.appendChild(customElement);

      window.importMapOverrides.enableUI();

      expect(window.localStorage.getItem("swlsKey")).toBe("true");
      expect(customElement.renderWithPreact).toHaveBeenCalledTimes(1);
    });
  });

  describe("mergeImportMap", () => {
    it("should merge an import map", async () => {
      await setDocumentAndLoadScript();
      const map = await window.importMapOverrides.mergeImportMap(
        {
          imports: {
            package1: "https://cdn.skypack.dev/package10.js",
            package3: "https://cdn.skypack.dev/package33.js",
          },
          scopes: {
            scope1: {
              package5: "https://cdn.skypack.dev/package55.js",
              package6: "https://cdn.skypack.dev/package66.js",
            },
            scope3: {
              package8: "https://cdn.skypack.dev/package89.js",
              package3: "https://cdn.skypack.dev/package31.js",
            },
          },
        },
        {
          imports: {
            package1: "https://cdn.skypack.dev/package11.js",
            package2: "https://cdn.skypack.dev/package20.js",
          },
          scopes: {
            scope2: {
              package7: "https://cdn.skypack.dev/package77.js",
            },
            scope3: {
              package3: "https://cdn.skypack.dev/package32.js",
              package9: "https://cdn.skypack.dev/package99.js",
            },
          },
        }
      );

      expect(map).toEqual({
        imports: {
          package1: "https://cdn.skypack.dev/package11.js",
          package2: "https://cdn.skypack.dev/package20.js",
          package3: "https://cdn.skypack.dev/package33.js",
        },
        scopes: {
          scope1: {
            package5: "https://cdn.skypack.dev/package55.js",
            package6: "https://cdn.skypack.dev/package66.js",
          },
          scope2: {
            package7: "https://cdn.skypack.dev/package77.js",
          },
          scope3: {
            package3: "https://cdn.skypack.dev/package32.js",
            package9: "https://cdn.skypack.dev/package99.js",
          },
        },
      });
    });
  });
});
