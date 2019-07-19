# import-map-overrides

A browser javascript library for being able to override [import maps](https://github.com/WICG/import-maps). This works
with native browser import maps or with the [SystemJS](https://github.com/systemjs/systemjs) polyfill for import maps.

## Motivation

![import-map-overrides-ui](https://user-images.githubusercontent.com/5524384/60623188-484ede80-9d9f-11e9-9c1c-cb9fb09f8bee.gif)

Import maps are a way of controlling which url to download javascript modules from. The import-map-overrides library allows you
to dynamically change the url for javascript modules by storing overrides in local storage. This allows developers to **override individual modules to point to their localhost during development of a module, without having to boot up a local environment with all the other modules and a backend server.**

You should not use import-map-overrides as the **only** import map on your page, since you cannot count on everyone's local storage having
valid values for all of your modules. Instead, import-map-overrides should be viewed as a developer experience enhancement and dev tool --
developers can develop and debug on deployed environments instead of having to boot up a local environment.

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
  src="https://unpkg.com/import-map-overrides"
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

If you are using import-map-overrides for native import maps, no configuration is required.

However, if you're using SystemJS as a polyfill for import maps, you'll need to tell import-map-overrides to make a
`<script type="systemjs-importmap">` element instead of `<script type="importmap">`. To do this, you must add a `<meta>`
element to your html file **before the import-map-overrides library is loaded**.

```html
<meta name="importmap-type" content="systemjs-importmap" />
```

## Integration with other import maps

The import-map-overrides library can override a server-rendered inline import map, an import map that is loaded via `src=""`, or
any other import map. The key to making this work is to ensure that the import-map-overrides library is loaded **after** all other
import maps that are on the page, but **before** the first `<script type="module">` or `System.import()`.

## Javascript API

import-map-overrides provides the following functions. Note that these functions are always put onto window.importMapOverrides, even
if you installed it as an npm package.

### `window.importMapOverrides.getOverrideMap()`

Returns the override import map as an object. The returned object represents the overrides
**that will take effect the next time you reload the page**, including any additions or removals you've recently made after
the current page's [acquiringImportMaps boolean](https://github.com/WICG/import-maps/blob/master/spec.md#acquiring-import-maps) was set to false.

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

```js
window.importMapOverrides.addOverride("react", "https://unpkg.com/react");
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

## User Interface

The UI for import-map-overrides gives visual indication when any module is overridden, so that you know whether to blame your override
or not when things are broken. It also lets you view and modify urls for all the modules in your import map.

### Usage

You use the import-map-overrides UI via web components. This means you just need to put some HTML into the DOM in order for it to work.
You have three options for the UI, depending on how much you want to customize the UI:

```html
<!--
  The full UI, including the omnipresent "trigger" button that pops up the UI.

  If you omit the show-when-local-storage attribute, the yellow/orange rectangle always shows.
  When you have the show-when-local-storage attribute, the yellow/orange rectangle will only show
  when the user has set a local storage value of "true" for the key specified.

  For example, in the below example you must run the follow command in order to see the overrides "trigger" rectangle.
  localStorage.setItem('overrides-ui', true);
 -->
<import-map-overrides-full
  show-when-local-storage="overrides-ui"
></import-map-overrides-full>

<!-- Alternatively, just the black popup itself -->
<import-map-overrides-popup></import-map-overrides-popup>

<!-- Or if you only want the actual import map list and UI for overriding -->
<import-map-overrides-list></import-map-overrides-list>
```

## Not using the UI

The UI is completely optional. If you don't want to use it, simply don't include the `<import-map-overrides-full>`
custom element in your page. Additionally, you can use the
[`/dist/import-map-overrides-api.js` file](https://unpkg.com/import-map-overrides/dist/import-map-overrides-api.js)
instead of [`/dist/import-map-overrides.js`](https://unpkg.com/import-map-overrides/dist/import-map-overrides-api.js),
which avoids downloading the code for the UI and reduces the library size.
