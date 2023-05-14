import type { Options } from './types';
import parseRawVersion from './parseRawVersion';

export type VersionAction = [string, string];

export default function generateVersionActions(rawVersion: string, proposedVersion: string, options: Options = {}) {
	const semverPrefix = parseRawVersion(rawVersion)[0];

	const actions: VersionAction[] = [
		['Leave as', rawVersion],
		['Change to', proposedVersion],
	] as [string, string][];

	if (semverPrefix) {
		actions.splice(options.stripPrefixes ? 2 : 1, 0, ['Change to', `${semverPrefix}${proposedVersion}`]);
	}

	return actions;
}
