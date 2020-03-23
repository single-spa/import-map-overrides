# import-map-overrides

[![](https://data.jsdelivr.com/v1/package/npm/import-map-overrides/badge)](https://www.jsdelivr.com/package/npm/import-map-overrides)

A browser javascript library for being able to override [import maps](https://github.com/WICG/import-maps). This works
with native browser import maps or with the [SystemJS](https://github.com/systemjs/systemjs) polyfill for import maps.

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

## Security

import-map-overrides allows a user to modify which javascript code is executed in their browser. This is something the user can do to themself **even without import-map-overrides** by executing code in the browser console or by falling victim to a [self XSS](https://en.wikipedia.org/wiki/Self-XSS) attack. Import map overrides does not make it more possible for the user to fall victim to such an attack.

However, there are things you can do to protect your users from self XSS. Consider the following security precautions:

1. (**Most Important and Highly Recommended**) Configure your server to set a [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) HTTP header for your HTML file. In it, consider safelisting the domains that you trust. Doing so is important to protect your users from XSS and other attacks.
1. Consider removing import-map-overrides from your production application's HTML file. If you properly set a Content-Security-Policy header, this provides no extra security. However, if you have not configured CSP, this will at least make it a bit harder for the user to self XSS. My recommendation is to do CSP instead of this whenever possible.

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

## Configuration

You must indicate what kind of import map you are setting overrides for. You do this by inserting you must add a `<meta>`
element to your html file **before the import-map-overrides library is loaded**.

```html
<!-- example configuration for a SystemJS import map -->
<meta name="importmap-type" content="systemjs-importmap" />
```

| Import Map type                                                  | `importmap-type`      |
| ---------------------------------------------------------------- | --------------------- |
| Native <sup>1</sup>                                              | `importmap` (default) |
| [SystemJS](https://github.com/systemjs/systemjs)                 | `systemjs-importmap`  |
| [es-module-shims](https://github.com/guybedford/es-module-shims) | `importmap-shim`      |
| Server rendered <sup>2</sup>                                     | `server`              |

**Notes:**

1. Native import maps are only supported in Chrome@>=76 under the _Experimental Web Platform Features_ flag. Only one import map (including the import-map-overrides map) can be on a web page at a time when using native import maps. ([Details](https://github.com/WICG/import-maps/issues/199)). Please use [single import map method](#single-import-map-mode).
2. A "server rendered import map" is when the web server for your HTML file embeds an inline import map. You can still use import-map-overrides for such import maps if your server is cooperative. Import map overrides will set a cookie called `import-map-overrides:module-name` whose value is the override URL. A cooperative server is one that applies the URL in the cookie to the inlined import map sent in the response HTML.

## User Interface

The UI for import-map-overrides gives visual indication when any module is overridden, so that you know whether to blame your override
or not when things are broken. It also lets you view and modify urls for all the modules in your import map.

### Usage

You use the import-map-overrides UI via web components. This means you just need to put some HTML into the DOM in order for it to work.
You have three options for the UI, depending on how much you want to customize the UI:

```html
<!--
  The full UI, including the "trigger" button that pops up the UI.

  If you omit the show-when-local-storage attribute, the yellow/orange rectangle always shows.
  When you have the show-when-local-storage attribute, the yellow/orange rectangle will only show
  when the user has set a local storage value of "true" for the key specified.

  For example, in the below example you must run the follow command in order to see the full-ui.
  localStorage.setItem('overrides-ui', true);

  The dev-libs attribute indicates that you prefer using development versions of third party libraries
  like react when the import-map-overrides ui is active. The presence of that attribute turns on this feature.
  For example, if you have `react` in your import map pointing to https://cdn.jsdelivr.net/npm/react/umd/react.production.min.js
  the dev-libs attribute will automatically override it to https://cdn.jsdelivr.net/npm/react/umd/react.development.js.
  You can also turn this feature on/off via localStorage. `localStorage.setItem('import-map-overrides-dev-libs', false)` will
  forcibly turn this feature off, while calling it with `true` will turn it on.
 -->
<import-map-overrides-full
  show-when-local-storage="overrides-ui"
  dev-libs
></import-map-overrides-full>

<!-- Alternatively, just the black popup itself -->
<import-map-overrides-popup></import-map-overrides-popup>

<!-- Or if you only want the actual import map list and UI for overriding -->
<import-map-overrides-list></import-map-overrides-list>
```

## Not using the UI

The UI is completely optional. If you don't want to use it, simply don't include the `<import-map-overrides-full>`
custom element in your page. Additionally, you can use the
[`/dist/import-map-overrides-api.js` file](https://unpkg.com/browse/import-map-overrides/dist/import-map-overrides-api.js)
instead of [`/dist/import-map-overrides.js`](https://unpkg.com/browse/import-map-overrides/dist/import-map-overrides.js),
which avoids downloading the code for the UI and reduces the library size.

## Integration with other import maps

The import-map-overrides library can override a server-rendered inline import map, an import map that is loaded via `src=""`, or
any other import map. The key to making this work is to ensure that the import-map-overrides library is loaded **after** all other
import maps that are on the page, but **before** the first `<script type="module">` or `System.import()`.

## Single import map mode

The import maps specification [only allows for a single import map per web page](https://github.com/WICG/import-maps/#multiple-import-map-support). Many import map polyfills, including systemjs and es-module-shims, allow for multiple import maps that are merged together.

import-map-overrides can be configured to work either with a single import map or multiple import maps. To use single import map mode, change the `type` attribute of your import map to be `overridable-importmap`:

```html
<script type="overridable-importmap">
  {
    "imports": {
      "foo": "./foo.df67s.js"
    }
  }
</script>
<script src="https://cdn.jsdelivr.net/npm/import-map-overrides/dist/import-map-overrides.js"></script>
```

The `overridable-importmap` will be ignored by the browser, but import-map-overrides will insert an import map with the correct script `type` attribute and overrides applied, which will be used by the browser. Note that single import map cannot be used with external import maps (those with a `src` attribute instead of inlined content).

## Javascript API

import-map-overrides provides the following functions. Note that these functions are always put onto window.importMapOverrides, even
if you installed it as an npm package.

### `window.importMapOverrides.getOverrideMap(includeDisabled? = false)`

Returns the override import map as an object. The returned object represents the overrides
**that will take effect the next time you reload the page**, including any additions or removals you've recently made after
the current page's [acquiringImportMaps boolean](https://github.com/WICG/import-maps/blob/master/spec.md#acquiring-import-maps) was set to false.

`includeDisabled` is an optional boolean you can pass in to include any "disabled overrides." See `disableOverride()` for more information.

```js
const overrideMap = window.importMapOverrides.getOverrideMap();
console.log(overrideMap);
/*
{
  "imports": {
    "module1": "https://mycdn.com/module1.js",
    "lodash": "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.core.js"
  }
}
*/
```

### `window.importMapOverrides.addOverride(moduleName, url)`

Accepts a string `moduleName` and a string `url` as arguments. This will set up an override **which takes effect
the next time you reload the page**. Returns the new override import map.

**Note that if you provide a port instead of a full url, that import-map-overrides will provide a default url to your localhost**.

```js
window.importMapOverrides.addOverride("react", "https://unpkg.com/react");

// Alternatively, provide a port number. Default url will be //localhost:8085/module1.js
window.importMapOverrides.addOverride("module1", "8085");
```

### `window.importMapOverrides.removeOverride(moduleName)`

Accepts a string `moduleName` as an argument. This will remove an override **which takes effect the next time you
reload the page**. Returns a boolean that indicates whether the override existed.

```js
const wasRemoved = window.importMapOverrides.removeOverride("vue");
console.log(wasRemoved); // Either true or false
```

### `window.importMapOverrides.resetOverrides()`

Removes all overrides from local storage, so that the next time the page is reloaded an override import map won't be created. Accepts
no arguments and returns the reset override import map.

```js
window.importMapOverrides.resetOverrides();
```

### `window.importMapOverrides.getUrlFromPort(moduleName, port)`

This API is used internally by import-map-overrides to create a full url when calling `addOverride()` with just a
port number:

```js
const defaultOverrideUrl = window.importMapOverrides.getUrlFromPort(
  "module1",
  "8085"
);
console.log(defaultOverrideUrl); // "//localhost:8085/module1.js"
```

The `getUrlFromPort` function is exposed as an API to allow you to customize the logic yourself:

```js
window.importMapOverrides.getUrlFromPort = (moduleName, port) =>
  `http://127.0.0.1:${port}/${moduleName}.js`;

// Now whenever you call `addOverride()` with a port number, your custom logic will be called
window.importMapOverrides.addOverride("module1", "8085");
console.log(window.importMapOverrides.getOverrideMap().imports.module1); // "http://127.0.0.1:8085/module1.js"
```

### `window.importMapOverrides.enableUI()`

This will force the full import map overrides UI to be displayed (as long as the code for it is loaded on the page).

It will set local storage to match the `show-when-local-storage` key and/or it will append a `<import-map-overrides-full>` element to the DOM.

### `window.importMapOverrides.mergeImportMap(firstMap, secondMap)`

Creates a new import map that is the first map merged with the second map. Items in the second map take priority.

### `window.importMapOverrides.getDefaultMap()`

This returns the import map(s) on the page, without the presence of any import map overrides.

### `window.importMapOverrides.getCurrentPageMap()`

This returns the final import map (including overrides) that was applied to the current page. Any overrides set after the page load will not be included.

### `window.importMapOverrides.getNextPageMap()`

This returns the final import map (including overrides) that will be applied the next time the page is reloaded.

### `window.importMapOverrides.disableOverride(moduleName)`

This will temporarily disable an import map override. This is similar to `removeOverride()` except that it will preserve what the override URL was so that you can toggle the override on and off.

Returns true if the module was already disabled, and false otherwise.

### `window.importMapOverrides.enableOverride(moduleName)`

This will re-renable an import map override that was previously disabled via `disableOverride()`.

Returns true if the module was already disabled, and false otherwise.

### `window.importMapOverrides.getDisabledOverrides()`

Returns an array of strings, where each string is the name of a module that is currently disabled.

### `window.importMapOverrides.isDisabled(moduleName)`

Returns a boolean indicated whether the string module name is a currently disabled or not.

### `window.importMapOverrides.addExternalOverride(urlToImportMap)`

Set up an override to an external import map that is hosted at a different URL. The external import map has lower precendence than inline overrides created via `addOverride()` when using multiple import maps, and higher precedence when using a single import map.

### `window.importMapOverrides.removeExternalOverride(urlToImportMap)`

Remove an external import map override. Returns a boolean that indicates whether the override existed in the first place.

### `window.importMapOverrides.getExternalOverrides()`

Returns an array of string URLs, where each string is the URL to an external override import map.

### `window.importMapOverrides.getCurrentPageExternalOverrides()`

Similar to `getExternalOverrides()`, except it ignores any changes to the external overrides since the page was loaded.

### `window.importMapOverrides.getExternalOverrideMap(urlsToImportMap?)`

Returns a promise that resolves with the merged import map of all external override import maps. You can provide an array of strings `urlsToImportMap` to control which external import maps to fetch and merge.

### `window.importMapOverrides.isExternalMapValid(urlToImportMap)`

Takes one argument, `urlToImport`, and returns a promise that resolves with a boolean. When `true`, the url provided is one that hosts a valid import map. When `false`, the url provided doesn't host a valid import map.

## Events

The import-map-overrides library fires an event called `import-map-overrides:change` on the window whenever the
override import map changes. The event is a [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
that has no [detail property](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail).

Example usage:

```js
window.addEventListener("import-map-overrides:change", logImportMap);

// Later on you can remove the event listener
window.removeEventListener("import-map-overrides:change", logImportMap);

function logImportMap(evt) {
  console.log(window.importMapOverrides.getOverrideMap());
}
```
