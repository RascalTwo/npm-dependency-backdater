import { loadCache, saveCache } from './utils/cache';

import fetchPackageVersionDates from './fetchPackageVersionDates';

import getPackageVersionDates from './getPackageVersionDates';

jest.mock('./utils/cache');
jest.mock('./fetchPackageVersionDates');

const loadVersionCache = loadCache as jest.MockedFunction<typeof loadCache>;
const saveVersionCache = saveCache as jest.MockedFunction<typeof saveCache>;
const fetchPackageVersionDatesMock = fetchPackageVersionDates as jest.MockedFunction<typeof fetchPackageVersionDates>;

describe('getPackageVersionDates', () => {
	const datetime = new Date('2020-01-01T00:00:00Z');

	test('cached versions are returned', async () => {
		const versionCache = {
			foo: {
				queryDate: datetime.toISOString(),
				versions: { '1.0.0': 'version' },
			},
		};
		loadVersionCache.mockResolvedValue(versionCache);

		const result = await getPackageVersionDates('foo', datetime);

		expect(fetchPackageVersionDates).not.toHaveBeenCalled();
		expect(saveVersionCache).not.toHaveBeenCalled();
		expect(result).toEqual([versionCache.foo.versions, datetime]);
	});

	test.each([
		['for new package', undefined],
		[
			'for cached package',
			{
				queryDate: new Date('2019-01-01T00:00:00Z').toISOString(),
				versions: {},
			},
		],
	])('fetches new version and updates cache %s', async (_, fooCache) => {
		loadVersionCache.mockResolvedValue({
			foo: fooCache,
		});
		const versions = { '1.1.0': datetime.toISOString() };
		fetchPackageVersionDatesMock.mockResolvedValue(versions);

		const result = await getPackageVersionDates('foo', datetime);

		expect(fetchPackageVersionDates).toHaveBeenCalledWith('foo');
		expect(saveVersionCache).toHaveBeenCalledWith({
			foo: {
				queryDate: datetime.toISOString(),
				versions: versions,
			},
		});
		expect(result).toEqual([versions, datetime]);
	});
});
