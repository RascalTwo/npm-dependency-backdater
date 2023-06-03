/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { DependencyMap, DependencyType, Options, VersionAction, VersionMap } from '../types';

const BaseEvents = {
	packageFilePath: '',
	datetime: new Date(),
	options: {} as Options,
	initialize(packageFilePath: string, datetime: Date, options: Options): void {
		this.packageFilePath = packageFilePath;
		this.datetime = datetime;
		this.options = options;
	},
	handleMissingArguments(): void {},
	handleInvalidDatetime(datetime: string): void {},
	handleDatetimeInFuture(datetime: Date): Date {
		throw new Error('Not implemented');
	},
	handleRunStart(): void {},
	handleRunFinish(): void {},
	handleReadingPackageFileStart(): void {},
	handleReadingPackageFileFinish(content: string): void {},
	handleDiscoveringDependencyMapStart(map: DependencyType): void {},
	handleDiscoveringDependencyMapFinish(map: DependencyType, dependencyMap?: DependencyMap | undefined): void {},
	handleGettingPackageVersionDatesStart(packageName: string): void {},
	handleGettingPackageVersionDatesFinish(packageName: string, cacheDate: Date, versions: VersionMap): void {},
	handleCalculatedHighestVersion(packageName: string, version: string, highestVersion: string | null): void {},
	async handlePromptUserForVersionAction(packageName: string, actions: VersionAction[]): Promise<string> {
		throw new Error('Not implemented');
	},
	handleDependencyProcessed(packageName: string, version: { old: string; new: string }): void {},
	handleDependencyMapProcessed(map: DependencyType, updates: DependencyMap): void {},
	handleChangesMade(changesMade: boolean): void {},
	async handleMakeChanges(oldPackageJson: object, newPackageJson: object): Promise<void> {
		throw new Error('Not implemented');
	},
};

export type BaseEventsListener = typeof BaseEvents;

export type BaseEventsHandlers = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[K in keyof BaseEventsListener]: BaseEventsListener[K] extends (...args: any[]) => any ? K : never;
}[keyof BaseEventsListener];

export type UnresponsiveBaseEventsHandlers = Exclude<
	BaseEventsHandlers,
	'handlePromptUserForVersionAction' | 'handleDatetimeInFuture' | 'handleMakeChanges'
>[];

export default BaseEvents;
