module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': 'google',
  'overrides': [
    {
      'env': {
        'node': true,
      },
      'files': [
        '.eslintrc.{js,cjs}',
      ],
      'parserOptions': {
        'sourceType': 'script',
      },
    },
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'rules': {
    'max-len': [2, {
      code: 120,
      tabWidth: 2,
      ignoreUrls: true,
      ignorePattern: 'goog\.(module|require)',
      ignoreComments: true,
    }],
  },
};
