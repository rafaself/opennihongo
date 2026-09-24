import nx from '@nx/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

const boundaryRule = [
  'error',
  {
    allow: [],
    depConstraints: [
      {
        sourceTag: 'type:domain',
        onlyDependOnLibsWithTags: ['type:domain'],
      },
      {
        sourceTag: 'type:data-access',
        onlyDependOnLibsWithTags: ['type:data-access', 'type:domain'],
      },
      {
        sourceTag: 'type:ui',
        onlyDependOnLibsWithTags: ['type:ui'],
      },
      {
        sourceTag: 'type:app',
        onlyDependOnLibsWithTags: ['type:domain', 'type:data-access', 'type:ui'],
      },
    ],
  },
]

const boundaryConfig = {
  plugins: {
    '@nx': nx,
  },
  rules: {
    '@nx/enforce-module-boundaries': boundaryRule,
  },
}

export default [
  {
    ignores: ['**/dist/**', '**/storybook-static/**'],
  },
  {
    ...boundaryConfig,
    files: ['**/*.{js,jsx,mjs,cjs}'],
  },
  {
    ...boundaryConfig,
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
]
