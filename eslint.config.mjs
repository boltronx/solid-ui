import js from "@eslint/js";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import solid from "eslint-plugin-solid";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["**/dist/**", "**/coverage/**", "**/node_modules/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  solid.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "simple-import-sort": simpleImportSort
    },
    rules: {
      // These helpers call their callbacks from DOM events, where reading props is fine.
      "solid/reactivity": [
        "warn",
        { customReactiveFunctions: ["onFormReset", "keepControlledOnReset"] }
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side effect imports (CSS) stay first so styling order doesn't break
            ["^\\u0000"],
            // Node.js built-ins
            ["^node:"],
            // SolidJS packages
            ["^solid-js", "^@solidjs"],
            // Other packages
            ["^@?\\w"],
            // Parent imports
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Sibling imports
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"]
          ]
        }
      ]
    }
  }
];
