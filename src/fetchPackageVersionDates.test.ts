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

	test('calls the npm registry with the correct package name', async () => {
		const mockResponse = generateMockJSONResponse({ time: {} });
		fetchMock.mockResolvedValue(mockResponse);

		await fetchPackageVersionDates(packageName);

		expect(fetch).toHaveBeenCalledWith(`https://registry.npmjs.org/${packageName}`);
	});

	test('fetches and returns the version dates', async () => {
		const expectedVersions = {
			'1.0.0': '2022-01-01T00:00:00Z',
			'2.0.0': '2022-02-01T00:00:00Z',
		};
		const mockResponse = generateMockJSONResponse({ time: expectedVersions });
		fetchMock.mockResolvedValue(mockResponse);

		const result = await fetchPackageVersionDates(packageName);

		expect(result).toEqual(expectedVersions);
	});

	test('handles fetch error', async () => {
		const mockError = new Error('Fetch error');
		fetchMock.mockRejectedValue(mockError);

		await expect(fetchPackageVersionDates(packageName)).rejects.toThrow('Fetch error');
	});
});
