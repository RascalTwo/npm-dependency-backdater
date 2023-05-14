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
		await expect(main(args[0], args[1], false)).rejects.toThrow();

		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});

	test('calls updatePackageVersions with the correct arguments when silent is true', async () => {
		await main(packageFilePath, datetimeArg, true);

		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, expect.any(Date), undefined);
	});

	test('calls updatePackageVersions with the correct arguments when silent is false and logs', async () => {
		jest.spyOn(console, 'log').mockImplementation();

		await main(packageFilePath, datetimeArg, false);

		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, expect.any(Date), console.log);
		expect(console.log).toHaveBeenCalledWith(
			`Attempting to update package versions in ${packageFilePath} to their latest versions as of ${new Date(
				datetimeArg,
			).toISOString()}...`,
		);
	});

	test('throws an error if datetimeArg is not a valid datetime', async () => {
		const invalidDatetimeArg = 'abcd-de-fg';

		await expect(main(packageFilePath, invalidDatetimeArg, false)).rejects.toThrow();

		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});
});
