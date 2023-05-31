import type { DependencyMap, Options, VersionAction, VersionMap } from '../types';
import type { AllEventsListener } from './BaseListener';
import BaseListener from './BaseListener';
import { SUPPORTED_PREFIXES } from '../parseRawVersion';
import { handleMakeChanges } from './commonHandlers';
import promptUserForVersionAction from '../promptUserForVersionAction';

export default {
	...BaseListener,

	handleMissingArguments() {
		console.error(`Usage: npm-dependency-backdater <package.json location> <datetime> [--silent] [--strip-prefixes] [--interactive] [--allow-pre-release] [--dry-run]

package.json location: The location of the package.json file to update
datetime: The datetime to update the package versions to (YYYY-MM-DDTHH:mm:ssZ)

--silent: Whether to suppress logging
--strip-prefixes: Whether to strip the (${SUPPORTED_PREFIXES.join(', ')}) prefixes from the updated versions
--interactive: Whether to prompt the user before updating each package version
--allow-pre-release: Whether to allow the latest version to be a pre-release version (e.g. 1.0.0-alpha.1)
--dry-run: Whether to log the changes that would be made without actually making them
		`);
	},

	handleInvalidDatetime(datetimeArg: string) {
		console.error(`Expected a valid datetime (YYYY-MM-DDTHH:mm:ssZ) but received "${datetimeArg}"`);
	},

	handleDatetimeInFuture(datetime: Date) {
		console.warn(
			`Warning: The provided datetime (${datetime.toISOString()}) is in the future. Using the current datetime instead.`,
		);
		return new Date();
	},

	handleRunStart(options: Options, packageFilePath: string, datetime: Date) {
		console.log(
			`Attempting to update package versions in ${packageFilePath} to their latest versions as of ${datetime.toISOString()}...`,
		);
	},

	handleReadingPackageFileStart(packageFilePath: string) {
		console.log(`Reading package file ${packageFilePath}...`);
	},

	handleReadingPackageFileFinish(packageFilePath: string, content: string) {
		console.log(`${content.length} bytes of ${packageFilePath} read.`);
	},

	handleDiscoveringDependencyMapStart(map: 'dependencies' | 'devDependencies') {
		console.log(`Discovering "${map}" dependencies...`);
	},

	handleDiscoveringDependencyMapFinish(
		map: 'dependencies' | 'devDependencies',
		dependencyMap: DependencyMap = {},
	): void {
		const count = Object.keys(dependencyMap).length;

		if (!count) {
			return console.log(`No "${map}" dependencies found.`);
		}

		const word = count === 1 ? 'dependency' : 'dependencies';
		console.log(`${count} "${map}" ${word} found.`);
	},

	handleGettingPackageVersionDatesStart(packageName: string): void {
		console.log(`Getting version dates for "${packageName}"...`);
	},

	handleGettingPackageVersionDatesFinish(
		packageName: string,
		datetime: Date,
		cacheDate: Date,
		versions: VersionMap,
	): void {
		const versionCount = Object.keys(versions).length;
		console.log(
			`Found ${versionCount} version${versionCount === 1 ? '' : 's'} for ${packageName}${
				datetime === cacheDate ? ` (cached from ${cacheDate.toLocaleDateString()})` : ''
			}.`,
		);
	},

	handleCalculatedHighestVersion(
		packageName: string,
		version: string,
		highestVersion: string | null,
		allowPreRelease: boolean,
	): void {
		if (!highestVersion) {
			return console.log('No versions available.');
		}

		console.log(
			`Highest version of ${packageName} available is ${highestVersion}${
				allowPreRelease ? ' (including pre-releases)' : ''
			}.`,
		);
		if (highestVersion === version) {
			return console.log(`${packageName} is already ${highestVersion}.`);
		}
	},

	async handlePromptUserForVersionAction(
		options: Options,
		packageName: string,
		actions: VersionAction[],
	): Promise<string> {
		if (!options.interactive) {
			return actions[1][1];
		}
		return promptUserForVersionAction(packageName, actions, console.log);
	},

	handleDependencyProcessed(packageName: string, version: { old: string; new: string }): void {
		if (version.old !== version.new) {
			console.log(`Updated ${packageName} from ${version.old} to ${version.new}.`);
		} else {
			console.log(`Left ${packageName} as ${version.old}.`);
		}
	},

	handleDependencyMapProcessed(map: 'dependencies' | 'devDependencies', updates: DependencyMap): void {
		const updateCount = Object.keys(updates).length;
		if (!updateCount) {
			console.log(`No changes made to ${map}.`);
		} else {
			console.log(`Updated ${updateCount} ${map}.`);
		}
	},

	handleChangesMade(changesMade: boolean): void {
		if (!changesMade) {
			return console.log('No changes made.');
		}
	},

	handleMakeChanges: handleMakeChanges.bind(null, true),
} as AllEventsListener;
