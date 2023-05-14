#!/usr/bin/env node

import type { Options } from './types';
import { SUPPORTED_PREFIXES } from './parseRawVersion';
import generateOptions from './generateOptions';
import updatePackageVersions from './updatePackageVersions';

export default async function main(packageFilePath: string, datetimeArg: string, options: Options = {}) {
	if (!packageFilePath || !datetimeArg) {
		throw new Error(`Usage: npm-dependency-backdater <package.json location> <datetime> [--silent] [--strip-prefixes]

package.json location: The location of the package.json file to update
datetime: The datetime to update the package versions to (YYYY-MM-DDTHH:mm:ssZ)

--silent: Whether to suppress logging
--strip-prefixes: Whether to strip the (${SUPPORTED_PREFIXES.join(', ')}) prefixes from the updated versions
--interactive: Whether to prompt the user before updating each package version
`);
	}

	const datetime = new Date(datetimeArg);
	if (isNaN(datetime.getTime())) {
		throw new Error('Please provide a valid datetime (YYYY-MM-DDTHH:mm:ssZ)');
	}

	options.log?.(
		`Attempting to update package versions in ${packageFilePath} to their latest versions as of ${datetime.toISOString()}...`,
	);

	return updatePackageVersions(packageFilePath, datetime, options);
}

// istanbul ignore next
if (require.main === module) {
	main(process.argv[2], process.argv[3], generateOptions(process.argv)).catch(error => {
		console.error(error);
		process.exit(1);
	});
}
