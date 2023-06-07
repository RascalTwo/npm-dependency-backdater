#!/usr/bin/env node

import type { Options } from './types';
import generateOptions from './generateOptions';
import updatePackageVersions from './updatePackageVersions';

export default async function main(packageFilePath: string, datetimeArg: string, options: Options) {
	const { listener } = options;

	if (!packageFilePath) {
		return listener.handleMissingArguments();
	}

	let datetime = datetimeArg ? new Date(datetimeArg) : new Date();
	if (isNaN(datetime.getTime())) {
		return listener.handleInvalidDatetime(datetimeArg);
	}
	if (datetime.getTime() > Date.now()) {
		datetime = await listener.handleDatetimeInFuture(datetime);
	}

	await listener.initialize(packageFilePath, datetime, options);

	await listener.handleRunStart();

	await updatePackageVersions(packageFilePath, datetime, options);

	return listener.handleRunFinish();
}

// istanbul ignore next
if (require.main === module) {
	generateOptions(process.argv)
		.then(options => main(process.argv[2], process.argv[3]?.startsWith('--') ? '' : process.argv[3], options))
		.catch(error => {
			console.error(error);
			process.exit(1);
		});
}
