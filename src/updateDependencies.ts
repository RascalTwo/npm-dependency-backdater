import type { Options } from './types';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';
import parseRawVersion from './parseRawVersion';

export default async function updateDependencies(
	dependencies: Record<string, string>,
	datetime: Date,
	{ stripPrefixes, log }: Options = {},
) {
	const updatedDependencies: Record<string, string> = {};

	for (const [dependency, rawVersion] of Object.entries(dependencies)) {
		const [semverPrefix, version] = parseRawVersion(rawVersion);

		log?.(`Looking up ${dependency} versions...`);
		const versionDates = await getPackageVersionDates(dependency);
		const versionCount = Object.keys(versionDates).length;
		log?.(`Found ${versionCount} version${versionCount === 1 ? '' : 's'} for ${dependency}.`);

		const highestVersion = getHighestVersionAtTime(versionDates, datetime, true);
		if (highestVersion) {
			log?.(`Highest version of ${dependency} is ${highestVersion}.`);
			if (version !== highestVersion) {
				const updatedVersion = `${stripPrefixes ? '' : semverPrefix ?? ''}${highestVersion}`;
				updatedDependencies[dependency] = updatedVersion;

				log?.(`Updated ${dependency} from ${rawVersion} to ${updatedVersion}.`);
			} else {
				log?.(`${dependency} is already ${highestVersion}.`);
			}
		} else {
			log?.('No versions available.');
		}
	}

	return updatedDependencies;
}
