import CLIListener from './events/CLIListener';
import SilentListener from './events/SilentListener';
import TUIListener from './events/TUIListener';

import generateOptions from './generateOptions';

describe('generateOptions', () => {
	const withoutSilent = { listener: CLIListener.clone() };

	test.each([
		['--silent', { listener: SilentListener.clone() }],
		['--tui', { listener: TUIListener.clone() }],
		['', withoutSilent],
		['--strip-prefixes', { ...withoutSilent, stripPrefixes: true }],
		['--interactive', { ...withoutSilent, interactive: true }],
		['--allow-pre-release', { ...withoutSilent, allowPreRelease: true }],
		['--dry-run', { ...withoutSilent, dryRun: true }],
		['--preload-dependencies', { ...withoutSilent, preloadDependencies: true }],
	])('"%s" flag', (arg, expectedOptions) => {
		expect(generateOptions([arg])).toMatchObject(expectedOptions);
	});

	test('everything all at once works', () => {
		expect(
			generateOptions([
				'--silent',
				'--strip-prefixes',
				'--interactive',
				'--allow-pre-release',
				'--dry-run',
				'--preload-dependencies',
			]),
		).toMatchObject({
			stripPrefixes: true,
			interactive: true,
			allowPreRelease: true,
			dryRun: true,
			preloadDependencies: true,
		});
	});
});
