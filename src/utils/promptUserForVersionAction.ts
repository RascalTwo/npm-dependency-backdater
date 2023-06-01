import type { VersionAction } from '../types';
import getEnumFromUser from '../getEnumFromUser';

export default async function promptUserForVersionAction(
	dependency: string,
	versionActions: VersionAction[],
	log = console.log,
) {
	if (versionActions.length === 1) return versionActions[0][1];

	log(`Choose action for ${dependency}:`);
	versionActions.forEach(([action, version], i) => log(`${i} - ${action} ${version}`));

	return versionActions[await getEnumFromUser(...versionActions.map((_, i) => i))][1];
}
