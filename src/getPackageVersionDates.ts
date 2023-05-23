import { loadCache, saveCache } from './cache';
import type { VersionMap } from './types';
import fetchPackageVersionDates from './fetchPackageVersionDates';

export interface VersionCache {
	[packageName: string]: {
		queryDate: string;
		versions: VersionMap;
	};
}

const loadVersionCache = () => loadCache<VersionCache>();
const saveVersionCache = (cache: VersionCache) => saveCache(cache);

export default async function getPackageVersionDates(packageName: string, datetime: Date) {
	const versionCache = await loadVersionCache();
	const packageCache = versionCache[packageName] ?? { queryDate: 0, versions: {} };

	if (datetime.getTime() <= new Date(packageCache.queryDate).getTime()) {
		return packageCache.versions;
	}

	const versions = await fetchPackageVersionDates(packageName);

	await saveVersionCache({
		...versionCache,
		[packageName]: {
			queryDate: datetime.toISOString(),
			versions,
		},
	});

	return versions;
}
