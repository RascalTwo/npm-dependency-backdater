import type { DependencyMap, DependencyType, VersionAction, VersionMap } from '../types';
import BaseListener from './BaseListener';
import { SUPPORTED_VERSION_PREFIXES } from '../constants';
import { handleMakeChanges } from './commonHandlers';
import pluralizeNoun from '../utils/pluralizeNoun';
import promptUserForVersionAction from '../utils/promptUserForVersionAction';

export const CLIListenerHandlers = {
	...BaseListener,

	handleMissingArguments(output: (message: string) => void) {
		output(`Usage: npm-dependency-backdater <package.json location> <datetime> [--silent] [--tui] [--strip-prefixes] [--interactive] [--allow-pre-release] [--dry-run] [--preload-dependencies] [--no-cache]

package.json location: The location of the package.json file to update
datetime: The datetime to update the package versions to (YYYY-MM-DDTHH:mm:ssZ)

--silent: Whether to suppress logging
--tui: Whether to use a text-based user interface (TUI) instead of the command line
--strip-prefixes: Whether to strip the (${SUPPORTED_VERSION_PREFIXES.join(', ')}) prefixes from the updated versions
--interactive: Whether to prompt the user before updating each package version
--allow-pre-release: Whether to allow the latest version to be a pre-release version (e.g. 1.0.0-alpha.1)
--dry-run: Whether to log the changes that would be made without actually making them
--preload-dependencies: Whether to preload all package names before updating them
--no-cache: Whether to ignore the cache when getting package version dates
		`);
	},

	handleInvalidDatetime(output: (message: string) => void, datetimeArg: string) {
		output(`Expected a valid datetime (YYYY-MM-DDTHH:mm:ssZ) but received "${datetimeArg}".`);
	},

	handleDatetimeInFuture(output: (message: string) => void, datetime: Date) {
		output(
			`Warning: The provided datetime - ${datetime.toISOString()} - is in the future. Using the current datetime instead.`,
		);
		return new Date();
	},

	handleRunStart(output: (message: string) => void) {
		output(
			`Attempting to update package versions in "${
				this.packageFilePath
			}" to their latest versions as of ${this.datetime.toISOString()}...`,
		);
	},

	handleReadingPackageFileStart(output: (message: string) => void) {
		output(`Reading package file "${this.packageFilePath}"...`);
	},

	handleReadingPackageFileFinish(output: (message: string) => void, content: string) {
		output(`${content.length} ${pluralizeNoun('byte', content.length)} of "${this.packageFilePath}" read.`);
	},

	handleDiscoveringDependencyMapStart(output: (message: string) => void, map: DependencyType) {
		output(`Discovering "${map}" dependencies...`);
	},

	handleDiscoveringDependencyMapFinish(
		output: (message: string) => void,
		map: DependencyType,
		dependencyMap: DependencyMap = {},
	): void {
		const count = Object.keys(dependencyMap).length;

		if (!count) {
			return output(`No "${map}" dependencies found.`);
		}

		output(`${count} "${map}" ${pluralizeNoun('dependency', count)} found.`);
	},

	handleGettingPackageVersionDatesStart(output: (message: string) => void, packageName: string): void {
		output(`Getting version dates for "${packageName}"...`);
	},

	handleGettingPackageVersionDatesFinish(
		output: (message: string) => void,
		packageName: string,
		cacheDate: Date,
		versions: VersionMap,
	): void {
		const versionCount = Object.keys(versions).length;
		output(
			`Found ${versionCount} ${pluralizeNoun('version', versionCount)} for "${packageName}".${
				this.datetime !== cacheDate ? ` (cached from ${cacheDate.toISOString()})` : ''
			}`,
		);
	},

	handleCalculatedHighestVersion(
		output: (message: string) => void,
		packageName: string,
		version: string,
		highestVersion: string | null,
	): void {
		if (!highestVersion) {
			return output('No versions available.');
		}

		output(
			`Highest version of "${packageName}" available is "${highestVersion}".${
				this.options.allowPreRelease ? ' (including pre-releases)' : ''
			}`,
		);
		if (highestVersion === version) {
			return output(`"${packageName}" is already "${highestVersion}".`);
		}
	},

	async handlePromptUserForVersionAction(
		output: (message: string) => void,
		packageName: string,
		actions: VersionAction[],
	): Promise<string> {
		if (!this.options.interactive) {
			return actions[1][1];
		}
		return promptUserForVersionAction(packageName, actions, output);
	},

	handleDependencyProcessed(
		output: (message: string) => void,
		packageName: string,
		version: { old: string; new: string },
	): void {
		if (version.old !== version.new) {
			output(`Updated "${packageName}" from "${version.old}" to "${version.new}".`);
		} else {
			output(`Left "${packageName}" as "${version.old}".`);
		}
	},

	handleDependencyMapProcessed(output: (message: string) => void, map: DependencyType, updates: DependencyMap): void {
		const updateCount = Object.keys(updates).length;
		if (!updateCount) {
			output(`No changes made to "${map}".`);
		} else {
			output(`Updated ${updateCount} "${map}" ${pluralizeNoun('dependency', updateCount)}.`);
		}
	},

	handleChangesMade(output: (message: string) => void, changesMade: boolean): void {
		if (!changesMade) {
			return output('No changes made.');
		}
	},
};

export default {
	...BaseListener,

	handleMissingArguments() {
		return CLIListenerHandlers.handleMissingArguments.call(this, console.error);
	},

	handleInvalidDatetime(datetimeArg: string) {
		return CLIListenerHandlers.handleInvalidDatetime.call(this, console.error, datetimeArg);
	},

	handleDatetimeInFuture(datetime: Date) {
		return CLIListenerHandlers.handleDatetimeInFuture.call(this, console.warn, datetime);
	},

	handleRunStart() {
		return CLIListenerHandlers.handleRunStart.call(this, console.log);
	},

	handleReadingPackageFileStart() {
		return CLIListenerHandlers.handleReadingPackageFileStart.call(this, console.log);
	},

	handleReadingPackageFileFinish(content: string) {
		return CLIListenerHandlers.handleReadingPackageFileFinish.call(this, console.log, content);
	},

	handleDiscoveringDependencyMapStart(map: DependencyType) {
		return CLIListenerHandlers.handleDiscoveringDependencyMapStart.call(this, console.log, map);
	},

	handleDiscoveringDependencyMapFinish(map: DependencyType, dependencyMap?: DependencyMap) {
		return CLIListenerHandlers.handleDiscoveringDependencyMapFinish.call(this, console.log, map, dependencyMap);
	},

	handleGettingPackageVersionDatesStart(packageName: string) {
		return CLIListenerHandlers.handleGettingPackageVersionDatesStart.call(this, console.log, packageName);
	},

	handleGettingPackageVersionDatesFinish(packageName: string, cacheDate: Date, versions: VersionMap): void {
		return CLIListenerHandlers.handleGettingPackageVersionDatesFinish.call(
			this,
			console.log,
			packageName,
			cacheDate,
			versions,
		);
	},

	handleCalculatedHighestVersion(packageName: string, version: string, highestVersion: string | null): void {
		return CLIListenerHandlers.handleCalculatedHighestVersion.call(
			this,
			console.log,
			packageName,
			version,
			highestVersion,
		);
	},

	async handlePromptUserForVersionAction(packageName: string, actions: VersionAction[]): Promise<string> {
		return CLIListenerHandlers.handlePromptUserForVersionAction.call(this, console.log, packageName, actions);
	},

	handleDependencyProcessed(packageName: string, version: { old: string; new: string }): void {
		return CLIListenerHandlers.handleDependencyProcessed.call(this, console.log, packageName, version);
	},

	handleDependencyMapProcessed(map: DependencyType, updates: DependencyMap): void {
		return CLIListenerHandlers.handleDependencyMapProcessed.call(this, console.log, map, updates);
	},

	handleChangesMade(changesMade: boolean): void {
		return CLIListenerHandlers.handleChangesMade.call(this, console.log, changesMade);
	},

	handleMakeChanges(oldPackageJson: object, newPackageJson: object) {
		return handleMakeChanges.call(
			this,
			console.log,
			this.packageFilePath,
			{ old: oldPackageJson, new: newPackageJson },
			!!this.options.dryRun,
		);
	},
};
