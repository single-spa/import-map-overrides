# Configuration

import-map-overrides has two primary configuration options:

1. [Import Map Type](#import-map-type)
2. [Override Mode](#override-mode)
3. [Domain List](#domain-list)

## Import Map Type

By default, import map overrides will assume you are working with native import maps. However, other import map polyfills (such as SystemJS) can also be used with import map overrides.

If using an import map polyfill, you must indicate what kind of import map you are setting overrides for. You do this by inserting a `<meta>`
element to your html file **before the import-map-overrides library is loaded**.

```html
<!-- example configuration for a SystemJS import map -->
<meta name="importmap-type" content="systemjs-importmap" />

<!-- example configuration for a native import map -->
<meta name="importmap-type" content="importmap" />

<!-- example configuration for a native import map using import-map-injector -->
<meta name="importmap-type" content="importmap" use-injector />
```

| Import Map type                                                  | `importmap-type`      |
| ---------------------------------------------------------------- | --------------------- |
| Native <sup>1</sup>                                              | `importmap` (default) |
| [SystemJS](https://github.com/systemjs/systemjs)                 | `systemjs-importmap`  |
| [es-module-shims](https://github.com/guybedford/es-module-shims) | `importmap-shim`      |

### use-injector

The `use-injector` attribute instructs import-map-overrides to skip inserting an import-map into the DOM, instead expecting the [import-map-injector](https://github.com/single-spa/import-map-injector) project to do so. This is necessary since browsers do not support multiple import maps on the same page.

For more details, see [injector override mode](#client-side-injector) [import-map-injector docs](https://github.com/single-spa/import-map-injector#compatibility)

## Override Mode

To support a variety of use cases, import map overrides has four "override modes" that control how and whether import-map-overrides inserts import maps into the DOM:

1. [Client-side multiple maps](#client-side-multiple-maps) (default)
1. [Client-side single map](#client-side-single-map)
1. [Client-side import-map-injector](#client-side-injector)
1. [Server-side multiple maps](#server-side-multiple-maps)
1. [Server-side single map](#server-side-single-map)

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
1. An [external import map](https://github.com/WICG/import-maps#installation) is one with `<script type="importmap" src="/some-url.importmap">`. Import-map-overrides executes synchronously, which eliminates the possibility of using a single client-side map to override an external map (that must first be downloaded, before it can be injected into the DOM).
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

### Client-side injector

If using [import-map-injector](https://github.com/single-spa/import-map-injector), import-map-overrides is not responsible for inserting the importmap script element into the DOM. To use the two projects together, do the following:

1. Load import-map-overrides.js **before** import-map-injector.js

```html
<!-- overrides before injector -->
<script src="import-map-overrides.js"></script>
<script src="import-map-injector.js"></script>
```

2. Add the `use-injector` attribute to the `<meta name="importmap-type">` element that configures import-map-overrides. See [import-map-overrides docs](https://github.com/single-spa/import-map-overrides/blob/main/docs/configuration.md#import-map-type) for more details

```html
<meta name="importmap-type" use-injector />
```

### Server-side multiple maps

If your server needs to be aware of import map overrides, you may use server-side multiple maps mode. To enable this mode, add a `server` attribute to your `<meta name="importmap-type">` element:

```html
<meta name="importmap-type" content="systemjs-importmap" server-cookie />
```

Once enabled, a cookie is sent to the server for each override. The format of the cookies is `import-map-overrides:module-name=http://localhost:8080/module-name.js`.

In addition to the cookie, the import-map-overrides library will automatically inject an overrides import map into the DOM.

### Server-side single map

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

## Domain List

If you wish to reuse the same HTML file on multiple domains (usually for dev/test/stage/prod environments), you can configure which domains import-map-overrides is enabled for. This feature was built so that it is easy to turn off import-map-overrides in production environments. Turning off import-map-overrides in production does not make your web application more secure ([explanation](./security.md)), but may be desireable for other reasons such as preventing users from finding a dev-only tool by [setting local storage](./ui.md).

An alternative way of accomplishing this is to serve a different HTML file for your production environment than other environments. That implementation is more performant since you avoid downloading the import-map-overrides library entirely when it will not be used. If that option is possible and practical for you, it is probably better than using `import-map-overrides-domains`.

To configure domains, add a `<meta name="import-map-overrides-domains">` element to your HTML page. You can specify either an an allow-list or a deny-list in the `content` attribute. Allow lists never result in unintended domains being able to use import-map-overrides, but require you to update the allow list every time you create a non-prod environment, which can be a bit of a nuisance. If you have a single production environment with many non-prod environments, a deny-list might be easier.

```html
<!-- Disable the entirety of import-map-overrides unless you're on the dev or stage environments -->
<meta
  name="import-map-overrides-domains"
  content="allowlist:dev.example.com,stage.example.com"
/>

<!-- Disable the entirety of import-map-overrides when you're on the production environment -->
<meta name="import-map-overrides-domains" content="denylist:prod.example.com" />

<!-- You can also use wildcards url -->
<meta
  name="import-map-overrides-domains"
  content="allowlist:*.example.com,example-*.com"
/>
```

## Query Parameter Overrides

import-map-overrides has an opt-in feature that allows users to set overrides via the `imo` query parameter on the current page. When enabled, the `imo` query parameter value should be a URL-encoded import map. For example, an override map of `{"imports": {"module1": "/module1.js"}}` would be encoded via https://example.com?imo=%7B%22imports%22%3A%7B%22module1%22%3A%22%2Fmodule1.js%22%7D%7D

To enable query parameter overrides, add the `allow-query-param-override` attribute to the `<meta name="importmap-type">` element:

```html
<meta
  name="importmap-type"
  content="systemjs-importmap"
  allow-query-param-override
/>
```
