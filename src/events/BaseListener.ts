/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { DependencyMap, DependencyType, Options, VersionAction, VersionMap } from '../types';
import type { NPMRegistryError } from '../fetchPackageVersionDates';

const BaseEvents = {
	packageFilePath: '',
	datetime: new Date(),
	options: {} as Options,
	async initialize(packageFilePath: string, datetime: Date, options: Options): Promise<void> {
		this.packageFilePath = packageFilePath;
		this.datetime = datetime;
		this.options = options;
	},
	async clone() {
		const clone = { ...this, options: { ...this.options, listener: this } };
		clone.options.listener = clone;
		return clone;
	},
	async handleMissingArguments(): Promise<void> {},
	async handleInvalidDatetime(datetime: string): Promise<void> {},
	async handleDatetimeInFuture(datetime: Date): Promise<Date> {
		throw new Error('Not implemented');
	},
	async handleRunStart(): Promise<void> {},
	async handleRunFinish(): Promise<void> {},
	async handleReadingPackageFileStart(): Promise<void> {},
	async handleReadingPackageFileFinish(content: string): Promise<void> {},
	async handleDiscoveringDependencyMapStart(map: DependencyType): Promise<void> {},
	async handleDiscoveringDependencyMapFinish(
		map: DependencyType,
		dependencyMap?: DependencyMap | undefined,
	): Promise<void> {},
	async handleGettingPackageVersionDatesStart(packageName: string): Promise<void> {},
	async handleNPMRegistryError(packageName: string, error: NPMRegistryError): Promise<void> {},
	async handleGettingPackageVersionDatesFinish(
		packageName: string,
		cacheDate: Date,
		versions: VersionMap,
	): Promise<void> {},
	async handleCalculatedHighestVersion(
		packageName: string,
		version: string,
		highestVersion: string | null,
	): Promise<void> {},
	async handlePromptUserForVersionAction(packageName: string, actions: VersionAction[]): Promise<string> {
		throw new Error('Not implemented');
	},
	async handleDependencyProcessed(packageName: string, version: { old: string; new: string }): Promise<void> {},
	async handleDependencyMapProcessed(map: DependencyType, updates: DependencyMap): Promise<void> {},
	async handleChangesMade(changesMade: boolean): Promise<void> {},
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
