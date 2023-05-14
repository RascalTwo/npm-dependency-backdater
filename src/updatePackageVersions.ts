import type { LoggingFunction } from './types';

import fs from 'fs/promises';

import shallowObjectsAreEqual from './shallowObjectsAreEqual';
import updateDependencies from './updateDependencies';

export default async function updatePackageVersions(packageFilePath: string, datetime: Date, log?: LoggingFunction) {
	log?.(`Reading ${packageFilePath}...`);
	const packageJson = JSON.parse(await fs.readFile(packageFilePath, 'utf8'));
	log?.(`${packageFilePath} read.`);

	let changesMade = false;
	for (const key of ['dependencies', 'devDependencies']) {
		if (key in packageJson) {
			log?.(`Updating ${key}...`);
			const dependencies = await updateDependencies(packageJson[key], datetime, log);
			if (shallowObjectsAreEqual(dependencies, packageJson[key])) {
				log?.(`No changes made to ${key}.`);
			} else {
				packageJson[key] = dependencies;
				log?.(`${key} updated.`);
				changesMade = true;
			}
		}
	}

	if (!changesMade) {
		return log?.(`No changes made to ${packageFilePath}.`);
	}

	log?.(`Writing to ${packageFilePath}...`);
	await fs.writeFile(packageFilePath, JSON.stringify(packageJson, null, 2));
	log?.(`${packageFilePath} written to.`);
}
