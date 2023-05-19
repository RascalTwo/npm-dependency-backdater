import type { Options } from './types';

import chalk from 'chalk';
import { diff } from 'jest-diff';
import fs from 'fs';
import updateDependencies from './updateDependencies';

export default async function updatePackageVersions(packageFilePath: string, datetime: Date, options: Options = {}) {
	const { log } = options;

	log?.(`Reading ${packageFilePath}...`);
	const packageJson = JSON.parse(await fs.promises.readFile(packageFilePath, 'utf8'));
	log?.(`${packageFilePath} read.`);

	const oldPackageJson = JSON.parse(JSON.stringify(packageJson));

	let changesMade = false;
	for (const key of ['dependencies', 'devDependencies']) {
		if (key in packageJson) {
			log?.(`Updating ${key}...`);
			const updatedDependencies = await updateDependencies(packageJson[key], datetime, options);
			if (Object.keys(updatedDependencies).length === 0) {
				log?.(`No changes made to ${key}.`);
			} else {
				packageJson[key] = { ...packageJson[key], ...updatedDependencies };
				log?.(`${key} updated.`);
				changesMade = true;
			}
		}
	}

	if (!changesMade) {
		return log?.(`No changes made to ${packageFilePath}.`);
	}

	if (options.dryRun) {
		console.log(
			diff(oldPackageJson, packageJson, {
				aAnnotation: 'Old Version(s)',
				aColor: text => chalk.red(text),
				bAnnotation: 'New Version(s)',
				bColor: text => chalk.green(text),
			}),
		);
	} else {
		log?.(`Writing to ${packageFilePath}...`);
		await fs.promises.writeFile(packageFilePath, JSON.stringify(packageJson, null, 2));
		log?.(`${packageFilePath} written to.`);
	}
}
