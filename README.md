# import-map-overrides
A javascript library for being able to override import maps in the browser

## Installation / Usage
import-map-overrides is used via a global variable `window.importMapOverrides`. The global variable because this needs to be
usable regardless of build config and without using ESM modules, since once you use ESM modules you can no longer modify the import map.

You can install import-map-overrides either through a script tag:

```html
<!-- Make sure to put this BEFORE any <script type="module"> elements or any System.import() calls -->
<script type="text/javascript" src="https://unpkg.com/import-map-overrides"></script>
```

Alternatively, you can use it as an npm package:
```sh
npm install --save import-map-overrides
# Or
yarn add import-map-overrides
```

```js
// Make sure this js file gets executed BEFORE any <script type="module"> elements or any System.import() calls -->
import 'import-map-overrides'; // this only will work if you compile the `import` down to an iife via webpack, rollup, parcel, etc
```

## API
import-map-overrides provides the following functions. Note that these functions are always put onto window.importMapOverrides, even
if you installed it as an npm package.

- `window.importMapOverrides.getOverrideMap()` - Returns the override import map as an object. The returned object represents the overrides
**that will take effect the next time you reload the page**, including any additions or removals you've recently made.
```js
const overrideMap = window.importMapOverrides.getOverrideMap()
console.log(overrideMap)
/*
{
  "imports": {
    "module1": "https://mycdn.com/module1.js",
    "lodash": "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.core.js"
  }
}
*/
```

- `window.importMapOverrides.addOverride(moduleName, url)`: Accepts a string `moduleName` and a string `url` as arguments. This will
set up an override **which takes effect the next time you reload the page**.

```js
window.importMapOverrides.addOverride('react', 'https://unpkg.com/react')
```

- `window.importMapOverrides.removeOverride(moduleName)`: Accepts a string `moduleName` as an argument. This will remove an override
**which takes effect the next time you reload the page**. Returns a boolean that indicates whether the override existed.

```js
const wasRemoved = window.importMapOverrides.removeOverride('vue')
console.log(wasRemoved) // Either true or false
```