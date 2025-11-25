export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'style', 'perf', 'ci', 'build'],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'constants',
        'domain',
        'application',
        'infrastructure',
        'api',
        'ui',
        'web',
        'auth',
        'transactions',
        'rewards',
        'analytics',
        'insights',
        'deps',
        'config',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100],
  },
};

