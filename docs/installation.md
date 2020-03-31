# Installation

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
