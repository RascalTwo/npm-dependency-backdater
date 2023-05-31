import fs from 'fs';

import { generateMockListener } from './testHelpers';

import updateDependencies from './updateDependencies';
import updatePackageVersions from './updatePackageVersions';

const updateDependenciesMock = updateDependencies as jest.MockedFunction<typeof updateDependencies>;

jest.mock('fs', () => ({
	promises: {
		readFile: jest.fn(),
		writeFile: jest.fn(),
	},
}));
jest.mock('./updateDependencies');

describe('updatePackageVersions', () => {
	const packageFilePath = '/path/to/package.json';
	const datetime = new Date('2022-01-01T00:00:00Z');
	const listener = generateMockListener();

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
		jest.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify(packageJson));
		updateDependenciesMock
			.mockResolvedValueOnce(updatedPackageJson.dependencies)
			.mockResolvedValueOnce(updatedPackageJson.devDependencies);

		await updatePackageVersions(packageFilePath, datetime, { listener });

		expect(listener.handleReadingPackageFileStart).toHaveBeenCalledWith(packageFilePath);
		expect(fs.promises.readFile).toHaveBeenCalledWith(packageFilePath, 'utf8');
		expect(listener.handleReadingPackageFileFinish).toHaveBeenCalledWith(packageFilePath, JSON.stringify(packageJson));
		expect(listener.handleDiscoveringDependencyMapStart).toHaveBeenCalledWith('dependencies');
		expect(listener.handleDiscoveringDependencyMapFinish).toHaveBeenCalledWith(
			'dependencies',
			packageJson.dependencies,
		);
		expect(updateDependenciesMock).toHaveBeenCalledWith(packageJson.dependencies, datetime, { listener });
		expect(listener.handleDependencyMapProcessed).toHaveBeenCalledWith('dependencies', updatedPackageJson.dependencies);
		expect(listener.handleChangesMade).toHaveBeenCalledWith(true);
		expect(listener.handleMakeChanges).toHaveBeenCalledWith(
			packageFilePath,
			{
				old: packageJson,
				new: updatedPackageJson,
			},
			false,
		);
	});

	test("'make_changes' isn't emitted when there are no changes made", async () => {
		jest.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify({}));

		await updatePackageVersions(packageFilePath, datetime, { listener });

		expect(fs.promises.readFile).toHaveBeenCalledWith(packageFilePath, 'utf8');
		expect(listener.handleDiscoveringDependencyMapStart).toHaveBeenCalledWith('dependencies');
		expect(listener.handleDiscoveringDependencyMapFinish).toHaveBeenCalledWith('dependencies', undefined);
		expect(listener.handleDependencyMapProcessed).not.toHaveBeenCalled();
		expect(listener.handleDiscoveringDependencyMapStart).toHaveBeenCalledWith('devDependencies');
		expect(listener.handleDiscoveringDependencyMapFinish).toHaveBeenCalledWith('devDependencies', undefined);
		expect(listener.handleChangesMade).toHaveBeenCalledWith(false);
		expect(listener.handleMakeChanges).not.toHaveBeenCalled();
	});

	test('dry run passed to make_changes', async () => {
		const oldPackageJson = {
			dependencies: {
				dependency1: '1.0.0',
			},
		};
		jest.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify(oldPackageJson));
		updateDependenciesMock.mockResolvedValueOnce({
			dependency1: '1.1.0',
		});

		await updatePackageVersions(packageFilePath, datetime, { listener, dryRun: true });
		expect(listener.handleMakeChanges).toHaveBeenCalledWith(
			packageFilePath,
			{
				old: oldPackageJson,
				new: {
					dependencies: {
						dependency1: '1.1.0',
					},
				},
			},
			true,
		);
	});
});
