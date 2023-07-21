import { localStorageMock } from "./localStorageMock";

describe("window.importMapOverrides", () => {
  const changeEventListener = jest.fn();
  let localStorageBackup;

  const defaultMap = {
    imports: {
      package1: "https://cdn.skypack.dev/package1",
      package2: "https://cdn.skypack.dev/package2",
      package3: "https://cdn.skypack.dev/package3",
    },
  };
  const defaultMapScript = `<script type="importmap">
    ${JSON.stringify(defaultMap)}
  </script>`;

  beforeEach(() => {
    jest.resetModules();
    fetch.resetMocks();
    localStorageBackup = window.localStorage;
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.clear();
    window.addEventListener("import-map-overrides:change", changeEventListener);
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageBackup,
    });
    window.removeEventListener(
      "import-map-overrides:change",
      changeEventListener
    );
  });

  const setDocumentAndLoadScript = (maps = [defaultMapScript]) => {
    document.head.innerHTML = `${maps.map((map) => map || "").join("\n")}`;
    return import("./js-api");
  };

  async function assertChangeEventListenerIsCalled() {
    // Verify that the event listener is called
    await new Promise((resolve) =>
      changeEventListener.mockImplementation(() => {
        resolve();
      })
    );
  }

  describe("getExternalOverrides", () => {
    it("should return an empty object if no overrides are set", async () => {
      await setDocumentAndLoadScript();
      expect(window.importMapOverrides.getExternalOverrides()).toEqual([]);
    });

    it("should return an object with the overrides", async () => {
      const overrides = [
        "https://cdn.skypack.dev/importmap1.json",
        "https://cdn.skypack.dev/importmap2.json",
      ];
      localStorageMock.setItem(
        "import-map-overrides-external-maps",
        JSON.stringify(overrides)
      );
      await setDocumentAndLoadScript();

      expect(window.importMapOverrides.getExternalOverrides()).toEqual(
        overrides
      );
    });
  });

  describe("addExternalOverride", () => {
    it("should add an external override if not there already", async () => {
      const overrides = [
        "https://cdn.skypack.dev/importmap1.json",
        "https://cdn.skypack.dev/importmap2.json",
      ];
      localStorageMock.setItem(
        "import-map-overrides-external-maps",
        JSON.stringify(overrides)
      );
      await setDocumentAndLoadScript();

      expect(
        window.importMapOverrides.addExternalOverride(
          "https://cdn.skypack.dev/importmap3.json"
        )
      ).toEqual(true);
      expect(window.importMapOverrides.getExternalOverrides()).toEqual(
        overrides.concat("https://cdn.skypack.dev/importmap3.json")
      );
      await assertChangeEventListenerIsCalled();
    });

    it("should not add an external override if already there", async () => {
      const overrides = [
        "https://cdn.skypack.dev/importmap1.json",
        "https://cdn.skypack.dev/importmap2.json",
      ];
      localStorageMock.setItem(
        "import-map-overrides-external-maps",
        JSON.stringify(overrides)
      );
      await setDocumentAndLoadScript();

      expect(
        window.importMapOverrides.addExternalOverride(
          "https://cdn.skypack.dev/importmap2.json"
        )
      ).toEqual(false);
      expect(window.importMapOverrides.getExternalOverrides()).toEqual(
        overrides
      );
    });
  });

  describe("removeExternalOverride", () => {
    it("should remove an external override if there", async () => {
      const overrides = [
        "https://cdn.skypack.dev/importmap1.json",
        "https://cdn.skypack.dev/importmap2.json",
      ];
      localStorageMock.setItem(
        "import-map-overrides-external-maps",
        JSON.stringify(overrides)
      );
      await setDocumentAndLoadScript();

      expect(
        window.importMapOverrides.removeExternalOverride(
          "https://cdn.skypack.dev/importmap2.json"
        )
      ).toEqual(true);
      expect(window.importMapOverrides.getExternalOverrides()).toEqual([
        "https://cdn.skypack.dev/importmap1.json",
      ]);
      await assertChangeEventListenerIsCalled();
    });

    it("should not remove an external override if not there", async () => {
      const overrides = [
        "https://cdn.skypack.dev/importmap1.json",
        "https://cdn.skypack.dev/importmap2.json",
      ];
      localStorageMock.setItem(
        "import-map-overrides-external-maps",
        JSON.stringify(overrides)
      );
      await setDocumentAndLoadScript();

      expect(
        window.importMapOverrides.removeExternalOverride(
          "https://cdn.skypack.dev/importmap3.json"
        )
      ).toEqual(false);
      expect(window.importMapOverrides.getExternalOverrides()).toEqual(
        overrides
      );
    });
  });

  describe("getExternalOverrideMap", () => {
    it("should return an empty override map if no external overrides are set", async () => {
      await setDocumentAndLoadScript();
      expect(
        window.importMapOverrides.getExternalOverrideMap()
      ).resolves.toEqual({ imports: {}, scopes: {} });
    });

    it("should return an override map with the external overrides", async () => {
      await setDocumentAndLoadScript();
      window.importMapOverrides.getExternalOverrides = jest
        .fn()
        .mockReturnValue([
          "https://cdn.skypack.dev/importmap1.json",
          "https://cdn.skypack.dev/importmap2.json",
        ]);
      fetch.mockImplementation((url) => {
        if (url === "https://cdn.skypack.dev/importmap1.json") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                imports: {
                  package1: "https://cdn.skypack.dev/package1",
                  package2: "https://cdn.skypack.dev/package2",
                },
              }),
          });
        } else if (url === "https://cdn.skypack.dev/importmap2.json") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                imports: {
                  package2: "https://cdn.skypack.dev/package22",
                  package3: "https://cdn.skypack.dev/package3",
                },
              }),
          });
        }
      });

      const result = await window.importMapOverrides.getExternalOverrideMap();

      expect(result).toEqual({
        imports: {
          package1: "https://cdn.skypack.dev/package1",
          package2: "https://cdn.skypack.dev/package22",
          package3: "https://cdn.skypack.dev/package3",
        },
        scopes: {},
      });
    });
  });

  describe("isExternalMapValid", () => {
    it("should return true if the external map is valid", async () => {
      await setDocumentAndLoadScript();
      window.importMapOverrides.getExternalOverrides = jest
        .fn()
        .mockReturnValue(["https://cdn.skypack.dev/importmap1.json"]);

      fetch.mockImplementation((url) => {
        if (url === "https://cdn.skypack.dev/importmap1.json") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                imports: {
                  package1: "https://cdn.skypack.dev/package1",
                  package2: "https://cdn.skypack.dev/package2",
                },
              }),
          });
        }
      });

      const result = await window.importMapOverrides.isExternalMapValid(
        "https://cdn.skypack.dev/importmap1.json"
      );

      expect(result).toEqual(true);
    });

    it("should return false if the external map contains non-valid JSON", async () => {
      await setDocumentAndLoadScript();
      window.importMapOverrides.getExternalOverrides = jest
        .fn()
        .mockReturnValue(["https://cdn.skypack.dev/importmap1.json"]);

      fetch.mockImplementation((url) => {
        if (url === "https://cdn.skypack.dev/importmap1.json") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.reject(new Error("Invalid JSON")),
            url: "https://cdn.skypack.dev/importmap1.json",
          });
        }
      });

      const result = await window.importMapOverrides.isExternalMapValid(
        "https://cdn.skypack.dev/importmap1.json"
      );

      expect(result).toEqual(false);
    });

    it("should return false if fetching the external map returns a not-OK response", async () => {
      await setDocumentAndLoadScript();
      window.importMapOverrides.getExternalOverrides = jest
        .fn()
        .mockReturnValue(["https://cdn.skypack.dev/importmap1.json"]);

      fetch.mockImplementation((url) => {
        if (url === "https://cdn.skypack.dev/importmap1.json") {
          return Promise.resolve({
            ok: false,
            url: "https://cdn.skypack.dev/importmap1.json",
          });
        }
      });

      const result = await window.importMapOverrides.isExternalMapValid(
        "https://cdn.skypack.dev/importmap1.json"
      );

      expect(result).toEqual(false);
    });

    it("should return false if fetching the external map fails", async () => {
      await setDocumentAndLoadScript();
      window.importMapOverrides.getExternalOverrides = jest
        .fn()
        .mockReturnValue(["https://cdn.skypack.dev/importmap1.json"]);

      fetch.mockRejectedValue(new Error("Failed to fetch"));

      const result = await window.importMapOverrides.isExternalMapValid(
        "https://cdn.skypack.dev/importmap1.json"
      );

      expect(result).toEqual(false);
    });
  });

  describe("getCurrentPageExternalOverrides", () => {
    it("should return an empty array if no external overrides are set", async () => {
      await setDocumentAndLoadScript();

      const result =
        await window.importMapOverrides.getCurrentPageExternalOverrides();

      expect(result).toEqual([]);
    });

    it("should return an array of external overrides if they are set", async () => {
      await setDocumentAndLoadScript([
        '<script type="importmap" data-is-importmap-override src="https://cdn.skypack.dev/importmap1.json"></script>',
        '<script type="importmap" data-is-importmap-override src="https://cdn.skypack.dev/importmap2.json"></script>',
      ]);

      const result =
        await window.importMapOverrides.getCurrentPageExternalOverrides();

      expect(result).toEqual([
        "https://cdn.skypack.dev/importmap1.json",
        "https://cdn.skypack.dev/importmap2.json",
      ]);
    });
  });

  describe("getCurrentPageMap", () => {
    it("should return the default map if no overrides are set", async () => {
      await setDocumentAndLoadScript();

      const result = await window.importMapOverrides.getCurrentPageMap();

      expect(result).toEqual({ ...defaultMap, scopes: {} });
    });

    it("should return a merge of the default map and the overrides", async () => {
      await setDocumentAndLoadScript([
        defaultMapScript,
        '<script type="importmap" data-is-importmap-override src="https://cdn.skypack.dev/importmap1.json"></script>',
      ]);

      fetch.mockImplementation((url) => {
        if (url === "https://cdn.skypack.dev/importmap1.json") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                imports: {
                  package3: "https://cdn.skypack.dev/package33",
                  package4: "https://cdn.skypack.dev/package4",
                },
                scopes: {
                  "/scope1": {
                    package1: "https://cdn.skypack.dev/scope1/package1",
                    package2: "https://cdn.skypack.dev/scope1/package2",
                  },
                },
              }),
          });
        }
      });

      const result = await window.importMapOverrides.getCurrentPageMap();

      expect(result).toEqual({
        imports: {
          package1: "https://cdn.skypack.dev/package1",
          package2: "https://cdn.skypack.dev/package2",
          package3: "https://cdn.skypack.dev/package33",
          package4: "https://cdn.skypack.dev/package4",
        },
        scopes: {
          "/scope1": {
            package1: "https://cdn.skypack.dev/scope1/package1",
            package2: "https://cdn.skypack.dev/scope1/package2",
          },
        },
      });
    });
  });

  describe("getNextPageMap", () => {
    it("should return the default map if no overrides are set", async () => {
      await setDocumentAndLoadScript();

      const result = await window.importMapOverrides.getNextPageMap();

      expect(result).toEqual({ ...defaultMap, scopes: {} });
    });

    it("should return a merge of the default map and the overrides", async () => {
      await setDocumentAndLoadScript();
      window.importMapOverrides.getExternalOverrides = jest
        .fn()
        .mockReturnValue([
          "https://cdn.skypack.dev/importmap1.json",
          "https://cdn.skypack.dev/importmap2.json",
        ]);

      fetch.mockImplementation((url) => {
        if (url === "https://cdn.skypack.dev/importmap1.json") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                imports: {
                  package2: "https://cdn.skypack.dev/package22",
                  package4: "https://cdn.skypack.dev/package4",
                },
              }),
          });
        } else if (url === "https://cdn.skypack.dev/importmap2.json") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                imports: {
                  package3: "https://cdn.skypack.dev/package33",
                  package5: "https://cdn.skypack.dev/package5",
                },
                scopes: {
                  "/scope1": {
                    package1: "https://cdn.skypack.dev/scope1/package1",
                    package2: "https://cdn.skypack.dev/scope1/package2",
                  },
                },
              }),
          });
        }
      });

      const result = await window.importMapOverrides.getNextPageMap();

      expect(result).toEqual({
        imports: {
          package1: "https://cdn.skypack.dev/package1",
          package2: "https://cdn.skypack.dev/package22",
          package3: "https://cdn.skypack.dev/package33",
          package4: "https://cdn.skypack.dev/package4",
          package5: "https://cdn.skypack.dev/package5",
        },
        scopes: {
          "/scope1": {
            package1: "https://cdn.skypack.dev/scope1/package1",
            package2: "https://cdn.skypack.dev/scope1/package2",
          },
        },
      });
    });
  });
});
