import js from "@eslint/js";
import nx from "@nx/eslint-plugin";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

const boundaryRule = [
  "error",
  {
    allow: [],
    depConstraints: [
      {
        sourceTag: "type:domain",
        onlyDependOnLibsWithTags: ["type:domain"],
      },
      {
        sourceTag: "type:content",
        onlyDependOnLibsWithTags: ["type:domain"],
      },
      {
        sourceTag: "type:data-access",
        onlyDependOnLibsWithTags: [
          "type:data-access",
          "type:domain",
          "type:content",
        ],
      },
      {
        sourceTag: "type:ui",
        onlyDependOnLibsWithTags: ["type:ui"],
      },
      {
        sourceTag: "type:app",
        onlyDependOnLibsWithTags: [
          "type:domain",
          "type:content",
          "type:data-access",
          "type:ui",
        ],
      },
    ],
  },
];

const sharedRules = {
  plugins: {
    "@nx": nx,
  },
  rules: {
    "@nx/enforce-module-boundaries": boundaryRule,
  },
};

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/storybook-static/**"],
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    extends: [js.configs.recommended],
    ...sharedRules,
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.strictTypeChecked],
    ...sharedRules,
    rules: {
      ...sharedRules.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": true,
          "ts-ignore": true,
          "ts-nocheck": true,
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  prettier,
);
