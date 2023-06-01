import type { ParsedVersion, VersionAction } from './types';

export default function generateVersionActions(
	version: ParsedVersion,
	proposedVersion: string,
	stripPrefixes?: boolean,
) {
	const actions: VersionAction[] = [
		['Leave as', version.raw],
		['Change to', proposedVersion],
	] as [string, string][];

	if (version.prefix) {
		actions.splice(stripPrefixes ? 2 : 1, 0, ['Change to', `${version.prefix}${proposedVersion}`]);
	}

	return actions;
}
