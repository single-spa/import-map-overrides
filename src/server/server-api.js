import { parse } from "cookie";

const cookiePrefix = "import-map-override:";
const portRegex = /^\d+$/g;

/**
 * @typedef {
 *   imports: object,
 *   scopes?: object
 * } ImportMap
 *
 * @param {ImportMap} importMap
 * @param {overrides} object
 * @returns {ImportMap}
 */
export function applyOverrides(importMap, overrides) {
  const newMap = {
    imports: { ...importMap.imports },
    scopes: { ...(importMap.scopes || {}) },
  };
  for (let key in overrides) {
    newMap.imports[key] = overrides[key];
  }

  return newMap;
}

/**
 *
 * @param {import('http').IncomingMessage} req
 * @returns {ImportMap}
 */
export function getOverridesFromCookies(
  req,
  getUrlFromPort = defaultGetUrlFromPort,
) {
  const parsedCookies = parse(req.headers["cookie"] || "");

  const overrides = {};

  for (let cookieName in parsedCookies) {
    if (cookieName.startsWith(cookiePrefix)) {
      const moduleName = cookieName.slice(cookiePrefix.length);

      // skip empty string
      if (moduleName) {
        let url = parsedCookies[cookieName];
        if (portRegex.test(url)) {
          url = (getUrlFromPort || defaultGetUrlFromPort)(url, moduleName, req);
        }

        if (url.startsWith("//")) {
          url = `${req.protocol}:${url}`;
        }

        overrides[moduleName] = url;
      }
    }
  }

  return overrides;
}

function defaultGetUrlFromPort(port, moduleName, req) {
  const fileName = moduleName.replace(/@/g, "").replace(/\//g, "-");
  return `${req.protocol}://localhost:${port}/${fileName}`;
}
