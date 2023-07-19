# import-map-overrides

[![](https://data.jsdelivr.com/v1/package/npm/import-map-overrides/badge)](https://www.jsdelivr.com/package/npm/import-map-overrides)

A browser and nodejs javascript library for being able to override [import maps](https://github.com/WICG/import-maps). This works
with native browser import maps, [SystemJS](https://github.com/systemjs/systemjs) import maps, [es-module-shims](https://github.com/guybedford/es-module-shims) import maps, and more.

## Motivation

![import map overrides 3](https://user-images.githubusercontent.com/5524384/77237035-07476600-6b8a-11ea-9041-8b70f633d5d0.gif)

Import maps are a way of controlling which url to download javascript modules from. The import-map-overrides library allows you
to dynamically change the url for javascript modules by storing overrides in local storage. This allows developers to **override individual modules to point to their localhost during development of a module, without having to boot up a local environment with all the other modules and a backend server.**

You should not use import-map-overrides as the **only** import map on your page, since you cannot count on everyone's local storage having
valid values for all of your modules. Instead, import-map-overrides should be viewed as a developer experience enhancement and dev tool --
developers can develop and debug on deployed environments instead of having to boot up a local environment.

Here are some tutorial videos that explain this in more depth:

- [In-browser vs build-time modules](https://www.youtube.com/watch?v=Jxqiu6pdMSU&list=PLLUD8RtHvsAOhtHnyGx57EYXoaNsxGrTU&index=2)
- [Import Maps](https://www.youtube.com/watch?v=Lfm2Ge_RUxs&list=PLLUD8RtHvsAOhtHnyGx57EYXoaNsxGrTU&index=3)
- [Local development with import map overrides](https://www.youtube.com/watch?v=vjjcuIxqIzY&list=PLLUD8RtHvsAOhtHnyGx57EYXoaNsxGrTU&index=4)

## Documentation

The UI for import-map-overrides works in evergreen browsers (web components support required). The javascript API works in IE11+.

- [Security](/docs/security.md)

### Browser

- [Installation](/docs/installation.md#browser)
- [Configuration](/docs/configuration.md)
- [User Interface](/docs/ui.md)
- [Javascript API](/docs/api.md#browser)

### NodeJS

- [Installation](/docs/installation.md#node)
- [API](/docs/api.md#node)

## Contributing

Make sure you commit a changeset with `pnpm changeset` before you open a PR.
This will allow to automatically bump the version and maintain the CHANGELOG
once released.
