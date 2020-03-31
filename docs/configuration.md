# Configuration

import-map-overrides has two primary configuration options:

1. [Import Map Type](#import-map-type)
2. [Override Mode](#override-mode)

## Import Map Type

By default, import map overrides will assume you are working with native import maps. However, other import map polyfills (such as SystemJS) can also be used with import map overrides.

If using an import map polyfill, you must indicate what kind of import map you are setting overrides for. You do this by inserting you must add a `<meta>`
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

**Notes:**

1. Native import maps are only supported in Chrome@>=76 under the _Experimental Web Platform Features_ flag. Only one import map (including the import-map-overrides map) can be on a web page at a time when using native import maps. ([Details](https://github.com/WICG/import-maps/issues/199)).

## Override Mode

To support a variety of use cases, import map overrides has four "override modes" that control how and whether import-map-overrides inserts import maps into the DOM:

1. [Client-side multiple maps](client-side-multiple-maps) (default)
1. [Client-side single map](client-side-single-map)
1. [Server-side multiple maps](server-side-multiple-maps)
1. [Server-side single map](server-side-single-map)

If you're just getting started, first try client-side multiple import maps.

Client-side versus server-side refers to whether the browser or server is responsible for ensuring that the override is applied. Multiple maps refers to multiple `<script>` elements on the same web page.

The table below shows the pros and cons of each mode

| Mode                      | Native import maps | SystemJS           | es-module-shims    | Works with [external maps](https://github.com/WICG/import-maps#installation) | Overrides when server rendering | Easy to set up     |
| ------------------------- | ------------------ | ------------------ | ------------------ | ---------------------------------------------------------------------------- | ------------------------------- | ------------------ |
| Client-side multiple maps | :x:                | :white_check_mark: | :white_check_mark: | :white_check_mark:                                                           | :x:<sup>1</sup>                 | :white_check_mark: |
| Client-side single map    | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:<sup>2</sup>                                                              | :x:<sup>1</sup>                 | :white_check_mark: |
| Server-side multiple maps | :x:                | :white_check_mark: | :white_check_mark: | :white_check_mark:                                                           | :thinking:<sup>3</sup>          | :x:                |
| Server-side single map    | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:                                                           | :white_check_mark:<sup>4</sup>  | :x:                |

**Notes:**

1. "Server rendering" refers to when the web server uses the same modules as the browser to dynamically generate the HTML page.
1. An [external import map](https://github.com/WICG/import-maps#installation) is one that is one with `<script type="importmap" src="/some-url.importmap">`. Import-map-overrides executes synchronously, which eliminates the possibility of using a single client-side map to override an external map (that must first be downloaded, before it can be injected into the DOM).
1. When in server-side multiple maps mode, import-map-overrides will inject an override map into the DOM. However, it cannot ensure that the server respected the override to generate the HTML page.
1. When using server-side single map mode, your server can ensure that the override is applied to both the server-side code and the client-code.

### Client-side multiple maps

In client-side multiple maps mode, import-map-overrides will synchronously inject an override import map into the DOM. The import map will be inserted right after the last import map in the DOM, if one exists.

```html
<!-- The import map in the HTTP response body -->
<script type="systemjs-importmap">
  {
    "imports": {
      "foo: "./foo.js"
    }
  }
</script>
<!-- The import map dynamically injected by import-map-overrides -->
<script type="systemjs-importmap">
  {
    "imports": {
      "foo: "./overridden-url.js"
    }
  }
</script>
<!-- Load import-map-overrides before systemjs -->
<script src="https://cdn.jsdelivr.net/npm/import-map-overrides/dist/import-map-overrides.js"></script>
<script src="https://cdn.jsdelivr.net/npm/systemjs/dist/system.js"></script>
```

Client-side multiple maps mode is the default mode and will be used unless you enable one of the other modes.

### Client-side single map

The import maps specification [only allows for a single import map per web page](https://github.com/WICG/import-maps/#multiple-import-map-support). Many import map polyfills, including systemjs and es-module-shims, allow for multiple import maps that are merged together.

To use single import map mode, change the `type` attribute of your import map to be `overridable-importmap`:

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

The `overridable-importmap` will be ignored by the browser, but import-map-overrides will insert an import map with the correct script `type` attribute and overrides applied, which will be used by the browser.

Note that `overridable-importmap` scripts must be inline import maps, not external maps (those with `src=""`). This is because import-map-overrides executes synchronously to inject the single map, but downloading an external map is inherently asynchronous.

## Server-side multiple maps

If your server needs to be aware of import map overrides, you may use server-side multiple maps mode. To enable this mode, add a `server` attribute to your `<meta name="importmap-type">` element:

```html
<meta name="importmap-type" content="systemjs-importmap" server-cookie />
```

Once enabled, a cookie is sent to the server for each override. The format of the cookies is `import-map-overrides:module-name=http://localhost:8080/module-name.js`.

In addition to the cookie, the import-map-overrides library will automatically inject an overrides import map into the DOM.

## Server-side single map

To enable server-side single map mode, add `server-cookie` and `server-only` attributes to your `<meta name="importmap-type">` element:

```html
<!-- "server-cookie" means the import map overrides will be sent to the server in a cookie --->
<!-- "server-only" means that import-map-overrides will not insert an override map into the DOM -->
<meta
  name="importmap-type"
  content="systemjs-importmap"
  server-cookie
  server-only
/>
```

Once enabled, a cookie is sent to the server for each override. The format of the cookies is `import-map-overrides:module-name=http://localhost:8080/module-name.js`.

In this mode, import-map-overrides library will no longer dynamically inject any override maps into the DOM. Instead, your web server is expected to read the `import-map-overrides:` cookies and update the URLs in its inlined import map accordingly.
