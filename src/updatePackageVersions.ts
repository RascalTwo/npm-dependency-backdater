import type { Options } from './types';

import fs from 'fs';
import updateDependencies from './updateDependencies';

export default async function updatePackageVersions(packageFilePath: string, datetime: Date, options: Options) {
	const { listener } = options;

	listener.handleReadingPackageFileStart(packageFilePath);
	const packageJsonString = await fs.promises.readFile(packageFilePath, 'utf8');
	listener.handleReadingPackageFileFinish(packageFilePath, packageJsonString);

	const packageJson = JSON.parse(packageJsonString);
	const oldPackageJson = JSON.parse(JSON.stringify(packageJson));

	let changesMade = false;
	for (const key of ['dependencies', 'devDependencies'] as const) {
		listener.handleDiscoveringDependencyMapStart(key);
		const dependencyMap = packageJson[key];
		listener.handleDiscoveringDependencyMapFinish(key, dependencyMap);

		if (dependencyMap) {
			const updates = await updateDependencies(dependencyMap, datetime, options);
			if (Object.keys(updates).length) {
				packageJson[key] = { ...dependencyMap, ...updates };
				changesMade = true;
			}
			listener.handleDependencyMapProcessed(key, updates);
		}
	}

	listener.handleChangesMade(changesMade);
	if (!changesMade) return;

	return listener.handleMakeChanges(
		packageFilePath,
		{
			old: oldPackageJson,
			new: packageJson,
		},
		!!options.dryRun,
	);
}
