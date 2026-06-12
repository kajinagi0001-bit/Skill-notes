import eslintPluginAstro from "eslint-plugin-astro";
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      ".astro/**",
      ".tools/**",
      "dist/**",
      "node_modules/**",
      "public/pagefind/**",
    ],
  },
  ...eslintPluginAstro.configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: typescriptParser,
      },
    },
  },
];
