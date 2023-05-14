import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';
import updateDependencies from './updateDependencies';

const getPackageVersionDatesMock = getPackageVersionDates as jest.MockedFunction<typeof getPackageVersionDates>;
const getHighestVersionAtTimeMock = getHighestVersionAtTime as jest.MockedFunction<typeof getHighestVersionAtTime>;

jest.mock('./getPackageVersionDates');
jest.mock('./getHighestVersionAtTime');

describe('updateDependencies', () => {
	const dependencies = {
		dependency1: '1.0.0',
		dependency2: '2.0.0',
	};

	const datetime = new Date('2022-01-01T00:00:00Z');

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

		const updatedDependencies = await updateDependencies(dependencies, datetime);

		expect(updatedDependencies).toEqual({
			dependency1: '1.1.0',
			dependency2: '2.1.0',
		});
	});

	test('uses previous version if no higher version is available', async () => {
		getHighestVersionAtTimeMock.mockReturnValueOnce(null).mockReturnValueOnce('2.1.0');

		const updatedDependencies = await updateDependencies(dependencies, datetime);

		expect(updatedDependencies).toEqual({
			dependency1: '1.0.0',
			dependency2: '2.1.0',
		});
	});
});
