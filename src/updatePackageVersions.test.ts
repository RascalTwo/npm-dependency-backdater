import { DEPENDENCY_TYPES } from './constants';

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

	describe('updates all dependency types', () => {
		test.each(['as discovered', 'after all are loaded'])('%s', async () => {
			const packageJson = {
				dependencies: {
					dependency1: '1.0.0',
				},
				devDependencies: {
					devDependency1: '1.0.0',
				},
				peerDependencies: {
					peerDependency1: '1.0.0',
				},
				optionalDependencies: {
					optionalDependency1: '1.0.0',
				},
			};
			const updatedPackageJson = {
				dependencies: {
					dependency1: '1.1.0',
				},
				devDependencies: {
					devDependency1: '0.9.0',
				},
				peerDependencies: {
					peerDependency1: '1.0.0',
				},
				optionalDependencies: {
					optionalDependency1: '1.0.0',
				},
			};
			jest.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify(packageJson));
			updateDependenciesMock
				.mockResolvedValueOnce(updatedPackageJson.dependencies)
				.mockResolvedValueOnce(updatedPackageJson.devDependencies)
				.mockResolvedValueOnce(updatedPackageJson.peerDependencies)
				.mockResolvedValueOnce(updatedPackageJson.optionalDependencies);

			await updatePackageVersions(packageFilePath, datetime, { listener });

			expect(listener.handleReadingPackageFileStart).toHaveBeenCalled();
			expect(fs.promises.readFile).toHaveBeenCalledWith(packageFilePath, 'utf8');
			expect(listener.handleReadingPackageFileFinish).toHaveBeenCalledWith(JSON.stringify(packageJson));
			expect(listener.handleDiscoveringDependencyMapStart).toHaveBeenCalledWith('dependencies');
			expect(listener.handleDiscoveringDependencyMapFinish).toHaveBeenCalledWith(
				'dependencies',
				packageJson.dependencies,
			);
			expect(updateDependenciesMock).toHaveBeenCalledWith(packageJson.dependencies, datetime, { listener });
			expect(listener.handleDependencyMapProcessed).toHaveBeenCalledWith(
				'dependencies',
				updatedPackageJson.dependencies,
			);
			expect(listener.handleChangesMade).toHaveBeenCalledWith(true);
			expect(listener.handleMakeChanges).toHaveBeenCalledWith(packageJson, updatedPackageJson);
		});

		test('events are in the correct order when as discovered', async () => {
			const packageJson = {
				dependencies: {
					dependency1: '1.0.0',
				},
			};
			const updatedPackageJson = {
				dependencies: {
					dependency1: '1.1.0',
				},
			};
			jest.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify(packageJson));
			updateDependenciesMock.mockResolvedValueOnce(updatedPackageJson.dependencies);

			await updatePackageVersions(packageFilePath, datetime, { listener });

			expect(listener.handleDiscoveringDependencyMapStart).toHaveBeenCalledWith('dependencies');
			expect(listener.handleDiscoveringDependencyMapFinish).toHaveBeenCalledWith(
				'dependencies',
				packageJson.dependencies,
			);
			expect(updateDependenciesMock).toHaveBeenCalledWith(packageJson.dependencies, datetime, { listener });
			expect(listener.handleDependencyMapProcessed).toHaveBeenCalledWith(
				'dependencies',
				updatedPackageJson.dependencies,
			);

			const callOrders = [
				listener.handleDiscoveringDependencyMapStart.mock.invocationCallOrder[0],
				listener.handleDiscoveringDependencyMapFinish.mock.invocationCallOrder[0],
				updateDependenciesMock.mock.invocationCallOrder[0],
				listener.handleDependencyMapProcessed.mock.invocationCallOrder[0],
			];
			expect(callOrders.every((callOrder, index) => callOrder === callOrders[0] + index)).toBe(true);
		});

		test('events are in the correct order as are all loaded', async () => {
			const packageJson = {
				dependencies: {
					dependency1: '1.0.0',
				},
			};
			const updatedPackageJson = {
				dependencies: {
					dependency1: '1.1.0',
				},
			};
			jest.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify(packageJson));
			updateDependenciesMock.mockResolvedValueOnce(updatedPackageJson.dependencies);

			await updatePackageVersions(packageFilePath, datetime, { listener, preloadDependencies: true });

			expect(listener.handleDiscoveringDependencyMapStart).toHaveBeenCalledWith('dependencies');
			expect(listener.handleDiscoveringDependencyMapFinish).toHaveBeenCalledWith(
				'dependencies',
				packageJson.dependencies,
			);
			expect(updateDependenciesMock).toHaveBeenCalledWith(packageJson.dependencies, datetime, {
				listener,
				preloadDependencies: true,
			});
			expect(listener.handleDependencyMapProcessed).toHaveBeenCalledWith(
				'dependencies',
				updatedPackageJson.dependencies,
			);
			const discoveryOrder = [
				...listener.handleDiscoveringDependencyMapStart.mock.invocationCallOrder,
				...listener.handleDiscoveringDependencyMapFinish.mock.invocationCallOrder,
			].sort((a, b) => a - b);
			const processingOrder = [
				...updateDependenciesMock.mock.invocationCallOrder,
				...listener.handleDependencyMapProcessed.mock.invocationCallOrder,
			].sort((a, b) => a - b);
			// Assert that all processing orders are greater than all discovery orders
			expect(discoveryOrder.every(n => processingOrder.every(m => m > n)));
		});
	});

	test("listen.handleMakeChanges isn't called when there are no changes made", async () => {
		jest.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify({}));

		await updatePackageVersions(packageFilePath, datetime, { listener });

		expect(fs.promises.readFile).toHaveBeenCalledWith(packageFilePath, 'utf8');
		for (const dependencyType of DEPENDENCY_TYPES) {
			expect(listener.handleDiscoveringDependencyMapStart).toHaveBeenCalledWith(dependencyType);
			expect(listener.handleDiscoveringDependencyMapFinish).toHaveBeenCalledWith(dependencyType, undefined);
			expect(listener.handleDependencyMapProcessed).not.toHaveBeenCalled();
		}
		expect(listener.handleChangesMade).toHaveBeenCalledWith(false);
		expect(listener.handleMakeChanges).not.toHaveBeenCalled();
	});

	test('dry run passed to listener.handleMakeChanges', async () => {
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

		expect(listener.handleMakeChanges).toHaveBeenCalledWith(oldPackageJson, {
			dependencies: {
				dependency1: '1.1.0',
			},
		});
	});
});
