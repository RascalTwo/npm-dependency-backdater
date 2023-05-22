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
		await expect(main(args[0], args[1])).rejects.toThrow();

		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});

	test('passes correct arguments to updatePackageVersions', async () => {
		const options = { stripPrefixes: true, interactive: true, log: console.log };

		await main(packageFilePath, datetimeArg, options);

		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, expect.any(Date), options);
	});

	test('logs arguments', async () => {
		const options = { log: jest.fn() };

		await main(packageFilePath, datetimeArg, options);

		expect(options.log).toHaveBeenCalledWith(
			`Attempting to update package versions in ${packageFilePath} to their latest versions as of ${new Date(
				datetimeArg,
			).toISOString()}...`,
		);
	});

	test('throws an error if datetimeArg is not a valid datetime', async () => {
		const invalidDatetimeArg = 'abcd-de-fg';

		await expect(main(packageFilePath, invalidDatetimeArg)).rejects.toThrow();

		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});

	test('maximizes datetime to now', async () => {
		const now = new Date('3000-01-01T00:00:00Z');
		jest.useFakeTimers().setSystemTime(now);

		jest.spyOn(console, 'warn').mockImplementation();

		const invalidDatetimeArg = '4000-01-01';

		main(packageFilePath, invalidDatetimeArg);

		expect(console.warn).toHaveBeenCalledWith(
			'Warning: The provided datetime is in the future. Using the current datetime instead.',
		);
		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, now, {});
	});
});
