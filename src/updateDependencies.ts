import type { DependencyMap, Options } from './types';
import generateVersionActions from './generateVersionActions';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';
import parseRawVersion from './parseRawVersion';

export default async function updateDependencies(dependencyMap: DependencyMap, datetime: Date, options: Options) {
	const { listener } = options;
	const updatedDependencyMap: DependencyMap = {};

	for (const [packageName, rawVersion] of Object.entries(dependencyMap)) {
		const version = parseRawVersion(rawVersion)[1];

		listener.handleGettingPackageVersionDatesStart(packageName);
		const [versions, cacheDate] = await getPackageVersionDates(packageName, datetime);
		listener.handleGettingPackageVersionDatesFinish(packageName, datetime, cacheDate, versions);

		const highestVersion = getHighestVersionAtTime(versions, datetime, !options.allowPreRelease);
		listener.handleCalculatedHighestVersion(packageName, version, highestVersion, !!options.allowPreRelease);
		if (highestVersion && version !== highestVersion) {
			const updatedVersion = await listener.handlePromptUserForVersionAction(
				options,
				packageName,
				generateVersionActions(rawVersion, highestVersion, options.stripPrefixes),
			);

			if (updatedVersion !== rawVersion) {
				updatedDependencyMap[packageName] = updatedVersion;
			}
			listener.handleDependencyProcessed(packageName, {
				old: rawVersion,
				new: updatedVersion,
			});
		}
	}

	return updatedDependencyMap;
}
