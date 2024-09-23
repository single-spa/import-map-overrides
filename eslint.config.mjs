import es5 from "eslint-plugin-es5";
import babelParser from "@babel/eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("important-stuff"),
  {
    plugins: {
      es5,
    },

    languageOptions: {
      parser: babelParser,
    },

    rules: {
      "es5/no-es6-methods": "error",
      "es5/no-es6-static-methods": "error",
      "es5/no-binary-and-octal-literals": "error",
      "es5/no-classes": "off",
      "es5/no-for-of": "off",
      "es5/no-generators": "error",
      "es5/no-object-super": "error",
      "es5/no-typeof-symbol": "error",
      "es5/no-unicode-code-point-escape": "error",
      "es5/no-unicode-regex": "error",
      "es5/no-computed-properties": "off",
      "es5/no-destructuring": "off",
      "es5/no-default-parameters": "off",
      "es5/no-spread": "off",
      "es5/no-modules": "off",
      "es5/no-exponentiation-operator": "off",
      "es5/no-block-scoping": "off",
      "es5/no-arrow-functions": "off",
      "es5/no-shorthand-properties": "off",
      "es5/no-rest-parameters": "off",
      "es5/no-template-literals": "off",
    },
  },
  {
    files: ["src/server/**/*"],

    rules: {
      "es5/no-es6-methods": "off",
      "es5/no-es6-static-methods": "off",
      "es5/no-binary-and-octal-literals": "off",
      "es5/no-classes": "off",
      "es5/no-for-of": "off",
      "es5/no-generators": "off",
      "es5/no-object-super": "off",
      "es5/no-typeof-symbol": "off",
      "es5/no-unicode-code-point-escape": "off",
      "es5/no-unicode-regex": "off",
    },
  },
];
