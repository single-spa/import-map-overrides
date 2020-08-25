# Security

The import-map-overrides library allows a user to modify which javascript code is executed in their browser. This is something the user can do to themself **even without import-map-overrides** by executing code in the browser console or by falling victim to a [self XSS](https://en.wikipedia.org/wiki/Self-XSS) attack. Import map overrides does not make it more possible for the user to fall victim to such an attack.

However, there are things you can do to protect your users from self XSS. Consider the following security precautions:

1. (**Most Important and Highly Recommended**) Configure your server to set a [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) HTTP header for your HTML file. In it, consider safelisting the domains that you trust. Doing so is important to protect your users from XSS and other attacks.
1. Consider removing import-map-overrides from your production application's HTML file, or [configuring a domain list](/docs/configuration.md#domain-list) that disables import map overrides in production. If you properly set a Content-Security-Policy header, this provides no extra security. However, if you have not configured CSP, this will at least make it a bit harder for the user to self XSS. My recommendation is to do CSP instead of this whenever possible.
