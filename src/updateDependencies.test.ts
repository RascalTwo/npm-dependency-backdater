import updateDependencies, { POSSIBLE_EVENTS } from './updateDependencies';
import { generateMockListener } from './testHelpers';
import generateVersionActions from './generateVersionActions';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';

const generateVersionActionsMock = generateVersionActions as jest.MockedFunction<typeof generateVersionActions>;
const getPackageVersionDatesMock = getPackageVersionDates as jest.MockedFunction<typeof getPackageVersionDates>;
const getHighestVersionAtTimeMock = getHighestVersionAtTime as jest.MockedFunction<typeof getHighestVersionAtTime>;

jest.mock('./generateVersionActions');
jest.mock('./getHighestVersionAtTime');
jest.mock('./getPackageVersionDates');
jest.mock('./promptUserForVersionAction');

describe('updateDependencies', () => {
	const dependencies = {
		dependency1: '~1.0.0',
		dependency2: '2.0.0',
	};

	const datetime = new Date('2022-01-01T00:00:00Z');

	const { listener, handles } = generateMockListener(...POSSIBLE_EVENTS);

	beforeEach(() => getPackageVersionDatesMock.mockResolvedValue([{}, datetime]));

	describe('calls getHighestVersionAtTime', () => {
		test('with package versions for each dependency', async () => {
			const dependency1Versions = { 1: '1' };
			const dependency2Versions = { 2: '2' };
			getPackageVersionDatesMock
				.mockResolvedValueOnce([dependency1Versions, datetime])
				.mockResolvedValueOnce([dependency2Versions, datetime]);
			getHighestVersionAtTimeMock.mockReturnValueOnce('1.0.0');

			await updateDependencies(dependencies, datetime, { listener });

			expect(handles.getting_package_version_dates).toHaveBeenCalledWith({
				edge: 'start',
				packageName: 'dependency1',
				datetime,
				version: {
					raw: '~1.0.0',
					prefix: '~',
					parsed: '1.0.0',
				},
			});
			expect(getPackageVersionDates).toHaveBeenCalledWith('dependency1', datetime);
			expect(handles.getting_package_version_dates).toHaveBeenCalledWith({
				edge: 'finish',
				packageName: 'dependency1',
				datetime,
				version: {
					raw: '~1.0.0',
					prefix: '~',
					parsed: '1.0.0',
				},
				cacheDate: datetime,
				versions: dependency1Versions,
			});
			expect(getPackageVersionDates).toHaveBeenCalledWith('dependency2', datetime);
			expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency1Versions, datetime, true);
			expect(handles.calculated_highest_version).toHaveBeenCalledWith({
				packageName: 'dependency1',
				version: '1.0.0',
				highestVersion: '1.0.0',
				allowPreRelease: false,
			});
			expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency2Versions, datetime, true);
		});

		test('with false strict value when allowPreRelease is true', async () => {
			const dependency1Versions = { 1: '1' };
			getPackageVersionDatesMock.mockResolvedValue([dependency1Versions, datetime]);

			await updateDependencies(dependencies, datetime, { listener, allowPreRelease: true });

			expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency1Versions, datetime, false);
		});
	});

	test('returns updated dependencies', async () => {
		getHighestVersionAtTimeMock.mockReturnValueOnce('1.1.0').mockReturnValueOnce('2.1.0');
		getPackageVersionDatesMock
			.mockResolvedValueOnce([{ 1: '1' }, datetime])
			.mockResolvedValueOnce([{ 2: '2' }, datetime]);
		generateVersionActionsMock.mockReturnValueOnce([['verb', 'version']]);
		handles.prompt_user_for_version_action.mockResolvedValueOnce('~1.1.0').mockResolvedValueOnce('2.1.0');

		const updatedDependencies = await updateDependencies(dependencies, datetime, { listener });

		expect(handles.prompt_user_for_version_action).toHaveBeenCalledWith({
			options: { listener },
			packageName: 'dependency1',
			actions: [['verb', 'version']],
		});
		expect(handles.dependency_processed).toHaveBeenCalledWith({
			packageName: 'dependency1',
			version: {
				old: '~1.0.0',
				new: '~1.1.0',
			},
		});
		expect(updatedDependencies).toEqual({
			dependency1: '~1.1.0',
			dependency2: '2.1.0',
		});
	});

	test('returns only updated versions', async () => {
		getHighestVersionAtTimeMock.mockReturnValueOnce(null).mockReturnValueOnce('2.1.0');
		handles.prompt_user_for_version_action.mockResolvedValueOnce('2.1.0');

		const updatedDependencies = await updateDependencies(dependencies, datetime, { listener });

		expect(updatedDependencies).toEqual({
			dependency2: '2.1.0',
		});
	});

	test('strips semver prefixes', async () => {
		const dependencies = {
			dependency1: '^1.0.0',
		};
		getHighestVersionAtTimeMock.mockReturnValueOnce('1.1.0').mockReturnValueOnce('2.1.0');
		handles.prompt_user_for_version_action.mockResolvedValueOnce('1.1.0');

		const updatedDependencies = await updateDependencies(dependencies, datetime, { listener, stripPrefixes: true });

		expect(updatedDependencies).toEqual({
			dependency1: '1.1.0',
		});
	});

	describe('interactive', () => {
		const dependencies = {
			dependency: '^1.0.0',
		};
		const options = { interactive: true, listener };

		beforeEach(() => getHighestVersionAtTimeMock.mockReturnValueOnce('1.1.0'));

		test('calls generateVersionActions with correct args', async () => {
			handles.prompt_user_for_version_action.mockResolvedValueOnce('');

			await updateDependencies(dependencies, datetime, options);

			expect(generateVersionActionsMock).toHaveBeenCalledWith('^1.0.0', '1.1.0', undefined);
		});
	});
});
