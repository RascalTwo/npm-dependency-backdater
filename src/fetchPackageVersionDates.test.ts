import fetch, { Response } from 'node-fetch';

import fetchPackageVersionDates, { NPMRegistryError } from './fetchPackageVersionDates';

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

		expect(fetchMock).toHaveBeenCalledWith(`https://registry.npmjs.org/${packageName}`);
		expect(result).toEqual(expectedVersions);
	});

	test('raises network errors', async () => {
		fetchMock.mockRejectedValue(new Error('Fetch error'));

		await expect(fetchPackageVersionDates(packageName)).rejects.toThrow('Fetch error');
	});

	test('throws not found error', async () => {
		fetchMock.mockResolvedValue(generateMockJSONResponse({ error: 'Not found' }));

		const error = await fetchPackageVersionDates(packageName).catch(e => e);
		expect(error).toBeInstanceOf(NPMRegistryError);
		expect(error).toMatchObject({
			message: `Package "${packageName}" not found`,
			response: { error: 'Not found' },
		});
		expect(error.isNotFound()).toBe(true);
	});

	test('throws NPM registry errors', async () => {
		fetchMock.mockResolvedValue(
			generateMockJSONResponse({
				error: 'Some other error',
				other: 'other data',
			}),
		);

		const error = await fetchPackageVersionDates(packageName).catch(e => e);
		expect(error).toBeInstanceOf(NPMRegistryError);
		expect(error).toMatchObject({
			message:
				'NPM Registry Error for "example-package": Some other error\n{\n  "error": "Some other error",\n  "other": "other data"\n}',
			response: { error: 'Some other error', other: 'other data' },
		});
		expect(error.isUnknown()).toBe(true);
	});
});
