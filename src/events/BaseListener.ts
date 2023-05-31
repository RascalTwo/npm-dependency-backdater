/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { DependencyMap, Options, VersionAction, VersionMap } from '../types';

const OptionalEvents = {
	handleMissingArguments(): void {},
	handleInvalidDatetime(datetime: string): void {},
	handleRunStart(options: Options, packageFilePath: string, datetime: Date): void {},
	handleRunFinish(options: Options, packageFilePath: string, datetime: Date): void {},
	handleReadingPackageFileStart(packageFilePath: string): void {},
	handleReadingPackageFileFinish(packageFilePath: string, content: string): void {},
	handleDiscoveringDependencyMapStart(map: 'dependencies' | 'devDependencies'): void {},
	handleDiscoveringDependencyMapFinish(
		map: 'dependencies' | 'devDependencies',
		dependencyMap?: DependencyMap | undefined,
	): void {},
	handleGettingPackageVersionDatesStart(packageName: string): void {},
	handleGettingPackageVersionDatesFinish(
		packageName: string,
		datetime: Date,
		cacheDate: Date,
		versions: VersionMap,
	): void {},
	handleCalculatedHighestVersion(
		packageName: string,
		version: string,
		highestVersion: string | null,
		allowPreRelease: boolean,
	): void {},
	handleDependencyProcessed(packageName: string, version: { old: string; new: string }): void {},
	handleDependencyMapProcessed(map: 'dependencies' | 'devDependencies', updates: DependencyMap): void {},
	handleChangesMade(changesMade: boolean): void {},
};

export type OptionalEventsListener = typeof OptionalEvents;

export interface RequiredEventsListener {
	handleDatetimeInFuture(datetime: Date): Date;
	handlePromptUserForVersionAction(options: Options, packageName: string, actions: VersionAction[]): Promise<string>;
	handleMakeChanges(packageFilePath: string, packageJson: { old: object; new: object }, dryRun: boolean): Promise<void>;
}

export type AllEventsListener = RequiredEventsListener & OptionalEventsListener;

export default OptionalEvents;
