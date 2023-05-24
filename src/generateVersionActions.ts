import type { VersionAction } from './types';
import parseRawVersion from './parseRawVersion';

export default function generateVersionActions(rawVersion: string, proposedVersion: string, stripPrefixes?: boolean) {
	const semverPrefix = parseRawVersion(rawVersion)[0];

	const actions: VersionAction[] = [
		['Leave as', rawVersion],
		['Change to', proposedVersion],
	] as [string, string][];

	if (semverPrefix) {
		actions.splice(stripPrefixes ? 2 : 1, 0, ['Change to', `${semverPrefix}${proposedVersion}`]);
	}

	return actions;
}
