import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import nextPlugin from '@next/eslint-plugin-next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    plugins: {
      '@next/next': nextPlugin,
    },
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      // React Performance
      'react/jsx-no-bind': [
        'warn',
        {
          allowArrowFunctions: true, // Arrow functions in JSX are ok with React Compiler
          allowBind: false,
          allowFunctions: false,
        },
      ],
      'react/jsx-no-leaked-render': [
        'warn',
        {
          validStrategies: ['ternary', 'coerce'], // Prevent {count && <Component />} rendering "0"
        },
      ],
      'react/no-array-index-key': 'warn', // Avoid array index as key
      'react/jsx-key': 'error', // Require keys in lists

      // React Hooks (enhanced beyond Next.js defaults)
      'react-hooks/exhaustive-deps': 'error', // Correct dependencies
      'react-hooks/rules-of-hooks': 'error', // Hooks rules

      // Accessibility (enhanced)
      'jsx-a11y/alt-text': 'error', // Images need alt text
      'jsx-a11y/aria-props': 'error', // Valid ARIA props
      'jsx-a11y/aria-proptypes': 'error', // ARIA prop types
      'jsx-a11y/aria-unsupported-elements': 'error', // Valid ARIA elements
      'jsx-a11y/role-has-required-aria-props': 'error', // Required ARIA props
      'jsx-a11y/role-supports-aria-props': 'error', // Supported ARIA props
      'jsx-a11y/anchor-is-valid': 'error', // Valid links
      'jsx-a11y/click-events-have-key-events': 'warn', // Keyboard accessibility
      'jsx-a11y/no-static-element-interactions': 'warn', // Interactive elements

      // Component practices
      'react/self-closing-comp': 'warn', // Use self-closing tags
      'react/jsx-boolean-value': ['warn', 'never'], // Omit boolean true
      'react/jsx-curly-brace-presence': [
        'warn',
        {
          props: 'never',
          children: 'never',
        },
      ],
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'public/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
