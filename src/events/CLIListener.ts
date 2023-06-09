import type { DependencyMap, DependencyType, VersionAction, VersionMap } from '../types';
import BaseListener from './BaseListener';
import type { NPMRegistryError } from '../fetchPackageVersionDates';
import { SUPPORTED_VERSION_PREFIXES } from '../constants';
import { handleMakeChanges } from './commonHandlers';
import pluralizeNoun from '../utils/pluralizeNoun';
import promptUserForVersionAction from '../utils/promptUserForVersionAction';

export const CLIListenerHandlers = {
	...BaseListener,

	async handleMissingArguments(output: (message: string) => void) {
		await this.delay();
		output(`Usage: npm-dependency-backdater <package.json location> [<datetime>] [--silent] [--tui] [--strip-prefixes] [--interactive] [--allow-pre-release] [--dry-run] [--preload-dependencies] [--no-cache] [--lock-major] [--lock-minor] [--warnings-as-errors] [--delay[=milliseconds]]

package.json location: The location of the package.json file to update
datetime: The datetime to update the package versions to (YYYY-MM-DDTHH:mm:ssZ)
          Defaults to the current time if not provided

--silent: Whether to suppress logging
--tui: Whether to use a text-based user interface (TUI) instead of the command line
--strip-prefixes: Whether to strip the (${SUPPORTED_VERSION_PREFIXES.join(', ')}) prefixes from the updated versions
--interactive: Whether to prompt the user before updating each package version
--allow-pre-release: Whether to allow the latest version to be a pre-release version (e.g. 1.0.0-alpha.1)
--dry-run: Whether to log the changes that would be made without actually making them
--preload-dependencies: Whether to preload all package names before updating them
--no-cache: Whether to ignore the cache when getting package version dates
--lock-[major/minor]: Prevent updating the major/minor version of a package
--warnings-as-errors: Treat warnings as errors, exiting the program if any are encountered
--delay[=milliseconds]: Milliseconds to wait between events, defaults to 1000
		`);
	},

	async handleInvalidDatetime(output: (message: string) => void, datetimeArg: string) {
		await this.delay();
		output(`Expected a valid datetime (YYYY-MM-DDTHH:mm:ssZ) but received "${datetimeArg}".`);
	},

	async handleDatetimeInFuture(output: (message: string) => void, datetime: Date) {
		await this.delay();
		output(
			`Warning: The provided datetime - ${datetime.toISOString()} - is in the future. Using the current datetime instead.`,
		);
		return new Date();
	},

	async handleRunStart(output: (message: string) => void) {
		await this.delay();
		output(
			`Attempting to update package versions in "${
				this.packageFilePath
			}" to their latest versions as of ${this.datetime.toISOString()}...`,
		);
	},

	async handleReadingPackageFileStart(output: (message: string) => void) {
		await this.delay();
		output(`Reading package file "${this.packageFilePath}"...`);
	},

	async handleReadingPackageFileFinish(output: (message: string) => void, content: string) {
		await this.delay();
		output(`${content.length} ${pluralizeNoun('byte', content.length)} of "${this.packageFilePath}" read.`);
	},

	async handleDiscoveringDependencyMapStart(output: (message: string) => void, map: DependencyType) {
		await this.delay();
		output(`Discovering "${map}" dependencies...`);
	},

	async handleDiscoveringDependencyMapFinish(
		output: (message: string) => void,
		map: DependencyType,
		dependencyMap: DependencyMap = {},
	) {
		await this.delay();
		const count = Object.keys(dependencyMap).length;

		if (!count) {
			return output(`No "${map}" dependencies found.`);
		}

		output(`${count} "${map}" ${pluralizeNoun('dependency', count)} found.`);
	},

	async handleGettingPackageVersionDatesStart(output: (message: string) => void, packageName: string) {
		await this.delay();
		output(`Getting version dates for "${packageName}"...`);
	},

	async handleNPMRegistryError(output: (message: string) => void, packageName: string, error: NPMRegistryError) {
		await this.delay();
		output(error.message);
		if (this.options.warningsAsErrors) process.exit(1);
	},

	async handleGettingPackageVersionDatesFinish(
		output: (message: string) => void,
		packageName: string,
		cacheDate: Date,
		versions: VersionMap,
	) {
		await this.delay();
		const versionCount = Object.keys(versions).length;
		output(
			`Found ${versionCount} ${pluralizeNoun('version', versionCount)} for "${packageName}".${
				this.datetime !== cacheDate ? ` (cached from ${cacheDate.toISOString()})` : ''
			}`,
		);
	},

	async handleCalculatedHighestVersion(
		output: (message: string) => void,
		packageName: string,
		version: string,
		highestVersion: string | null,
	) {
		await this.delay();
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
		await this.delay();
		if (!this.options.interactive) {
			return actions[1][1];
		}
		return promptUserForVersionAction(packageName, actions, output);
	},

	async handleDependencyProcessed(
		output: (message: string) => void,
		packageName: string,
		version: { old: string; new: string },
	) {
		await this.delay();
		if (version.old !== version.new) {
			output(`Updated "${packageName}" from "${version.old}" to "${version.new}".`);
		} else {
			output(`Left "${packageName}" as "${version.old}".`);
		}
	},

	async handleDependencyMapProcessed(output: (message: string) => void, map: DependencyType, updates: DependencyMap) {
		await this.delay();
		const updateCount = Object.keys(updates).length;
		if (!updateCount) {
			output(`No changes made to "${map}".`);
		} else {
			output(`Updated ${updateCount} "${map}" ${pluralizeNoun('dependency', updateCount)}.`);
		}
	},

	async handleChangesMade(output: (message: string) => void, changesMade: boolean) {
		await this.delay();
		if (!changesMade) {
			return output('No changes made.');
		}
	},
};

export default {
	...BaseListener,

	async handleMissingArguments() {
		return CLIListenerHandlers.handleMissingArguments.call(this, console.error);
	},

	async handleInvalidDatetime(datetimeArg: string) {
		return CLIListenerHandlers.handleInvalidDatetime.call(this, console.error, datetimeArg);
	},

	async handleDatetimeInFuture(datetime: Date) {
		return CLIListenerHandlers.handleDatetimeInFuture.call(this, console.warn, datetime);
	},

	async handleRunStart() {
		return CLIListenerHandlers.handleRunStart.call(this, console.log);
	},

	async handleReadingPackageFileStart() {
		return CLIListenerHandlers.handleReadingPackageFileStart.call(this, console.log);
	},

	async handleReadingPackageFileFinish(content: string) {
		return CLIListenerHandlers.handleReadingPackageFileFinish.call(this, console.log, content);
	},

	async handleDiscoveringDependencyMapStart(map: DependencyType) {
		return CLIListenerHandlers.handleDiscoveringDependencyMapStart.call(this, console.log, map);
	},

	async handleDiscoveringDependencyMapFinish(map: DependencyType, dependencyMap?: DependencyMap) {
		return CLIListenerHandlers.handleDiscoveringDependencyMapFinish.call(this, console.log, map, dependencyMap);
	},

	async handleGettingPackageVersionDatesStart(packageName: string) {
		return CLIListenerHandlers.handleGettingPackageVersionDatesStart.call(this, console.log, packageName);
	},

	async handleNPMRegistryError(packageName: string, error: NPMRegistryError) {
		return CLIListenerHandlers.handleNPMRegistryError.call(
			this,
			this.options.warningsAsErrors ? console.error : console.warn,
			packageName,
			error,
		);
	},

	async handleGettingPackageVersionDatesFinish(packageName: string, cacheDate: Date, versions: VersionMap) {
		return CLIListenerHandlers.handleGettingPackageVersionDatesFinish.call(
			this,
			console.log,
			packageName,
			cacheDate,
			versions,
		);
	},

	async handleCalculatedHighestVersion(packageName: string, version: string, highestVersion: string | null) {
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

	async handleDependencyProcessed(packageName: string, version: { old: string; new: string }) {
		return CLIListenerHandlers.handleDependencyProcessed.call(this, console.log, packageName, version);
	},

	async handleDependencyMapProcessed(map: DependencyType, updates: DependencyMap) {
		return CLIListenerHandlers.handleDependencyMapProcessed.call(this, console.log, map, updates);
	},

	async handleChangesMade(changesMade: boolean) {
		return CLIListenerHandlers.handleChangesMade.call(this, console.log, changesMade);
	},

	async handleMakeChanges(oldPackageJson: object, newPackageJson: object) {
		await this.delay();
		return handleMakeChanges.call(
			this,
			console.log,
			this.packageFilePath,
			{ old: oldPackageJson, new: newPackageJson },
			!!this.options.dryRun,
		);
	},
};
