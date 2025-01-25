# User Interface

The UI for import-map-overrides gives visual indication when any module is overridden, so that you know whether to blame your override
or not when things are broken. It also lets you view and modify urls for all the modules in your import map.

## Enabling the UI

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

<!--
  Optionally, you can control the position of the button opening the popup, by
  setting the trigger-position attribute.
  You can set it to one of the following values: "bottom-right", "bottom-left",
  "top-right" or "top-left". 
  If you omit the trigger-position attribute, the button will be positioned, by
  default, at the bottom right of the window. 
-->
<import-map-overrides-full
  trigger-position="bottom-left"
></import-map-overrides-full>

<!--
   Optionally supply a nonce that will be added to the style tag used to style the import-map-overrides UI. 
   This is useful if you are using a Content Security Policy(CSP)
-->
<import-map-overrides-full
  style-nonce="NWFjZDlhNTctYTMzZC00MmZjLWJhYzAtZWJmOWYwNTQ0MTdh"
></import-map-overrides-full>

<!-- Alternatively, just the black popup itself -->
<import-map-overrides-popup></import-map-overrides-popup>

<!-- Optionally supply a nonce that will be added to the style tag used to style the import-map-overrides UI. 
   This is useful if you are using a Content Security Policy(CSP) -->
<import-map-overrides-popup
  style-nonce="NWFjZDlhNTctYTMzZC00MmZjLWJhYzAtZWJmOWYwNTQ0MTdh"
></import-map-overrides-popup>

<!-- Or if you only want the actual import map list and UI for overriding -->
<import-map-overrides-list></import-map-overrides-list>

<!-- Optionally supply a nonce that will be added to the style tag used to style the import-map-overrides UI. 
   This is useful if you are using a Content Security Policy(CSP) -->
<import-map-overrides-list
  style-nonce="NWFjZDlhNTctYTMzZC00MmZjLWJhYzAtZWJmOWYwNTQ0MTdh"
></import-map-overrides-list>

<!-- Or if you prefer enabling via javascript -->
<script>
  importMapOverrides.enableUI();
</script>
```

## Not using the UI

The UI is completely optional. If you don't want to use it, simply don't include the `<import-map-overrides-full>`
custom element in your page. Additionally, you can use the
[`/dist/import-map-overrides-api.js` file](https://unpkg.com/browse/import-map-overrides/dist/import-map-overrides-api.js)
instead of [`/dist/import-map-overrides.js`](https://unpkg.com/browse/import-map-overrides/dist/import-map-overrides.js),
which avoids downloading the code for the UI and reduces the library size.

## Inline versus external overrides

In the UI, you can add inline overrides and external overrides.

An _inline override_ is an override for a single module. Each inline override is stored in local storage. You may add inline overrides by clicking on a module or on "Add Module".

An _external override_ is a partial import map hosted on a different server. Any imports in that external import map will be applied as overrides to the current page's imports. You can add external overrides by clicking on the "Add import map" button. Note that external overrides are only supported in [multiple import map modes](/docs/configuration.md#override-modes).
