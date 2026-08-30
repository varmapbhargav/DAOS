import globals from 'globals';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: { project: null },
    },
    plugins: { 'simple-import-sort': simpleImportSort },
    extends: [...tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    // Layer boundary: domain code must not import infrastructure/interface or Nest runtime.
    files: ['apps/*/src/domain/**/*.ts', 'libs/shared-kernel/src/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['*infrastructure*', '*interface*', '@nestjs/*'] }],
    },
  },
);
