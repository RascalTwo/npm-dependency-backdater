import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';
import updateDependencies from './updateDependencies';

const getPackageVersionDatesMock = getPackageVersionDates as jest.MockedFunction<typeof getPackageVersionDates>;
const getHighestVersionAtTimeMock = getHighestVersionAtTime as jest.MockedFunction<typeof getHighestVersionAtTime>;

jest.mock('./getPackageVersionDates');
jest.mock('./getHighestVersionAtTime');

describe('updateDependencies', () => {
	const dependencies = {
		dependency1: '~1.0.0',
		dependency2: '2.0.0',
	};

	const datetime = new Date('2022-01-01T00:00:00Z');

	beforeEach(() => getPackageVersionDatesMock.mockResolvedValue({}));

	test('passes package versions for each dependency to getHighestVersionAtTime', async () => {
		const dependency1Versions = { 1: '1' };
		const dependency2Versions = { 2: '2' };
		getPackageVersionDatesMock.mockResolvedValueOnce(dependency1Versions).mockResolvedValueOnce(dependency2Versions);

		await updateDependencies(dependencies, datetime);

		expect(getPackageVersionDates).toHaveBeenCalledWith('dependency1');
		expect(getPackageVersionDates).toHaveBeenCalledWith('dependency2');
		expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency1Versions, datetime, true);
		expect(getHighestVersionAtTime).toHaveBeenCalledWith(dependency2Versions, datetime, true);
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
});
