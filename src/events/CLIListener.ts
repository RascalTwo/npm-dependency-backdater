import BaseListener from './BaseListener';
import { SUPPORTED_PREFIXES } from '../parseRawVersion';
import chalk from 'chalk';
import { diff } from 'jest-diff';
import fs from 'fs';
import promptUserForVersionAction from '../promptUserForVersionAction';

export default new BaseListener()
	.handle('missing_arguments', () => {
		console.error(`Usage: npm-dependency-backdater <package.json location> <datetime> [--silent] [--strip-prefixes] [--interactive] [--allow-pre-release] [--dry-run]

package.json location: The location of the package.json file to update
datetime: The datetime to update the package versions to (YYYY-MM-DDTHH:mm:ssZ)

--silent: Whether to suppress logging
--strip-prefixes: Whether to strip the (${SUPPORTED_PREFIXES.join(', ')}) prefixes from the updated versions
--interactive: Whether to prompt the user before updating each package version
--allow-pre-release: Whether to allow the latest version to be a pre-release version (e.g. 1.0.0-alpha.1)
--dry-run: Whether to log the changes that would be made without actually making them
	`);
	})
	.handle('invalid_datetime', datetimeArg => {
		console.error(`Expected a valid datetime (YYYY-MM-DDTHH:mm:ssZ) but received "${datetimeArg}"`);
	})
	.handle('datetime_in_future', datetime => {
		console.warn(
			`Warning: The provided datetime (${datetime.toISOString()}) is in the future. Using the current datetime instead.`,
		);
		return new Date();
	})
	.handle('run', ({ edge, packageFilePath, datetime }) => {
		if (edge === 'start') {
			console.log(
				`Attempting to update package versions in ${packageFilePath} to their latest versions as of ${datetime.toISOString()}...`,
			);
		}
	})
	.handle('reading_package_file', ({ packageFilePath, ...payload }) => {
		if (payload.edge === 'start') {
			console.log(`Reading package file ${packageFilePath}...`);
		} else {
			console.log(`${payload.content.length} bytes of ${packageFilePath} read.`);
		}
	})
	.handle('discovering_dependency_map', ({ map, ...payload }) => {
		if (payload.edge === 'start') {
			return console.log(`Discovering ${map} dependencies...`);
		}

		if (!payload.dependencyMap) {
			return console.log(`No ${map} dependencies found.`);
		}

		const count = Object.keys(payload.dependencyMap).length;
		const word = count === 1 ? 'dependency' : 'dependencies';
		console.log(`${count} ${map} ${word} found.`);
	})
	.handle('getting_package_version_dates', ({ packageName, datetime, ...payload }) => {
		if (payload.edge === 'start') {
			return console.log(`Getting version dates for ${packageName}...`);
		}

		const versionCount = Object.keys(payload.versions).length;
		console.log(
			`Found ${versionCount} version${versionCount === 1 ? '' : 's'} for ${packageName}${
				datetime === payload.cacheDate ? ` (cached from ${payload.cacheDate.toLocaleDateString()})` : ''
			}.`,
		);
	})
	.handle('calculated_highest_version', ({ packageName, highestVersion, version }) => {
		if (!highestVersion) {
			return console.log('No versions available.');
		}

		console.log(`Highest version of ${packageName} available is ${highestVersion}.`);
		if (highestVersion === version) {
			return console.log(`${packageName} is already ${highestVersion}.`);
		}
	})
	.handle('prompt_user_for_version_action', async ({ options, packageName, actions }) => {
		if (!options.interactive) {
			return actions[1][1];
		}
		return promptUserForVersionAction(packageName, actions, console.log);
	})
	.handle('dependency_processed', ({ packageName, version }) => {
		if (version.old !== version.new) {
			console.log(`Updated ${packageName} from ${version.old} to ${version.new}.`);
		} else {
			console.log(`Left ${packageName} as ${version.old}.`);
		}
	})
	.handle('dependency_map_processed', ({ map, updates }) => {
		const updateCount = Object.keys(updates).length;
		if (updateCount) {
			console.log(`No changes made to ${map}.`);
		} else {
			console.log(`Updated ${updateCount} ${map}.`);
		}
	})
	.handle('changes_made', changesMade => {
		if (!changesMade) {
			return console.log('No changes made.');
		}
	})
	.handle('make_changes', async ({ packageFilePath, packageJson, dryRun }) => {
		if (dryRun)
			return console.log(
				diff(packageJson.old, packageJson.new, {
					aAnnotation: 'Old Version(s)',
					aColor: text => chalk.red(text),
					bAnnotation: 'New Version(s)',
					bColor: text => chalk.green(text),
				}),
			);

		console.log(`Writing changes to ${packageFilePath}...`);
		await fs.promises.writeFile(packageFilePath, JSON.stringify(packageJson.new, undefined, 2));
		console.log(`Changes written to ${packageFilePath}.`);
	});

