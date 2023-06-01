import { loadCache, saveCache } from './utils/cache';
import fetchPackageVersionDates from './fetchPackageVersionDates';

import getPackageVersionDates from './getPackageVersionDates';

jest.mock('./fetchPackageVersionDates');
jest.mock('./utils/cache');

const loadVersionCache = loadCache as jest.MockedFunction<typeof loadCache>;
const saveVersionCache = saveCache as jest.MockedFunction<typeof saveCache>;
const fetchPackageVersionDatesMock = fetchPackageVersionDates as jest.MockedFunction<typeof fetchPackageVersionDates>;

describe('getPackageVersionDates', () => {
	test('uses cached version', async () => {
		const datetime = new Date('2020-01-01T00:00:00Z');
		const versionCache = {
			foo: {
				queryDate: datetime.toISOString(),
				versions: { '1.0.0': 'version' },
			},
		};
		loadVersionCache.mockResolvedValue(versionCache);

		expect(await getPackageVersionDates('foo', datetime)).toEqual([versionCache.foo.versions, datetime]);

		expect(fetchPackageVersionDates).not.toHaveBeenCalled();
		expect(saveVersionCache).not.toHaveBeenCalled();
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
		const datetime = new Date('2020-01-01T00:00:00Z');
		loadVersionCache.mockResolvedValue({
			foo: fooCache,
		});
		const versions = { '1.1.0': datetime.toISOString() };
		fetchPackageVersionDatesMock.mockResolvedValue(versions);

		expect(await getPackageVersionDates('foo', datetime)).toEqual([versions, datetime]);

		expect(fetchPackageVersionDates).toHaveBeenCalledWith('foo');
		expect(saveVersionCache).toHaveBeenCalledWith({
			foo: {
				queryDate: datetime.toISOString(),
				versions: versions,
			},
		});
	});
});
