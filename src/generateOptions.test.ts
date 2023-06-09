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
		['--no-cache', { ...withoutSilent, noCache: true }],
		['--lock-minor', { ...withoutSilent, lock: { minor: true } }],
		['--lock-major', { ...withoutSilent, lock: { major: true } }],
		['--warnings-as-errors', { ...withoutSilent, warningsAsErrors: true }],
		['--delay', { ...withoutSilent, delay: 1000 }],
		['--delay=1234', { ...withoutSilent, delay: 1234 }],
		['--delay=-1234', { ...withoutSilent }],
	])('"%s" flag', async (arg, expectedOptions) => {
		await expect(generateOptions([arg])).resolves.toMatchObject(expectedOptions);
	});

	test('unable to lock both major and minor', async () => {
		await expect(generateOptions(['--lock-minor', '--lock-major'])).rejects.toThrow(
			'Cannot lock both major and minor versions',
		);
	});

	test('everything all at once works', async () => {
		await expect(
			generateOptions([
				'--silent',
				'--strip-prefixes',
				'--interactive',
				'--allow-pre-release',
				'--dry-run',
				'--preload-dependencies',
				'--no-cache',
				'--lock-major',
				'--warnings-as-errors',
				'--delay=2500',
			]),
		).resolves.toMatchObject({
			stripPrefixes: true,
			interactive: true,
			allowPreRelease: true,
			dryRun: true,
			preloadDependencies: true,
			noCache: true,
			lock: { major: true },
			warningsAsErrors: true,
			delay: 2500,
		});
	});
});
