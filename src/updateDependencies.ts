import type { LoggingFunction } from './types';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';

export default async function updateDependencies(
	dependencies: Record<string, string>,
	datetime: Date,
	log?: LoggingFunction,
) {
	const updatedDependencies: Record<string, string> = {};

	for (const [dependency, version] of Object.entries(dependencies)) {
		log?.(`Looking up ${dependency} versions...`);
		const versionDates = await getPackageVersionDates(dependency);
		const versionCount = Object.keys(versionDates).length;
		log?.(`Found ${versionCount} version${versionCount === 1 ? '' : 's'} for ${dependency}.`);

		const highestVersion = getHighestVersionAtTime(versionDates, datetime, true);
		if (highestVersion) {
			log?.(`Highest version of ${dependency} is ${highestVersion}.`);
			if (version !== highestVersion) {
				log?.(`Updating ${dependency} from ${version} to ${highestVersion}.`);
			} else {
				log?.(`${dependency} is already ${highestVersion}.`);
			}
		} else {
			log?.('No versions available.');
		}

		updatedDependencies[dependency] = highestVersion || version;
	}

	return updatedDependencies;
}
