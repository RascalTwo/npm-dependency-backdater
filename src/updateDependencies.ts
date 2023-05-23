import type { DependencyMap, Options } from './types';
import generateVersionActions from './generateVersionActions';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';
import parseRawVersion from './parseRawVersion';
import promptUserForVersionAction from './promptUserForVersionAction';

export default async function updateDependencies(dependencyMap: DependencyMap, datetime: Date, options: Options = {}) {
	const { log } = options;
	const updatedDependencyMap: DependencyMap = {};

	for (const [packageName, rawVersion] of Object.entries(dependencyMap)) {
		const [semverPrefix, version] = parseRawVersion(rawVersion);

		log?.(`Looking up ${packageName} versions...`);
		const versionDates = await getPackageVersionDates(packageName, datetime);
		const versionCount = Object.keys(versionDates).length;
		log?.(`Found ${versionCount} version${versionCount === 1 ? '' : 's'} for ${packageName}.`);

		const highestVersion = getHighestVersionAtTime(versionDates, datetime, !options.allowPreRelease);
		if (highestVersion) {
			log?.(`Highest version of ${packageName} is ${highestVersion}.`);
			if (version !== highestVersion) {
				/* eslint-disable indent */
				const updatedVersion = options.interactive
					? await promptUserForVersionAction(
							packageName,
							generateVersionActions(rawVersion, highestVersion, options),
							options,
					  )
					: `${options.stripPrefixes ? '' : semverPrefix ?? ''}${highestVersion}`;
				/* eslint-enable indent */

				if (updatedVersion !== rawVersion) {
					updatedDependencyMap[packageName] = updatedVersion;
					log?.(`Updated ${packageName} from ${rawVersion} to ${updatedVersion}.`);
				} else {
					log?.(`Left ${packageName} as ${rawVersion}.`);
				}
			} else {
				log?.(`${packageName} is already ${highestVersion}.`);
			}
		} else {
			log?.('No versions available.');
		}
	}

	return updatedDependencyMap;
}
