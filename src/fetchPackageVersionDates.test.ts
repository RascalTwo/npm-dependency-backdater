import fetch, { Response } from 'node-fetch';

import fetchPackageVersionDates from './fetchPackageVersionDates';

const fetchMock = fetch as jest.MockedFunction<typeof fetch>;

jest.mock('node-fetch');

describe('fetchPackageVersionDates', () => {
	const packageName = 'example-package';

	const generateMockJSONResponse = <T>(json: T) => {
		const mockResponse = new Response();
		mockResponse.json = () => Promise.resolve(json);
		return mockResponse;
	};

	test('makes request to NPM registry and returns version dates', async () => {
		const expectedVersions = {
			'1.0.0': '2022-01-01T00:00:00Z',
			'2.0.0': '2022-02-01T00:00:00Z',
		};
		fetchMock.mockResolvedValue(generateMockJSONResponse({ time: expectedVersions }));

		const result = await fetchPackageVersionDates(packageName);

		expect(fetch).toHaveBeenCalledWith(`https://registry.npmjs.org/${packageName}`);
		expect(result).toEqual(expectedVersions);
	});

	test('raises network errors', async () => {
		fetchMock.mockRejectedValue(new Error('Fetch error'));

		await expect(fetchPackageVersionDates(packageName)).rejects.toThrow('Fetch error');
	});
});
