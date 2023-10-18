describe("domainsElement", () => {
  const getDocument = (domainsElementContent) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="import-map-overrides-domains" content="${domainsElementContent}">
      </head>
      <body></body>
    </html>
    `;
  beforeEach(() => {
    window.importMapOverrides = undefined;
    jest.resetModules();
  });

  it("should not initialize if host is in denyList", () => {
    document.body.innerHTML = getDocument("denylist:localhost");
    import("./js-api").then(() => {
      expect(window.importMapOverrides).toBeUndefined();
    });
  });

  it("should not initialize if host is not in allowList", () => {
    document.body.innerHTML = getDocument("allowlist:randomhost");
    import("./js-api").then(() => {
      expect(window.importMapOverrides).toBeUndefined();
    });
  });

  it("should initialize if host is not in denyList", () => {
    document.body.innerHTML = getDocument("denylist:randomhost");
    import("./js-api").then(() => {
      expect(window.importMapOverrides).toBeDefined();
    });
  });

  it("should initialize if host is in allowList", () => {
    document.body.innerHTML = getDocument("allowlist:localhost");
    import("./js-api").then(() => {
      expect(window.importMapOverrides).toBeDefined();
    });
  });
});
