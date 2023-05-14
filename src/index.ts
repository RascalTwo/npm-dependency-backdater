#!/usr/bin/env node

import updatePackageVersions from './updatePackageVersions';

export default async function main(packageFilePath: string, datetimeArg: string) {
	if (!packageFilePath || !datetimeArg) {
		throw new Error('Please provide a valid package.json location and datetime (YYYY-MM-DDTHH:mm:ssZ)');
	}

	const datetime = new Date(datetimeArg);
	if (isNaN(datetime.getTime())) {
		throw new Error('Please provide a valid datetime (YYYY-MM-DDTHH:mm:ssZ)');
	}

	return updatePackageVersions(packageFilePath, datetime);
}

// istanbul ignore next
if (require.main === module) {
	main(process.argv[2], process.argv[3]).catch(error => {
		console.error(error);
		process.exit(1);
	});
}
