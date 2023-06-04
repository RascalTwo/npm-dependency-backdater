import type { DependencyMap, DependencyType, Options } from './types';
import { DEPENDENCY_TYPES } from './constants';

import fs from 'fs';
import updateDependencies from './updateDependencies';

export default async function updatePackageVersions(packageFilePath: string, datetime: Date, options: Options) {
	const { listener } = options;

	listener.handleReadingPackageFileStart();
	const packageJsonString = await fs.promises.readFile(packageFilePath, 'utf8');
	listener.handleReadingPackageFileFinish(packageJsonString);

	const packageJson = JSON.parse(packageJsonString) as Record<DependencyType, DependencyMap>;
	const oldPackageJson = JSON.parse(JSON.stringify(packageJson));

	let changesMade = false;

	const performDiscovery = (key: DependencyType) => {
		listener.handleDiscoveringDependencyMapStart(key);
		const dependencyMap = packageJson[key];
		listener.handleDiscoveringDependencyMapFinish(key, dependencyMap);
		return dependencyMap;
	};

	const performDependenciesUpdate = async (key: DependencyType, dependencyMap: DependencyMap) => {
		const updates = await updateDependencies(dependencyMap, datetime, options);
		if (Object.keys(updates).length) {
			packageJson[key] = { ...dependencyMap, ...updates };
			changesMade = true;
		}
		listener.handleDependencyMapProcessed(key, updates);
	};

	if (options.preloadDependencies) {
		const dependencyMaps: [DependencyType, DependencyMap][] = [];

		for (const key of DEPENDENCY_TYPES) {
			const dependencyMap = performDiscovery(key);
			if (dependencyMap) {
				dependencyMaps.push([key, dependencyMap]);
			}
		}

		for (const [key, dependencyMap] of dependencyMaps) {
			await performDependenciesUpdate(key, dependencyMap);
		}
	} else {
		for (const key of DEPENDENCY_TYPES) {
			const dependencyMap = performDiscovery(key);
			if (dependencyMap) {
				await performDependenciesUpdate(key, dependencyMap);
			}
		}
	}

	listener.handleChangesMade(changesMade);
	if (!changesMade) return;

	return listener.handleMakeChanges(oldPackageJson, packageJson);
}
