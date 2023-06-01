import { loadCache, saveCache } from './utils/cache';
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

export default async function getPackageVersionDates(packageName: string, datetime: Date): Promise<[VersionMap, Date]> {
	const versionCache = await loadVersionCache();
	const packageCache = versionCache[packageName] ?? { queryDate: 0, versions: {} };

	const cachedDatetime = new Date(packageCache.queryDate);
	if (datetime.getTime() <= cachedDatetime.getTime()) {
		return [packageCache.versions, cachedDatetime];
	}

	const versions = await fetchPackageVersionDates(packageName);

	await saveVersionCache({
		...versionCache,
		[packageName]: {
			queryDate: datetime.toISOString(),
			versions,
		},
	});

	return [versions, datetime];
}
