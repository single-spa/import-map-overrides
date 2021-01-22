# Javascript API

## Browser

import-map-overrides provides the following functions. Note that these functions are always put onto window.importMapOverrides, even
if you installed it as an npm package.

### getOverrideMap

Returns the override import map as an object. The returned object represents the overrides
**that will take effect the next time you reload the page**, including any additions or removals you've recently made after
the current page's [acquiringImportMaps boolean](https://github.com/WICG/import-maps/blob/master/spec.md#acquiring-import-maps) was set to false.

`includeDisabled` is an optional boolean you can pass in to include any "disabled overrides." See `disableOverride()` for more information.

```js
const overrideMap = window.importMapOverrides.getOverrideMap();
/*
{
  "imports": {
    "module1": "https://mycdn.com/module1.js",
    "lodash": "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.core.js"
  }
}
*/

const overrideMapWithDisabledOverrides = window.importMapOverrides.getOverrideMap(
  true
);
/*
{
  "imports": {
    "app1": "/app1.js",
    "module1": "https://mycdn.com/module1.js",
    "lodash": "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.core.js"
  }
}
*/
```

### addOverride

A function that accepts a string `moduleName` and a string `url` as arguments. This will set up an override **which takes effect
the next time you reload the page**. Returns the new override import map.

**Note that if you provide a port instead of a full url, that import-map-overrides will provide a default url to your localhost**.

```js
window.importMapOverrides.addOverride("react", "https://unpkg.com/react");

// Alternatively, provide a port number. Default url will be //localhost:8085/module1.js
window.importMapOverrides.addOverride("module1", "8085");
```

### removeOverride

A function that accepts a string `moduleName` as an argument. This will remove an override **which takes effect the next time you
reload the page**. Returns a boolean that indicates whether the override existed.

```js
const wasRemoved = window.importMapOverrides.removeOverride("vue");
console.log(wasRemoved); // Either true or false
```

### resetOverrides

A function that removes all overrides from local storage, so that the next time the page is reloaded an override import map won't be created. Accepts
no arguments and returns the reset override import map.

```js
window.importMapOverrides.resetOverrides();
```

### getUrlFromPort

A function used internally by import-map-overrides to create a full url when calling `addOverride()` with just a
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

### enableUI

This will force the full import map overrides UI to be displayed (as long as the code for it is loaded on the page).

It will set local storage to match the `show-when-local-storage` key and/or it will append a `<import-map-overrides-full>` element to the DOM.

### mergeImportMap

This function accepts two arguments, `firstMap` and `secondMap`, and creates a new import map that is the first map merged with the second map. Items in the second map take priority.

```js
const firstMap = { imports: { foo: "./foo1.js" } };
const secondMap = { imports: { foo: "./foo2.js" } };

// {imports: {foo: './foo2.js'}}
window.importMapOverrides.mergeImportMap(firstMap, secondMap);
```

### getDefaultMap

This function returns a promise that resolves the import map(s) on the page, without the presence of any import map overrides.

```js
window.importMapOverrides.getDefaultMap().then((importMap) => {
  // The default map is the import map that exists on the page before any overrides are applied.
  // {imports: {}}
  console.log(importMap);
});
```

### getCurrentPageMap

This function returns a promise that resolves the final import map (including overrides) that was applied to the current page. Any overrides set after the page load will not be included.

```js
window.importMapOverrides.getCurrentPageMap().then((importMap) => {
  // The current page map is a merge of the default map and the overrides **at the time the page was loaded**.
  // Any overrides after the page was loaded will not show here.
  // {imports: {}}
  console.log(importMap);
});
```

### getNextPageMap

This function returns a promise that resolves with the final import map (including overrides) that will be applied the next time the page is reloaded.

```js
window.importMapOverrides.getNextPageMap().then((importMap) => {
  // The next page map is a merge of the default map and all overrides, including those that were applied **after the page was loaded**.
  // {imports: {}}
  console.log(importMap);
});
```

### disableOverride

This function accepts one argument, `moduleName`, and will temporarily disable an import map override. This is similar to `removeOverride()` except that it will preserve what the override URL was so that you can toggle the override on and off.

Returns true if the module was already disabled, and false otherwise.

```js
// Once disabled, some-module will be loaded from the default URL
window.importMapOverrides.disableOverride("some-module");
```

### enableOverride

This function accepts one argument, `moduleName`, and will will re-renable an import map override that was previously disabled via `disableOverride()`.

Returns true if the module was already disabled, and false otherwise.

```js
// Once enabled, some-module will be loaded from the override URL
window.importMapOverrides.enableOverride("some-module");
```

### getDisabledOverrides

A function that returns an array of strings, where each string is the name of a module that is currently disabled.

```js
// ['module-1', 'module-1']
window.importMapOverrides.getDisabledOverrides();
```

### isDisabled

A function that accepts one argument, `moduleName`, and returns a boolean indicated whether the string module name is a currently disabled or not.

```js
// true means it is disabled. false means enabled.
window.importMapOverrides.isDisabled("module-1");
```

### addExternalOverride

A function that accepts one argument, `urlToImportMap`, that sets up an override to an external import map that is hosted at a different URL. The external import map has lower precendence than inline overrides created via `addOverride()` when using multiple import maps, and higher precedence when using a single import map.

```js
window.importMapOverrides.addExternalOverride(
  "https://localhost:8080/my-override-import-map.json"
);
```

### removeExternalOverride

A function that accepts one argument, `urlToImportMap`, that removes an external import map override. Returns a boolean that indicates whether the override existed in the first place.

```js
// A return value of true means the override existed in the first place
window.importMapOverrides.removeExternalOverride(
  "https://localhost:8080/my-override-import-map.json"
);
```

### getExternalOverrides

A function that returns an array of string URLs, where each string is the URL to an external override import map.

```js
// ['https://localhost:8080/my-override-import-map.json', 'https://some-cdn.com/importmap.json']
window.importMapOverrides.getExternalOverrides();
```

### getCurrentPageExternalOverrides

Similar to `getExternalOverrides()`, except it ignores any changes to the external overrides since the page was loaded.

```js
// ['https://localhost:8080/my-override-import-map.json']
window.importMapOverrides.getExternalOverrides();
```

### getExternalOverrideMap

A function that returns a promise that resolves with the merged import map of all external override import maps. You can provide an array of strings `urlsToImportMap` to control which external import maps to fetch and merge.

```js
window.importMapOverrides.getExternalOverrideMap().then((importMap) => {
  // {imports: {foo: './foo.js'}}
  console.log(importMap);
});

window.importMapOverrides
  .getExternalOverrideMap(["https://some-url.com/importmap.json"])
  .then((importMap) => {
    // {imports: {foo: './bar.js'}}
    console.log(importMap);
  });
```

### isExternalMapValid

Takes one argument, `urlToImport`, and returns a promise that resolves with a boolean. When `true`, the url provided is one that hosts a valid import map. When `false`, the url provided doesn't host a valid import map.

```js
// true | false. True means the external map was successfully downloaded and parsed as json
window.importMapOverrides.isExternalMapValid(
  "https://localhost:8080/my-custom-override-import-mapm.json"
);
```

### Events

#### Init

The import-map-overrides library fires an event called `import-map-overrides:init` on the window when the library has successfully initialized. Note that this event will not fire if import-map-overrides is disabled.

```sh
window.addEventListener("import-map-overrides:init", () => {
  console.log('init');
})
```

#### Change

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

## Node

import-map-overrides exposes functions for applying overrides to import maps in NodeJS. This is commonly paired with [`@node-loader/import-maps`](https://github.com/node-loader/node-loader-import-maps), but can be used with any javascript object that is an import map.

### applyOverrides

A function that merges overrides into an import map.

**Arguments:**

- `importMap`: An object that is an import map (has an `imports` object property)
- `overrides`: An object where the keys are import specifiers and the values are their URLs in the import map.

**Return value:**

A **new** import map with the overrides applied. The original map remains unmodified.

```js
import { applyOverrides } from "import-map-overrides";

const importMap = {
  imports: {
    foo: "./foo.js",
    bar: "./bar.js",
  },
};

const overrides = {
  bar: "./overridden-bar.js",
};

const overriddenMap = applyOverrides(importMap, overrides);
/*
{
  imports: {
    foo: './foo.js',
    bar: './overridden-bar.js'
  }
}
*/
```

### getOverridesFromCookies

A function that accepts an [HTTP Incoming Message](https://nodejs.org/api/http.html#http_class_http_incomingmessage) (commonly referred to as `req`) and returns an object of import map overrides. The cookies are generally set by the import-map-overrides browser library, and are of the format `import-map-override:module-name=https://localhost:8080/module-name.js`.

**Arguments:**

- `req` (required): An [HTTP Incoming Message](https://nodejs.org/api/http.html#http_class_http_incomingmessage). The `req` objects from Express / Hapi servers are supported.
- `getUrlFromPort` (optional): A function that converts a port number to a full URL. Defaults to generating a localhost URL.

```js
import { getOverridesFromCookies, applyOverrides } from "import-map-overrides";

const overrides = getOverridesFromCookies(req);

const mapWithOverrides = applyOverrides(originalMap, overrides);

// Optionally convert port numbers to URLs
const overrides = getOverridesFromCookies(req, (port, moduleName, req) => {
  return `https://localhost:${port}/${moduleName}.js`;
});
```
