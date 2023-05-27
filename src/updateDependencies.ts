import type { DependencyMap, Options } from './types';
import generateVersionActions from './generateVersionActions';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';
import parseRawVersion from './parseRawVersion';

export const POSSIBLE_EVENTS = [
	'getting_package_version_dates',
	'calculated_highest_version',
	'prompt_user_for_version_action',
	'dependency_processed',
] as const;

export default async function updateDependencies(dependencyMap: DependencyMap, datetime: Date, options: Options) {
	const { listener } = options;
	const updatedDependencyMap: DependencyMap = {};

	for (const [packageName, rawVersion] of Object.entries(dependencyMap)) {
		const [semverPrefix, version] = parseRawVersion(rawVersion);

		const basePayload = {
			packageName,
			version: {
				raw: rawVersion,
				prefix: semverPrefix,
				parsed: version,
			},
			datetime,
		};
		listener.emit('getting_package_version_dates', {
			...basePayload,
			edge: 'start',
		});
		const [versions, cacheDate] = await getPackageVersionDates(packageName, datetime);
		listener.emit('getting_package_version_dates', {
			...basePayload,
			edge: 'finish',
			cacheDate,
			versions,
		});

		const highestVersion = getHighestVersionAtTime(versions, datetime, !options.allowPreRelease);
		listener.emit('calculated_highest_version', {
			packageName,
			version,
			highestVersion,
			allowPreRelease: !!options.allowPreRelease,
		});
		if (highestVersion && version !== highestVersion) {
			const updatedVersion = await listener.emit('prompt_user_for_version_action', {
				options,
				packageName,
				actions: generateVersionActions(rawVersion, highestVersion, options.stripPrefixes),
			});

			if (updatedVersion !== rawVersion) {
				updatedDependencyMap[packageName] = updatedVersion;
			}
			listener.emit('dependency_processed', {
				packageName,
				version: {
					old: rawVersion,
					new: updatedVersion,
				},
			});
		}
	}

	return updatedDependencyMap;
}
