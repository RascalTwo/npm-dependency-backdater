import type { Options } from './types';

import fs from 'fs';
import updateDependencies from './updateDependencies';

export const POSSIBLE_EVENTS = [
	'reading_package_file',
	'discovering_dependency_map',
	'dependency_map_processed',
	'changes_made',
	'make_changes',
] as const;

export default async function updatePackageVersions(packageFilePath: string, datetime: Date, options: Options) {
	const { listener } = options;

	listener.emit('reading_package_file', { edge: 'start', packageFilePath });
	const packageJsonString = await fs.promises.readFile(packageFilePath, 'utf8');
	listener.emit('reading_package_file', { edge: 'finish', packageFilePath, content: packageJsonString });

	const packageJson = JSON.parse(packageJsonString);
	const oldPackageJson = JSON.parse(JSON.stringify(packageJson));

	let changesMade = false;
	for (const key of ['dependencies', 'devDependencies'] as const) {
		listener.emit('discovering_dependency_map', { edge: 'start', map: key });
		const dependencyMap = packageJson[key];
		listener.emit('discovering_dependency_map', { edge: 'finish', map: key, dependencyMap });

		if (dependencyMap) {
			const updates = await updateDependencies(dependencyMap, datetime, options);
			if (Object.keys(updates).length) {
				packageJson[key] = { ...dependencyMap, ...updates };
				changesMade = true;
			}
			listener.emit('dependency_map_processed', { map: key, updates: updates });
		}
	}

	listener.emit('changes_made', changesMade);
	if (!changesMade) return;

	return listener.emit('make_changes', {
		packageFilePath,
		packageJson: {
			old: oldPackageJson,
			new: packageJson,
		},
		dryRun: !!options.dryRun,
	});
}
