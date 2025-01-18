# import-map-overrides

## 5.0.0

### Major Changes

- [#126](https://github.com/single-spa/import-map-overrides/pull/126) [`2241fed`](https://github.com/single-spa/import-map-overrides/commit/2241feddf19cac3c387b364ebec9ffc21fe10b6f) Thanks [@agevry](https://github.com/agevry)! - The css for import-map-overrides UI is no longer injected into the main page, but only within the shadow dom for the UI

### Minor Changes

- [#126](https://github.com/single-spa/import-map-overrides/pull/126) [`2241fed`](https://github.com/single-spa/import-map-overrides/commit/2241feddf19cac3c387b364ebec9ffc21fe10b6f) Thanks [@agevry](https://github.com/agevry)! - Add style-nonce attribute to import-map-overrides-full element to support use under a Content Security Policy(CSP)

## 4.2.0

### Minor Changes

- [#121](https://github.com/single-spa/import-map-overrides/pull/121) [`1381dc0`](https://github.com/single-spa/import-map-overrides/commit/1381dc01baba839c1366ec64afb5f8b70850fcc2) Thanks [@joeldenning](https://github.com/joeldenning)! - Add new getOverrideScopes API for inheriting scoped dependencies for overridden modules

## 4.1.0

### Minor Changes

- [#117](https://github.com/single-spa/import-map-overrides/pull/117) [`a7c7970`](https://github.com/single-spa/import-map-overrides/commit/a7c79702f9a6bc17fdf47fe6f2d4806330bbcf6c) Thanks [@joeldenning](https://github.com/joeldenning)! - New `use-injector` attribute on `<meta type="importmap-type">` element

  New `resetDefaultMap` js api

## 4.0.1

### Patch Changes

- [#114](https://github.com/single-spa/import-map-overrides/pull/114) [`4b180f6`](https://github.com/single-spa/import-map-overrides/commit/4b180f6f34d9a7b6153838819e3b68861158bf39) Thanks [@joeldenning](https://github.com/joeldenning)! - Update inline override icon to avoid CSP issues

## 4.0.0

### Major Changes

- [#104](https://github.com/single-spa/import-map-overrides/pull/104) [`fa6a22c`](https://github.com/single-spa/import-map-overrides/commit/fa6a22c27e786c88c314efe532871ff15d5089e0) Thanks [@artygus](https://github.com/artygus)! - Disable query parameter overrides, by default. Add support for `allow-query-param-override` attribute to `<meta>` element, to opt-in to query parameter overrides.

- [#112](https://github.com/single-spa/import-map-overrides/pull/112) [`0b60e71`](https://github.com/single-spa/import-map-overrides/commit/0b60e71da26b762d023fd304d430ae39126f8643) Thanks [@joeldenning](https://github.com/joeldenning)! - Upgrade rollup build from v2 to v4. Upgrade cookie dependency from 0.4 to 0.6. Upgrade all devDependencies

## 3.1.1

### Patch Changes

- [#96](https://github.com/single-spa/import-map-overrides/pull/96) [`cd137ce`](https://github.com/single-spa/import-map-overrides/commit/cd137ce9edcbf7d3c5571e1c630c21bdee81979e) Thanks [@robmosca](https://github.com/robmosca)! - Add tests on API and automate release flow
