## styling the ui button with custom css rules

```css
import-map-overrides-full::part(button with-overrides) {
    /* styles to be applied to the button when overrides are present */
    color: green;
}

import-map-overrides-full::part(button) {
    /* styles to be applied to the button when overrides are not present */
    color: green;
}

import-map-overrides-full::part(button with-overrides):hover {
    /* styles to be applied to the button when overrides are present and it is hovered */
    border: 5px solid black;
}
```

