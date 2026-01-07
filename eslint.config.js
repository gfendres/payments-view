import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // Code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],

      // File size limits (max-lines)
      'max-lines': [
        'warn',
        {
          max: 500,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // Function size limits
      'max-lines-per-function': [
        'warn',
        {
          max: 50,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // Complexity
      complexity: ['warn', 10],

      // Magic numbers - enforce using constants
      'no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1, 2], // Common indices and basic math
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreClassFieldInitialValues: true,
          enforceConst: true,
        },
      ],

      // Nesting and depth limits
      'max-depth': ['warn', 4], // Max nesting depth
      'max-nested-callbacks': ['warn', 3], // Prevent callback hell

      // Code organization
      'no-duplicate-imports': 'error', // Single import per module
      'sort-imports': [
        'warn',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true, // Let prettier/organize imports handle this
          ignoreMemberSort: false,
        },
      ],

      // Prevent common mistakes
      'no-shadow': 'off', // Turn off base rule
      '@typescript-eslint/no-shadow': ['error'], // Use TS version
      'no-param-reassign': ['error', { props: true }], // Immutability
      'no-return-await': 'off', // Conflicts with @typescript-eslint
      '@typescript-eslint/return-await': ['error', 'always'], // Better stack traces
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error', // Async functions must use await

      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // Promise handling
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/promise-function-async': 'error',

      // Better null checking
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // Relax some strict rules for practicality
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
        },
      ],
    },
  },
  {
    // Config files and constants can be more relaxed
    files: [
      '*.config.js',
      '*.config.ts',
      'eslint.config.js',
      '**/constants/**/*.ts',
      '**/*.config.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'no-magic-numbers': 'off', // Constants are the SOURCE of truth
    },
  },
  {
    // Test files can use any and be more flexible
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/promise-function-async': 'off', // Mock functions don't need async
      'max-lines-per-function': 'off',
      'complexity': 'off',
      'no-magic-numbers': 'off', // Test data can use literal numbers
      'no-duplicate-imports': 'off', // Tests often import types and values separately
      'sort-imports': 'off', // Less important in tests
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
    ],
  }
);

