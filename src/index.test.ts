import main from '.';
import updatePackageVersions from './updatePackageVersions';

const updatePackageVersionsMock = updatePackageVersions as jest.MockedFunction<typeof updatePackageVersions>;

jest.mock('./updatePackageVersions');

describe('main', () => {
	const packageFilePath = '/path/to/package.json';
	const datetimeArg = '2022-01-01T00:00:00Z';

	test.each([
		['packageFilePath', ['', datetimeArg]],
		['datetimeArg', [packageFilePath, '']],
	] as const)('requires %s', async (_, args) => {
		await expect(main(args[0], args[1])).rejects.toThrow(
			'Please provide a valid package.json location and datetime (YYYY-MM-DDTHH:mm:ssZ)',
		);

		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});

	test('calls updatePackageVersions with the correct arguments', async () => {
		await main(packageFilePath, datetimeArg);

		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, expect.any(Date));
	});

	test('throws an error if datetimeArg is not a valid datetime', async () => {
		const invalidDatetimeArg = 'abcd-de-fg';

		await expect(main(packageFilePath, invalidDatetimeArg)).rejects.toThrow(
			'Please provide a valid datetime (YYYY-MM-DDTHH:mm:ssZ)',
		);

		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});
});
