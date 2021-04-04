module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['import', 'typescript', '@typescript-eslint', 'prettier'],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  ignorePatterns: ["/*.js"],
  settings: {
    'import/resolver': {
      node: {
        paths: ['/src', '/typings'],
      },
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    'prettier/prettier': 1,
    'no-console': ['warn', {allow: ['warn', 'error', 'log']}],
    eqeqeq: ['warn', 'always'],
    'prefer-const': ['error', {destructuring: 'all', ignoreReadBeforeAssign: true}],
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/no-triple-slash-reference': 0,
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/no-this-alias': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/triple-slash-reference': ['error', {path: 'always', types: 'never', lib: 'never'}],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-namespace': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/ban-types': 0,
    quotes: ['error', 'single', {avoidEscape: true, allowTemplateLiterals: false}],
  },
};
