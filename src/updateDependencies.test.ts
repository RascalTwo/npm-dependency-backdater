import { generateMockListener } from './testHelpers';

import generateVersionActions from './generateVersionActions';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';

import updateDependencies from './updateDependencies';

const generateVersionActionsMock = generateVersionActions as jest.MockedFunction<typeof generateVersionActions>;
const getHighestVersionAtTimeMock = getHighestVersionAtTime as jest.MockedFunction<typeof getHighestVersionAtTime>;
const getPackageVersionDatesMock = getPackageVersionDates as jest.MockedFunction<typeof getPackageVersionDates>;

jest.mock('./generateVersionActions');
jest.mock('./getHighestVersionAtTime');
jest.mock('./getPackageVersionDates');

describe('updateDependencies', () => {
	const dependencies = {
		dependency1: '~1.0.0',
		dependency2: '2.0.0',
	};
	const datetime = new Date('2022-01-01T00:00:00Z');
	const dependency1Versions = { '1.0.0': '1' };
	const dependency2Versions = { '2.0.0': '2' };

	const listener = generateMockListener();

	beforeEach(() => getPackageVersionDatesMock.mockResolvedValue([{}, datetime]));

	describe('calls getHighestVersionAtTime', () => {
		test('with package versions for each dependency', async () => {
			getPackageVersionDatesMock
				.mockResolvedValueOnce([dependency1Versions, datetime])
				.mockResolvedValueOnce([dependency2Versions, datetime]);
			getHighestVersionAtTimeMock.mockReturnValueOnce('1.0.0');

			await updateDependencies(dependencies, datetime, { listener });

			expect(listener.handleGettingPackageVersionDatesStart).toHaveBeenCalledWith('dependency1');
			expect(getPackageVersionDates).toHaveBeenCalledWith('dependency1', datetime);
			expect(listener.handleGettingPackageVersionDatesFinish).toHaveBeenCalledWith(
				'dependency1',
				datetime,
				datetime,
				dependency1Versions,
			);
			expect(getPackageVersionDates).toHaveBeenCalledWith('dependency2', datetime);
			expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency1Versions, datetime, true);
			expect(listener.handleCalculatedHighestVersion).toHaveBeenCalledWith('dependency1', '1.0.0', '1.0.0', false);
			expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency2Versions, datetime, true);
		});

		test('with false strict value when allowPreRelease is true', async () => {
			getPackageVersionDatesMock.mockResolvedValue([dependency1Versions, datetime]);

			await updateDependencies(dependencies, datetime, { listener, allowPreRelease: true });

			expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency1Versions, datetime, false);
		});
	});

	test('updated dependency map is returned', async () => {
		getHighestVersionAtTimeMock.mockReturnValueOnce('1.1.0').mockReturnValueOnce('2.1.0');
		getPackageVersionDatesMock
			.mockResolvedValueOnce([dependency1Versions, datetime])
			.mockResolvedValueOnce([dependency2Versions, datetime]);
		generateVersionActionsMock.mockReturnValueOnce([['verb', 'version']]);
		listener.handlePromptUserForVersionAction.mockResolvedValueOnce('~1.1.0').mockResolvedValueOnce('2.1.0');

		const result = await updateDependencies(dependencies, datetime, { listener });

		expect(listener.handlePromptUserForVersionAction).toHaveBeenCalledWith({ listener }, 'dependency1', [
			['verb', 'version'],
		]);
		expect(listener.handleDependencyProcessed).toHaveBeenCalledWith('dependency1', {
			old: '~1.0.0',
			new: '~1.1.0',
		});
		expect(result).toEqual({
			dependency1: '~1.1.0',
			dependency2: '2.1.0',
		});
	});

	test('only updated versions are in returned map', async () => {
		getHighestVersionAtTimeMock.mockReturnValueOnce(null).mockReturnValueOnce('2.1.0');
		listener.handlePromptUserForVersionAction.mockResolvedValueOnce('2.1.0');

		const result = await updateDependencies(dependencies, datetime, { listener });

		expect(result).toEqual({
			dependency2: '2.1.0',
		});
	});

	test('semver prefixes are stripped when stripPrefixes is true', async () => {
		const dependencies = {
			dependency1: '^1.0.0',
		};
		getHighestVersionAtTimeMock.mockReturnValueOnce('1.1.0').mockReturnValueOnce('2.1.0');
		listener.handlePromptUserForVersionAction.mockResolvedValueOnce('1.1.0');

		const result = await updateDependencies(dependencies, datetime, { listener, stripPrefixes: true });

		expect(result).toEqual({
			dependency1: '1.1.0',
		});
	});

	describe('interactive', () => {
		const dependencies = {
			dependency: '^1.0.0',
		};
		const options = { interactive: true, listener };

		test('calls generateVersionActions with correct arguments', async () => {
			getHighestVersionAtTimeMock.mockReturnValueOnce('1.1.0');
			listener.handlePromptUserForVersionAction.mockResolvedValueOnce('');

			await updateDependencies(dependencies, datetime, options);

			expect(generateVersionActionsMock).toHaveBeenCalledWith(
				{
					raw: '^1.0.0',
					prefix: '^',
					version: '1.0.0',
				},
				'1.1.0',
				undefined,
			);
		});
	});
});
