import main, { POSSIBLE_EVENTS } from '.';
import { generateMockListener } from './testHelpers';
import updatePackageVersions from './updatePackageVersions';

const updatePackageVersionsMock = updatePackageVersions as jest.MockedFunction<typeof updatePackageVersions>;

jest.mock('./updatePackageVersions');

describe('main', () => {
	const packageFilePath = '/path/to/package.json';
	const datetimeArg = '2022-01-01T00:00:00Z';

	const { listener, handles } = generateMockListener(...POSSIBLE_EVENTS);

	test.each([
		['packageFilePath', ['', datetimeArg]],
		['datetimeArg', [packageFilePath, '']],
	] as const)('requires %s', async (_, args) => {
		await main(args[0], args[1], { listener });

		expect(handles.missing_arguments).toHaveBeenCalled();
		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});

	test('passes correct arguments to updatePackageVersions', async () => {
		const options = { stripPrefixes: true, interactive: true, listener };

		await main(packageFilePath, datetimeArg, options);

		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, expect.any(Date), options);
	});

	test('throws an error if datetimeArg is not a valid datetime', async () => {
		const invalidDatetimeArg = 'abcd-de-fg';

		await main(packageFilePath, invalidDatetimeArg, { listener });

		expect(handles.invalid_datetime).toHaveBeenCalledWith('abcd-de-fg');
		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});

	test('maximizes datetime to now', async () => {
		const invalidDatetimeArg = '4000-01-01';

		const correctedDatetime = new Date('2022-01-01T00:00:00Z');
		handles.datetime_in_future.mockReturnValueOnce(correctedDatetime);

		await main(packageFilePath, invalidDatetimeArg, { listener });

		expect(handles.datetime_in_future).toHaveBeenCalledWith(new Date(invalidDatetimeArg));
		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, correctedDatetime, { listener });
	});
});
