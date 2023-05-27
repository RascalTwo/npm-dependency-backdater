import CLIListener from './events/CLIListener';
import type { Options } from './types';
import SilentListener from './events/SilentListener';

export default function generateOptions(args: string[]): Options {
	const options: Options = {
		listener: args.includes('--silent') ? SilentListener : CLIListener,
	};
	if (args.includes('--strip-prefixes')) options.stripPrefixes = true;
	if (args.includes('--interactive')) options.interactive = true;
	if (args.includes('--allow-pre-release')) options.allowPreRelease = true;
	if (args.includes('--dry-run')) options.dryRun = true;
	return options;
}
