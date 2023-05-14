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
		await expect(main(args[0], args[1], false, false)).rejects.toThrow();

		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});

	test('calls updatePackageVersions with the correct arguments when silent is true and stripPrefixes is false', async () => {
		await main(packageFilePath, datetimeArg, true, false);

		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, expect.any(Date), undefined);
	});

	test('calls updatePackageVersions with the correct arguments (and logs) when silent is false and stripPrefixes is true', async () => {
		jest.spyOn(console, 'log').mockImplementation();

		await main(packageFilePath, datetimeArg, false, true);

		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, expect.any(Date), {
			stripPrefixes: true,
			log: console.log,
		});
		expect(console.log).toHaveBeenCalledWith(
			`Attempting to update package versions in ${packageFilePath} to their latest versions as of ${new Date(
				datetimeArg,
			).toISOString()}...`,
		);
	});

	test('throws an error if datetimeArg is not a valid datetime', async () => {
		const invalidDatetimeArg = 'abcd-de-fg';

		await expect(main(packageFilePath, invalidDatetimeArg, false, false)).rejects.toThrow();

		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});
});
