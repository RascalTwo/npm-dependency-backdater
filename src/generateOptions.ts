import CLIListener from './events/CLIListener';
import type { Options } from './types';
import SilentListener from './events/SilentListener';
import TUIListener from './events/TUIListener';

export default async function generateOptions(args: string[]): Promise<Options> {
	const options: Options = {
		// prettier-ignore
		listener: args.includes('--tui')
			? await TUIListener.clone()
			: args.includes('--silent')
				? await SilentListener.clone()
				: await CLIListener.clone(),
	};
	if (args.includes('--strip-prefixes')) options.stripPrefixes = true;
	if (args.includes('--interactive')) options.interactive = true;
	if (args.includes('--allow-pre-release')) options.allowPreRelease = true;
	if (args.includes('--dry-run')) options.dryRun = true;
	if (args.includes('--preload-dependencies')) options.preloadDependencies = true;
	if (args.includes('--no-cache')) options.noCache = true;
	if (args.includes('--lock-major')) options.lock = { major: true };
	if (args.includes('--lock-minor')) {
		if (options.lock) throw new Error('Cannot lock both major and minor versions');
		options.lock = { minor: true };
	}
	if (args.includes('--warnings-as-errors')) options.warningsAsErrors = true;
	return options;
}
