import { generateMockListener } from './testHelpers';

import main from '.';

import updatePackageVersions from './updatePackageVersions';

const updatePackageVersionsMock = updatePackageVersions as jest.MockedFunction<typeof updatePackageVersions>;

jest.mock('./updatePackageVersions');

describe('main', () => {
	const packageFilePath = '/path/to/package.json';
	const datetimeArg = '2022-01-01T00:00:00Z';

	const listener = generateMockListener();

	test.each([
		['packageFilePath', ['', datetimeArg]],
		['datetimeArg', [packageFilePath, '']],
	] as const)('%s is required', async (_, args) => {
		await main(args[0], args[1], { listener });

		expect(listener.handleMissingArguments).toHaveBeenCalled();
		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});

	test('correct arguments passed to updatePackageVersions', async () => {
		const options = { stripPrefixes: true, interactive: true, listener };

		await main(packageFilePath, datetimeArg, options);

		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, expect.any(Date), options);
	});

	test("doesn't continue if datetimeArg is invalid", async () => {
		const invalidDatetimeArg = 'abcd-de-fg';

		await main(packageFilePath, invalidDatetimeArg, { listener });

		expect(listener.handleInvalidDatetime).toHaveBeenCalledWith('abcd-de-fg');
		expect(updatePackageVersionsMock).not.toHaveBeenCalled();
	});

	test('datetime returned by listener.handleDatetimeInFuture is used', async () => {
		const invalidDatetimeArg = '4000-01-01';
		const correctedDatetime = new Date('2022-01-01T00:00:00Z');
		listener.handleDatetimeInFuture.mockResolvedValueOnce(correctedDatetime);

		await main(packageFilePath, invalidDatetimeArg, { listener });

		expect(listener.handleDatetimeInFuture).toHaveBeenCalledWith(new Date(invalidDatetimeArg));
		expect(updatePackageVersionsMock).toHaveBeenCalledWith(packageFilePath, correctedDatetime, { listener });
	});
});
