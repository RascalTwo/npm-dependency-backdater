import type { VersionAction } from './types';
import generateVersionActions from './generateVersionActions';
import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';
import promptUserForVersionAction from './promptUserForVersionAction';
import updateDependencies from './updateDependencies';

const generateVersionActionsMock = generateVersionActions as jest.MockedFunction<typeof generateVersionActions>;
const getPackageVersionDatesMock = getPackageVersionDates as jest.MockedFunction<typeof getPackageVersionDates>;
const getHighestVersionAtTimeMock = getHighestVersionAtTime as jest.MockedFunction<typeof getHighestVersionAtTime>;
const promptUserForVersionActionMock = promptUserForVersionAction as jest.MockedFunction<
	typeof promptUserForVersionAction
>;

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

	beforeEach(() => getPackageVersionDatesMock.mockResolvedValue({}));

	describe('calls getHighestVersionAtTime', () => {
		test('with package versions for each dependency', async () => {
			const dependency1Versions = { 1: '1' };
			const dependency2Versions = { 2: '2' };
			getPackageVersionDatesMock.mockResolvedValueOnce(dependency1Versions).mockResolvedValueOnce(dependency2Versions);

			await updateDependencies(dependencies, datetime);

			expect(getPackageVersionDates).toHaveBeenCalledWith('dependency1', datetime);
			expect(getPackageVersionDates).toHaveBeenCalledWith('dependency2', datetime);
			expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency1Versions, datetime, true);
			expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency2Versions, datetime, true);
		});

		test('with false strict value when allowPreRelease is true', async () => {
			const dependency1Versions = { 1: '1' };
			getPackageVersionDatesMock.mockResolvedValue({ 1: '1' });

			await updateDependencies(dependencies, datetime, { allowPreRelease: true });

			expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency1Versions, datetime, false);
		});
	});

	test('returns updated dependencies', async () => {
		getHighestVersionAtTimeMock.mockReturnValueOnce('1.1.0').mockReturnValueOnce('2.1.0');
		getPackageVersionDatesMock.mockResolvedValueOnce({ 1: '1' }).mockResolvedValueOnce({ 2: '2' });

		const updatedDependencies = await updateDependencies(dependencies, datetime);

		expect(updatedDependencies).toEqual({
			dependency1: '~1.1.0',
			dependency2: '2.1.0',
		});
	});

	test('returns only updated versions', async () => {
		getHighestVersionAtTimeMock.mockReturnValueOnce(null).mockReturnValueOnce('2.1.0');

		const updatedDependencies = await updateDependencies(dependencies, datetime);

		expect(updatedDependencies).toEqual({
			dependency2: '2.1.0',
		});
	});

	test('strips semver prefixes', async () => {
		const dependencies = {
			dependency1: '^1.0.0',
		};
		getHighestVersionAtTimeMock.mockReturnValueOnce('1.1.0').mockReturnValueOnce('2.1.0');

		const updatedDependencies = await updateDependencies(dependencies, datetime, { stripPrefixes: true });

		expect(updatedDependencies).toEqual({
			dependency1: '1.1.0',
		});
	});

	describe('logging', () => {
		test('highest version not found', async () => {
			const dependencies = {
				dependency: '1.0.0',
			};
			const log = jest.fn();
			getPackageVersionDatesMock.mockResolvedValueOnce({ 1: '1' });

			await updateDependencies(dependencies, datetime, { log });

			expect(log).toHaveBeenCalledWith('Looking up dependency versions...');
			expect(log).toHaveBeenCalledWith('Found 1 version for dependency.');
			expect(log).toHaveBeenCalledWith('No versions available.');
		});

		test('highest version found and used', async () => {
			const dependencies = {
				dependency: '1.0.0',
			};
			const log = jest.fn();
			getPackageVersionDatesMock.mockResolvedValueOnce({ 1: '1', 2: '2' });
			getHighestVersionAtTimeMock.mockReturnValueOnce('1.1.0');

			await updateDependencies(dependencies, datetime, { log });

			expect(log).toHaveBeenCalledWith('Found 2 versions for dependency.');
			expect(log).toHaveBeenCalledWith('Highest version of dependency is 1.1.0.');
			expect(log).toHaveBeenCalledWith('Updated dependency from 1.0.0 to 1.1.0.');
		});

		test('highest version found but was already used', async () => {
			const dependencies = {
				dependency: '1.0.0',
			};
			const log = jest.fn();
			getHighestVersionAtTimeMock.mockReturnValueOnce('1.0.0');

			await updateDependencies(dependencies, datetime, { log });

			expect(log).toHaveBeenCalledWith('Found 0 versions for dependency.');
			expect(log).toHaveBeenCalledWith('Highest version of dependency is 1.0.0.');
			expect(log).toHaveBeenCalledWith('dependency is already 1.0.0.');
		});
	});

	describe('interactive', () => {
		const dependencies = {
			dependency: '^1.0.0',
		};
		const options = { interactive: true, log: jest.fn() };

		beforeEach(() => getHighestVersionAtTimeMock.mockReturnValueOnce('1.1.0'));

		test('calls generateVersionActions with correct args', async () => {
			await updateDependencies(dependencies, datetime, options);

			expect(generateVersionActionsMock).toHaveBeenCalledWith('^1.0.0', '1.1.0', options);
		});

		test('calls promptUserForVersionAction with correct args', async () => {
			const versionActions = [['action', 'version']] as VersionAction[];
			generateVersionActionsMock.mockReturnValueOnce(versionActions);

			await updateDependencies(dependencies, datetime, options);

			expect(promptUserForVersionActionMock).toHaveBeenCalledWith('dependency', versionActions, options);
		});

		test('logs message if same version is used', async () => {
			promptUserForVersionActionMock.mockResolvedValueOnce('^1.0.0');

			await updateDependencies(dependencies, datetime, options);

			expect(options.log).toHaveBeenCalledWith('Left dependency as ^1.0.0.');
		});
	});
});
