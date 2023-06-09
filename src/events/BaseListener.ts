/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { DependencyMap, DependencyType, Options, VersionAction, VersionMap } from '../types';
import type { NPMRegistryError } from '../fetchPackageVersionDates';

const BaseEvents = {
	packageFilePath: '',
	datetime: new Date(),
	options: {} as Options,
	async initialize(packageFilePath: string, datetime: Date, options: Options) {
		this.packageFilePath = packageFilePath;
		this.datetime = datetime;
		this.options = options;

		return this;
	},
	async clone() {
		const clone = { ...this, options: { ...this.options, listener: this } };
		clone.options.listener = clone;
		return clone;
	},
	async delay() {
		if (this.options.delay) await new Promise(resolve => setTimeout(resolve, this.options.delay));
	},
	async handleMissingArguments(): Promise<void> {
		await this.delay();
	},
	async handleInvalidDatetime(datetime: string): Promise<void> {
		await this.delay();
	},
	async handleDatetimeInFuture(datetime: Date): Promise<Date> {
		throw new Error('Not implemented');
	},
	async handleRunStart(): Promise<void> {
		await this.delay();
	},
	async handleRunFinish(): Promise<void> {
		await this.delay();
	},
	async handleReadingPackageFileStart(): Promise<void> {
		await this.delay();
	},
	async handleReadingPackageFileFinish(content: string): Promise<void> {
		await this.delay();
	},
	async handleDiscoveringDependencyMapStart(map: DependencyType): Promise<void> {
		await this.delay();
	},
	async handleDiscoveringDependencyMapFinish(
		map: DependencyType,
		dependencyMap?: DependencyMap | undefined,
	): Promise<void> {
		await this.delay();
	},
	async handleGettingPackageVersionDatesStart(packageName: string): Promise<void> {
		await this.delay();
	},
	async handleNPMRegistryError(packageName: string, error: NPMRegistryError): Promise<void> {
		await this.delay();
	},
	async handleGettingPackageVersionDatesFinish(
		packageName: string,
		cacheDate: Date,
		versions: VersionMap,
	): Promise<void> {
		await this.delay();
	},
	async handleCalculatedHighestVersion(
		packageName: string,
		version: string,
		highestVersion: string | null,
	): Promise<void> {
		await this.delay();
	},
	async handlePromptUserForVersionAction(packageName: string, actions: VersionAction[]): Promise<string> {
		throw new Error('Not implemented');
	},
	async handleDependencyProcessed(packageName: string, version: { old: string; new: string }): Promise<void> {
		await this.delay();
	},
	async handleDependencyMapProcessed(map: DependencyType, updates: DependencyMap): Promise<void> {
		await this.delay();
	},
	async handleChangesMade(changesMade: boolean): Promise<void> {
		await this.delay();
	},
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
	'delay' | 'handlePromptUserForVersionAction' | 'handleDatetimeInFuture' | 'handleMakeChanges'
>[];

export default BaseEvents;
