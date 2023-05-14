/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
	ignorePatterns: [
		'node_modules',
		'coverage',
		'dist',
		'!.*',
	],
	env: {
		es2021: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	overrides: [
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint',
		'jest',
	],
	rules: {
		indent: [
			'error',
			'tab',
		],
		'linebreak-style': [
			'error',
			'unix',
		],
		quotes: [
			'error',
			'single',
			{
				avoidEscape: true,
			},
		],
		semi: [
			'error',
			'always',
		],
		'quote-props': [
			'error',
			'as-needed',
		],
		'eol-last': [
			'error',
			'always',
		],
		'comma-dangle': [
			'error',
			'always-multiline',
		],
		'sort-imports': 'error',
		'arrow-parens': [
			'error',
			'as-needed',
		],
		'@typescript-eslint/consistent-type-imports': 'error',
	},
};
