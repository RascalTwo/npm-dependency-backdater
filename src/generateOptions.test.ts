import generateOptions from './generateOptions';

describe('generateOptions', () => {
	const withoutSilent = { log: console.log };

	test.each([
		['--silent', {}],
		['', withoutSilent],
		['--strip-prefixes', { ...withoutSilent, stripPrefixes: true }],
		['--interactive', { ...withoutSilent, interactive: true }],
		['--allow-pre-release', { ...withoutSilent, allowPreRelease: true }],
	])('%s', (arg, expectedOptions) => {
		expect(generateOptions([arg])).toEqual(expectedOptions);
	});

	test('everything', () => {
		expect(generateOptions(['--silent', '--strip-prefixes', '--interactive', '--allow-pre-release'])).toEqual({
			stripPrefixes: true,
			interactive: true,
			allowPreRelease: true,
		});
	});
});
