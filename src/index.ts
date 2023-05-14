#!/usr/bin/env node

import updatePackageVersions from './updatePackageVersions';

export default async function main(packageFilePath: string, datetimeArg: string, silent: boolean) {
	if (!packageFilePath || !datetimeArg) {
		throw new Error('Usage: npm-dependency-backdater <package.json location> <datetime> [--silent]');
	}

	const datetime = new Date(datetimeArg);
	if (isNaN(datetime.getTime())) {
		throw new Error('Please provide a valid datetime (YYYY-MM-DDTHH:mm:ssZ)');
	}

	if (!silent)
		console.log(
			`Attempting to update package versions in ${packageFilePath} to their latest versions as of ${datetime.toISOString()}...`,
		);

	return updatePackageVersions(packageFilePath, datetime, silent ? undefined : console.log);
}

// istanbul ignore next
if (require.main === module) {
	main(process.argv[2], process.argv[3], process.argv.includes('--silent')).catch(error => {
		console.error(error);
		process.exit(1);
	});
}
