import type { DependencyMap, Options, VersionMap } from './types';
import { NPMRegistryError } from './fetchPackageVersionDates';
import generateVersionActions from './generateVersionActions';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';
import parseRawVersion from './parseRawVersion';

export default async function updateDependencies(dependencyMap: DependencyMap, datetime: Date, options: Options) {
	const { listener } = options;
	const updatedDependencyMap: DependencyMap = {};

	for (const packageName in dependencyMap) {
		const version = parseRawVersion(dependencyMap[packageName]);

		await listener.handleGettingPackageVersionDatesStart(packageName);
		let [versions, cacheDate] = [{} as VersionMap, new Date()];
		try {
			[versions, cacheDate] = await getPackageVersionDates(packageName, options.noCache ? new Date() : datetime);
		} catch (e) {
			if (e instanceof NPMRegistryError) {
				await listener.handleNPMRegistryError(packageName, e);
			} else {
				throw e;
			}
		}
		await listener.handleGettingPackageVersionDatesFinish(packageName, cacheDate, versions);

		const highestVersion = getHighestVersionAtTime(
			versions,
			datetime,
			!options.allowPreRelease,
			/* eslint-disable indent */
			options.lock
				? {
						current: [version.major, version.minor],
						...options.lock,
				  }
				: undefined,
			/* eslint-enable indent */
		);
		await listener.handleCalculatedHighestVersion(packageName, version.version, highestVersion);
		if (highestVersion && version.version !== highestVersion) {
			const updatedVersion = await listener.handlePromptUserForVersionAction(
				packageName,
				generateVersionActions(version, highestVersion, options.stripPrefixes),
			);

			if (updatedVersion !== version.raw) {
				updatedDependencyMap[packageName] = updatedVersion;
			}
			await listener.handleDependencyProcessed(packageName, {
				old: version.raw,
				new: updatedVersion,
			});
		}
	}

	return updatedDependencyMap;
}
