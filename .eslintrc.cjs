// @ts-check
const { defineConfig } = require('eslint-define-config');

const projects = defineConfig({
  parserOptions: {
    project: [
      './tsconfig.eslint.json',
      './tsconfig.util.json',
      './tsconfig.tests.json',
    ],
  },
}).parserOptions?.project;

const baseRules = defineConfig({
  rules: {
    // Airbnb prefers forEach
    'unicorn/no-array-for-each': 'off',
    // apparently default export = bad
    'import/prefer-default-export': 'off',
    'no-void': 'off',
    'no-underscore-dangle': [
      'warn',
      {
        enforceInClassFields: false,
        allowAfterThis: true,
        allowFunctionParams: true,
      },
    ],
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          args: true,
          func: true,
          fn: true,
        },
      },
    ],
  },
}).rules;

const testRules = defineConfig({
  rules: {
    'no-promise-executor-return': 'off',
    'func-names': 'off',

    'n/no-unpublished-import': [
      'error',
      {
        allowModules: [
          'chai',
          'sinon',
          // 'sinon-chai', // for should and expect
          'deep-equal-in-any-order',
          'chai-as-promised',
        ],
      },
    ],
  },
}).rules;

const prettierRules = defineConfig({
  rules: {
    'prettier/prettier': 'warn',
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
  },
}).rules;

module.exports = {
  root: true,
  env: {
    // browser: true,
    node: true,
    es2022: true,
  },
  ignorePatterns: ['.eslintrc.cjs', '.mocharc.cjs'],
  overrides: [
    {
      files: ['*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'],
      extends: [
        'eslint:recommended',
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
        'plugin:n/recommended',
        'plugin:promise/recommended',
        'plugin:unicorn/recommended',
        'plugin:eslint-comments/recommended',
      ],
      plugins: ['@typescript-eslint', 'n', 'promise', 'unicorn', 'eslint-comments'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          // https://typescript-eslint.io/architecture/parser#configuration
          // jsx: true,
        },
        project: projects,
        tsconfigRootDir: __dirname,
      },
    },
    {
      env: {
        mocha: true,
      },
      files: ['tests/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
      extends: ['plugin:mocha/recommended'],
      plugins: ['mocha'],
      rules: {
        ...testRules,
      },
    },
    {
      // to make sure the rules come at the end
      files: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
      extends: ['prettier'],
      plugins: ['prettier'],
      rules: {
        ...baseRules,
        ...prettierRules,

        // TODO: https://github.com/import-js/eslint-plugin-import/issues/1485#issuecomment-535351922
        'import/no-unresolved': 'off',
      },
    },
  ],
};
