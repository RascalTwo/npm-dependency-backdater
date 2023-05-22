import type { Options } from './types';
import generateVersionActions from './generateVersionActions';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';
import parseRawVersion from './parseRawVersion';
import promptUserForVersionAction from './promptUserForVersionAction';

export default async function updateDependencies(
	dependencies: Record<string, string>,
	datetime: Date,
	options: Options = {},
) {
	const { log } = options;
	const updatedDependencies: Record<string, string> = {};

	for (const [dependency, rawVersion] of Object.entries(dependencies)) {
		const [semverPrefix, version] = parseRawVersion(rawVersion);

		log?.(`Looking up ${dependency} versions...`);
		const versionDates = await getPackageVersionDates(dependency, datetime);
		const versionCount = Object.keys(versionDates).length;
		log?.(`Found ${versionCount} version${versionCount === 1 ? '' : 's'} for ${dependency}.`);

		const highestVersion = getHighestVersionAtTime(versionDates, datetime, !options.allowPreRelease);
		if (highestVersion) {
			log?.(`Highest version of ${dependency} is ${highestVersion}.`);
			if (version !== highestVersion) {
				/* eslint-disable indent */
				const updatedVersion = options.interactive
					? await promptUserForVersionAction(
							dependency,
							generateVersionActions(rawVersion, highestVersion, options),
							options,
					  )
					: `${options.stripPrefixes ? '' : semverPrefix ?? ''}${highestVersion}`;
				/* eslint-enable indent */

				if (updatedVersion !== rawVersion) {
					updatedDependencies[dependency] = updatedVersion;
					log?.(`Updated ${dependency} from ${rawVersion} to ${updatedVersion}.`);
				} else {
					log?.(`Left ${dependency} as ${rawVersion}.`);
				}
			} else {
				log?.(`${dependency} is already ${highestVersion}.`);
			}
		} else {
			log?.('No versions available.');
		}
	}

	return updatedDependencies;
}
