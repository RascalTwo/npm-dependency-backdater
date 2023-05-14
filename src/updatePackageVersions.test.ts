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
		const packageJson = {
			dependencies: {
				dependency1: '1.0.0',
				dependency2: '2.0.0',
			},
			devDependencies: {
				devDependency1: '1.0.0',
				devDependency2: '2.0.0',
			},
		};
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
		jest.spyOn(fs, 'readFile').mockResolvedValueOnce(JSON.stringify(packageJson));
		updateDependenciesMock
			.mockResolvedValueOnce(updatedPackageJson.dependencies)
			.mockResolvedValueOnce(updatedPackageJson.devDependencies);

		await updatePackageVersions(packageFilePath, datetime);

		expect(fs.readFile).toHaveBeenCalledWith(packageFilePath, 'utf8');
		expect(updateDependenciesMock).toHaveBeenCalledWith(packageJson.dependencies, datetime, {});
		expect(fs.writeFile).toHaveBeenCalledWith(packageFilePath, JSON.stringify(updatedPackageJson, null, 2));
	});

	test("doesn't write to file when there have been no changes", async () => {
		const packageJson = {};
		jest.spyOn(fs, 'readFile').mockResolvedValueOnce(JSON.stringify(packageJson));

		await updatePackageVersions(packageFilePath, datetime);

		expect(fs.readFile).toHaveBeenCalledWith(packageFilePath, 'utf8');
		expect(fs.writeFile).not.toHaveBeenCalled();
	});

	describe('logging', () => {
		beforeEach(() => {
			jest.spyOn(console, 'log').mockImplementation();
		});

		test('file read and no changes made', async () => {
			const log = jest.fn();
			jest.spyOn(fs, 'readFile').mockResolvedValueOnce(JSON.stringify({}));

			await updatePackageVersions(packageFilePath, datetime, { log });

			expect(log).toHaveBeenCalledWith(`Reading ${packageFilePath}...`);
			expect(log).toHaveBeenCalledWith(`${packageFilePath} read.`);
			expect(log).toHaveBeenCalledWith(`No changes made to ${packageFilePath}.`);
		});

		test('file written to', async () => {
			const dependencies = {
				dependency1: '1.0.0',
			};
			const log = jest.fn();
			jest.spyOn(fs, 'readFile').mockResolvedValueOnce(
				JSON.stringify({
					dependencies,
					devDependencies: {
						devDependency1: '1.0.0',
					},
				}),
			);
			updateDependenciesMock
				.mockResolvedValueOnce({
					dependency1: '1.1.0',
				})
				.mockResolvedValueOnce({});
			jest.spyOn(fs, 'writeFile').mockResolvedValueOnce();

			await updatePackageVersions(packageFilePath, datetime, { log });

			expect(log).toHaveBeenCalledWith(`Reading ${packageFilePath}...`);
			expect(log).toHaveBeenCalledWith(`${packageFilePath} read.`);
			expect(log).toHaveBeenCalledWith('Updating dependencies...');
			expect(updateDependenciesMock).toHaveBeenCalledWith(dependencies, datetime, { log });
			expect(log).toHaveBeenCalledWith('dependencies updated.');
			expect(log).toHaveBeenCalledWith('Updating devDependencies...');
			expect(log).toHaveBeenCalledWith('No changes made to devDependencies.');
			expect(log).toHaveBeenCalledWith(`Writing to ${packageFilePath}...`);
			expect(log).toHaveBeenCalledWith(`${packageFilePath} written to.`);
		});
	});
});
