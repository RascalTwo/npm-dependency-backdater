import fs from 'fs/promises';

import updateDependencies from './updateDependencies';
import updatePackageVersions from './updatePackageVersions';

const updateDependenciesMock = updateDependencies as jest.MockedFunction<typeof updateDependencies>;

jest.mock('fs/promises');
jest.mock('./updateDependencies');

describe('updatePackageVersions', () => {
	const packageFilePath = '/path/to/package.json';
	const datetime = new Date('2022-01-01T00:00:00Z');

	test('updates dependencies and devDependencies', async () => {
		jest.spyOn(fs, 'readFile').mockResolvedValueOnce(
			JSON.stringify({
				dependencies: {
					dependency1: '1.0.0',
					dependency2: '2.0.0',
				},
				devDependencies: {
					devDependency1: '1.0.0',
					devDependency2: '2.0.0',
				},
			}),
		);
		const updatedPackageJson = {
			dependencies: {
				dependency1: '1.1.0',
				dependency2: '2.1.0',
			},
			devDependencies: {
				devDependency1: '0.9.0',
				devDependency2: '1.9.0',
			},
		};
		updateDependenciesMock
			.mockResolvedValueOnce(updatedPackageJson.dependencies)
			.mockResolvedValueOnce(updatedPackageJson.devDependencies);

		await updatePackageVersions(packageFilePath, datetime);

		expect(fs.readFile).toHaveBeenCalledWith(packageFilePath, 'utf8');
		expect(fs.writeFile).toHaveBeenCalledWith(packageFilePath, JSON.stringify(updatedPackageJson, null, 2));
	});

	test('handles no dependencies', async () => {
		const packageJson = {};
		jest.spyOn(fs, 'readFile').mockResolvedValueOnce(JSON.stringify(packageJson));

		await updatePackageVersions(packageFilePath, datetime);

		expect(fs.readFile).toHaveBeenCalledWith(packageFilePath, 'utf8');
		expect(fs.writeFile).toHaveBeenCalledWith(packageFilePath, JSON.stringify(packageJson, null, 2));
	});
});
