import type { Options } from './types';

export default function generateOptions(args: string[]): Options {
	const options: Options = {};
	if (!args.includes('--silent')) options.log = console.log;
	if (args.includes('--strip-prefixes')) options.stripPrefixes = true;
	if (args.includes('--interactive')) options.interactive = true;
	if (args.includes('--allow-pre-release')) options.allowPreRelease = true;
	if (args.includes('--dry-run')) options.dryRun = true;
	return options;
}
