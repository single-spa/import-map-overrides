import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import resolve from "rollup-plugin-node-resolve";
import postcss from "rollup-plugin-postcss";

export default [
  // Full library with UI
  {
    input: "src/import-map-overrides.js",
    output: {
      file: "dist/import-map-overrides.js",
      format: "iife",
      sourcemap: true
    },
    plugins: [
      babel({
        exclude: "node_modules/**"
      }),
      resolve(),
      postcss(),
      terser({
        compress: {
          passes: 2
        },
        sourcemap: true
      })
    ]
  },
  // Only the global variable API. No UI
  {
    input: "src/import-map-overrides-api.js",
    output: {
      file: "dist/import-map-overrides-api.js",
      format: "iife",
      sourcemap: true
    },
    plugins: [
      babel({
        exclude: "node_modules/**"
      }),
      terser({
        compress: {
          unsafe: true,
          passes: 2
        },
        sourcemap: true
      })
    ]
  }
];
