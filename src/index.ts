#!/usr/bin/env node

import type { Options } from './types';
import generateOptions from './generateOptions';
import updatePackageVersions from './updatePackageVersions';

export default async function main(packageFilePath: string, datetimeArg: string, options: Options) {
	const { listener } = options;

	if (!packageFilePath || !datetimeArg) {
		return listener.handleMissingArguments();
	}

	let datetime = new Date(datetimeArg);
	if (isNaN(datetime.getTime())) {
		return listener.handleInvalidDatetime(datetimeArg);
	}
	if (datetime.getTime() > Date.now()) {
		datetime = listener.handleDatetimeInFuture(datetime);
	}

	listener.initialize(packageFilePath, datetime, options);

	listener.handleRunStart();

	await updatePackageVersions(packageFilePath, datetime, options);

	listener.handleRunFinish();
}

// istanbul ignore next
if (require.main === module) {
	main(process.argv[2], process.argv[3], generateOptions(process.argv)).catch(error => {
		console.error(error);
		process.exit(1);
	});
}
