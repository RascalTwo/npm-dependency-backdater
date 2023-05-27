#!/usr/bin/env node

import type { Options } from './types';
import generateOptions from './generateOptions';
import updatePackageVersions from './updatePackageVersions';

export const POSSIBLE_EVENTS = ['missing_arguments', 'invalid_datetime', 'datetime_in_future', 'run'] as const;

export default async function main(packageFilePath: string, datetimeArg: string, options: Options) {
	const { listener } = options;
	//listener.validate();

	if (!packageFilePath || !datetimeArg) {
		return listener.emit('missing_arguments', undefined);
	}

	let datetime = new Date(datetimeArg);
	if (isNaN(datetime.getTime())) {
		return listener.emit('invalid_datetime', datetimeArg);
	}
	if (datetime.getTime() > Date.now()) {
		datetime = listener.emit('datetime_in_future', datetime);
	}

	listener.emit('run', {
		edge: 'start',
		options,
		packageFilePath,
		datetime,
	});

	await updatePackageVersions(packageFilePath, datetime, options);

	listener.emit('run', {
		edge: 'finish',
		options,
		packageFilePath,
		datetime,
	});
}

// istanbul ignore next
if (require.main === module) {
	main(process.argv[2], process.argv[3], generateOptions(process.argv)).catch(error => {
		console.error(error);
		process.exit(1);
	});
}
