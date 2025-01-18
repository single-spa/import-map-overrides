import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import packageJson from "./package.json" with { type: "json" };

const isProduction = process.env.NODE_ENV === "production";

export default [
  // Full library with UI
  {
    input: "src/import-map-overrides.js",
    output: {
      banner: `/* import-map-overrides@${packageJson.version} */`,
      file: "dist/import-map-overrides.js",
      format: "iife",
      sourcemap: true,
    },
    plugins: [
      babel({
        exclude: "node_modules/**",
        babelHelpers: "bundled",
      }),
      nodeResolve(),
      postcss({
        inject: false,
      }),
      isProduction &&
        terser({
          compress: {
            passes: 2,
          },
          output: {
            comments: terserComments,
          },
        }),
    ],
  },
  // Only the global variable API. No UI
  {
    input: "src/import-map-overrides-api.js",
    output: {
      banner: `/* import-map-overrides@${packageJson.version} */`,
      file: "dist/import-map-overrides-api.js",
      format: "iife",
      sourcemap: true,
    },
    plugins: [
      babel({
        exclude: "node_modules/**",
        babelHelpers: "bundled",
      }),
      isProduction &&
        terser({
          compress: {
            passes: 2,
          },
          output: {
            comments: terserComments,
          },
        }),
    ],
  },
  // Server ESM
  {
    input: "src/import-map-overrides-server.js",
    output: {
      banner: `/* import-map-overrides@${packageJson} (server) */`,
      file: "dist/import-map-overrides-server.js",
      format: "es",
      sourcemap: true,
    },
    plugins: [
      babel({
        exclude: "node_modules/**",
        presets: [
          [
            "@babel/preset-env",
            {
              browserslistEnv: "server",
            },
          ],
        ],
      }),
      isProduction &&
        terser({
          compress: {
            passes: 2,
          },
          output: {
            comments: terserComments,
          },
        }),
    ],
  },
];

function terserComments(node, comment) {
  const text = comment.value;
  return text.trim().startsWith(`import-map-overrides@`);
}
