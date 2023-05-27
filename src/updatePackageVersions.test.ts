import updatePackageVersions, { POSSIBLE_EVENTS } from './updatePackageVersions';

import fs from 'fs';

import { generateMockListener } from './testHelpers';
import updateDependencies from './updateDependencies';

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
	const { listener, handles } = generateMockListener(...POSSIBLE_EVENTS);

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

		expect(handles.reading_package_file).toHaveBeenCalledWith({ edge: 'start', packageFilePath });
		expect(fs.promises.readFile).toHaveBeenCalledWith(packageFilePath, 'utf8');
		expect(handles.reading_package_file).toHaveBeenCalledWith({
			edge: 'finish',
			packageFilePath,
			content: JSON.stringify(packageJson),
		});
		expect(handles.discovering_dependency_map).toHaveBeenCalledWith({ edge: 'start', map: 'dependencies' });
		expect(handles.discovering_dependency_map).toHaveBeenCalledWith({
			edge: 'finish',
			map: 'dependencies',
			dependencyMap: packageJson.dependencies,
		});
		expect(updateDependenciesMock).toHaveBeenCalledWith(packageJson.dependencies, datetime, { listener });
		expect(handles.dependency_map_processed).toHaveBeenCalledWith({
			map: 'dependencies',
			updates: updatedPackageJson.dependencies,
		});
		expect(handles.changes_made).toHaveBeenCalledWith(true);
		expect(handles.make_changes).toHaveBeenCalledWith({
			packageFilePath,
			packageJson: {
				old: packageJson,
				new: updatedPackageJson,
			},
			dryRun: false,
		});
	});

	test("'make_changes' isn't emitted when there are no changes made", async () => {
		jest.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify({}));

		await updatePackageVersions(packageFilePath, datetime, { listener });

		expect(fs.promises.readFile).toHaveBeenCalledWith(packageFilePath, 'utf8');
		expect(handles.discovering_dependency_map).toHaveBeenCalledWith({ edge: 'start', map: 'dependencies' });
		expect(handles.discovering_dependency_map).toHaveBeenCalledWith({
			edge: 'finish',
			map: 'dependencies',
			dependencyMap: undefined,
		});
		expect(handles.dependency_map_processed).not.toHaveBeenCalled();
		expect(handles.discovering_dependency_map).toHaveBeenCalledWith({ edge: 'start', map: 'devDependencies' });
		expect(handles.discovering_dependency_map).toHaveBeenCalledWith({
			edge: 'finish',
			map: 'devDependencies',
			dependencyMap: undefined,
		});
		expect(handles.changes_made).toHaveBeenCalledWith(false);
		expect(handles.make_changes).not.toHaveBeenCalled();
	});

	test('dry run passed to make_changes', async () => {
		jest.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
			JSON.stringify({
				dependencies: {
					dependency1: '1.0.0',
				},
			}),
		);
		updateDependenciesMock.mockResolvedValueOnce({
			dependency1: '1.1.0',
		});

		await updatePackageVersions(packageFilePath, datetime, { listener, dryRun: true });
		expect(handles.make_changes).toHaveBeenCalledWith(expect.objectContaining({ dryRun: true }));
	});
});
