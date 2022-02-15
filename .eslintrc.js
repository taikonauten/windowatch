
module.exports = {
  env: {
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    './node_modules/@taikonauten/linters-js/eslint/index.js',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {},
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [],
  overrides: [
    {
      files: ['*.js'],
      env: {
        node: true,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        './node_modules/@taikonauten/linters-js/eslint/index.js',
        './node_modules/@taikonauten/linters-typescript/eslint/index.js',
      ],
      plugins: [
        '@typescript-eslint',
      ],
    }
  ],
};
