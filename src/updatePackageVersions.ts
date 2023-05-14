import fs from 'fs/promises';

import updateDependencies from './updateDependencies';

export default async function updatePackageVersions(packageFilePath: string, datetime: Date) {
	const packageJson = JSON.parse(await fs.readFile(packageFilePath, 'utf8'));

	if ('dependencies' in packageJson) {
		packageJson.dependencies = await updateDependencies(packageJson.dependencies, datetime);
	}

	if ('devDependencies' in packageJson) {
		packageJson.devDependencies = await updateDependencies(packageJson.devDependencies, datetime);
	}

	await fs.writeFile(packageFilePath, JSON.stringify(packageJson, null, 2));
}
