import type { DependencyMap, Options } from './types';
import generateVersionActions from './generateVersionActions';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';
import parseRawVersion from './parseRawVersion';

export default async function updateDependencies(dependencyMap: DependencyMap, datetime: Date, options: Options) {
	const { listener } = options;
	const updatedDependencyMap: DependencyMap = {};

	for (const packageName in dependencyMap) {
		const version = parseRawVersion(dependencyMap[packageName]);

		listener.handleGettingPackageVersionDatesStart(packageName);
		const [versions, cacheDate] = await getPackageVersionDates(packageName, datetime);
		listener.handleGettingPackageVersionDatesFinish(packageName, datetime, cacheDate, versions);

		const highestVersion = getHighestVersionAtTime(versions, datetime, !options.allowPreRelease);
		listener.handleCalculatedHighestVersion(packageName, version.version, highestVersion, !!options.allowPreRelease);
		if (highestVersion && version.version !== highestVersion) {
			const updatedVersion = await listener.handlePromptUserForVersionAction(
				options,
				packageName,
				generateVersionActions(version, highestVersion, options.stripPrefixes),
			);

			if (updatedVersion !== version.raw) {
				updatedDependencyMap[packageName] = updatedVersion;
			}
			listener.handleDependencyProcessed(packageName, {
				old: version.raw,
				new: updatedVersion,
			});
		}
	}

	return updatedDependencyMap;
}
