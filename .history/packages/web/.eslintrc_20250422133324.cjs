module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // Needed for React 17+ JSX transform
    'plugin:tailwindcss/recommended',
    'prettier', // Make sure this is last to override other configs
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prettier/prettier': 'warn', // Show Prettier errors as warnings
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/prop-types': 'off', // Not needed with TypeScript
    'tailwindcss/no-custom-classname': 'off', // Allow custom classnames if needed
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
};
