# import-map-overrides

[![](https://data.jsdelivr.com/v1/package/npm/import-map-overrides/badge)](https://www.jsdelivr.com/package/npm/import-map-overrides)

A browser javascript library for being able to override [import maps](https://github.com/WICG/import-maps). This works
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

## Installation

The import-map-overrides library is used via a global variable `window.importMapOverrides`. The global variable exists because import-map-overrides needs
to be usable regardless of build config and without dependence on ESM modules, since
[once you use ESM modules you can no longer modify the import map](https://github.com/WICG/import-maps/blob/master/spec.md#acquiring-import-maps).

It is preferred to install import-map-overrides with a `<script>` tag in your html file.

```html
<!--
Make sure to put this BEFORE any <script type="module"> elements or any System.import() calls, but
AFTER all other import maps
-->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/import-map-overrides/dist/import-map-overrides.js"
></script>
<!-- optionally include the UI for import map overrides -->
<import-map-overrides-full></import-map-overrides-full>
```

Alternatively, you can use it as an npm package:

```sh
npm install --save import-map-overrides
# Or
yarn add import-map-overrides
```

```js
/*
Make sure this js file gets executed BEFORE any <script type="module"> elements or any System.import() calls,
but AFTER any other import maps that are on the page.
*/
import "import-map-overrides"; // this only will work if you compile the `import` down to an iife via webpack, rollup, parcel, etc
```

## Documentation

- [Security](/docs/security.md)
- [Configuration](/docs/security.md)
- [UI](/docs/ui.md)
- [Javascript API](/docs/api.md)
