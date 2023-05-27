import CLIListener from './events/CLIListener';
import SilentListener from './events/SilentListener';
import generateOptions from './generateOptions';

describe('generateOptions', () => {
	const withoutSilent = { listener: CLIListener };

	test.each([
		['--silent', { listener: SilentListener }],
		['', withoutSilent],
		['--strip-prefixes', { ...withoutSilent, stripPrefixes: true }],
		['--interactive', { ...withoutSilent, interactive: true }],
		['--allow-pre-release', { ...withoutSilent, allowPreRelease: true }],
		['--dry-run', { ...withoutSilent, dryRun: true }],
	])('%s', (arg, expectedOptions) => {
		expect(generateOptions([arg])).toMatchObject(expectedOptions);
	});

	test('everything', () => {
		expect(
			generateOptions(['--silent', '--strip-prefixes', '--interactive', '--allow-pre-release', '--dry-run']),
		).toMatchObject({
			stripPrefixes: true,
			interactive: true,
			allowPreRelease: true,
			dryRun: true,
		});
	});
});
