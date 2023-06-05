import CLIListener from './events/CLIListener';
import type { Options } from './types';
import SilentListener from './events/SilentListener';
import TUIListener from './events/TUIListener';

export default function generateOptions(args: string[]): Options {
	const options: Options = {
		// prettier-ignore
		listener: args.includes('--tui')
			? TUIListener.clone()
			: args.includes('--silent')
				? SilentListener.clone()
				: CLIListener.clone(),
	};
	if (args.includes('--strip-prefixes')) options.stripPrefixes = true;
	if (args.includes('--interactive')) options.interactive = true;
	if (args.includes('--allow-pre-release')) options.allowPreRelease = true;
	if (args.includes('--dry-run')) options.dryRun = true;
	if (args.includes('--preload-dependencies')) options.preloadDependencies = true;
	if (args.includes('--no-cache')) options.noCache = true;
	return options;
}
