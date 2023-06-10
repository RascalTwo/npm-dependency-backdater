import CLIListener, { CLIListenerHandlers } from './CLIListener';
import type { DependencyMap, DependencyType, Options, VersionAction, VersionMap } from '../types';
import BaseListener from './BaseListener';
import type { NPMRegistryError } from '../fetchPackageVersionDates';
import padStringCenter from '../utils/padStringCenter';

export default {
	...BaseListener,

	counts: {
		processed: 0,
		updated: 0,
		packages: 0,
	},

	current: {
		dependencyType: null as DependencyType | null,
		packageName: null as string | null,
	},

	dependencyMaps: {} as Partial<Record<DependencyType, DependencyMap>>,

	messages: [] as string[],

	async initialize(packageFilePath: string, datetime: Date, options: Options) {
		this.packageFilePath = packageFilePath;
		this.datetime = datetime;
		this.options = options;

		if (!options.preloadDependencies) {
			options.preloadDependencies = true;
		}

		this.log = this.log.bind(this);

		return this;
	},
	async clone() {
		const clone = {
			...this,
			options: { ...this.options, listener: this },
			counts: { ...this.counts },
			current: { ...this.current },
			messages: [...this.messages],
		};
		clone.options.listener = clone;
		return clone;
	},
	async render() {
		const width = process.stdout.columns - 4;
		const height = process.stdout.rows - 4;
		console.clear();

		const lines = [];
		const processedRatio = this.counts.processed / this.counts.packages || 0;
		const updatedRatio = this.counts.updated / this.counts.packages || 0;
		lines.push('┌' + '─'.repeat(width - 2) + '┐');
		const processedText = `${this.counts.processed.toString().padStart(2, '0')} / ${this.counts.packages
			.toString()
			.padStart(2, '0')} (${(processedRatio * 100).toFixed(2).padStart(6, ' ')}%) Processed`;
		const updatedText = `${this.counts.updated.toString().padStart(2, '0')} / ${this.counts.packages
			.toString()
			.padStart(2, '0')} (${(updatedRatio * 100).toFixed(2).padStart(6, ' ')}%) Updated`;
		lines.push(
			'│ ' +
				processedText +
				' '.repeat(Math.max(0, width - processedText.length - updatedText.length - 4)) +
				updatedText +
				' │',
		);

		const barLength = Math.floor(width * 0.4);

		const processedFilledLength = Math.floor(barLength * processedRatio);
		const processedUnfilledLength = barLength - processedFilledLength;

		const updatedFilledLength = Math.floor(barLength * updatedRatio);
		const updatedUnfilledLength = barLength - updatedFilledLength;

		const barlessLength = width - barLength * 2 - 2;

		lines.push(
			'├' +
				'█'.repeat(Math.max(0, processedFilledLength)) +
				'▒'.repeat(Math.max(0, processedUnfilledLength)) +
				'─'.repeat(Math.max(0, barlessLength)) +
				'█'.repeat(Math.max(0, updatedFilledLength)) +
				'▒'.repeat(Math.max(0, updatedUnfilledLength)) +
				'┤',
		);

		let breadCrumbs = '│ ' + this.packageFilePath + ' @ ' + this.datetime.toISOString().split('T')[0];
		if (this.current.dependencyType) {
			breadCrumbs += ' > ' + padStringCenter(this.current.dependencyType, 'optionalDependencies'.length);
			if (this.current.packageName) {
				breadCrumbs += ' > ' + padStringCenter(this.current.packageName, width - breadCrumbs.length - 2 - 3);
			}
		}

		lines.push(breadCrumbs.padEnd(width - 2, ' ') + ' │');

		lines.push('├' + '─'.repeat(width - 2) + '┤');

		const availableLines = height - lines.length - 1;
		const showingMessages = this.messages.slice(-availableLines);
		lines.push(...showingMessages.map(message => '│ ' + message.padEnd(width - 4, ' ') + ' │'));
		while (lines.length < height - 1) lines.push('│' + ' '.repeat(width - 2) + '│');

		lines.push('╰' + '─'.repeat(width - 2) + '╯');

		console.log(lines.join('\n'));
	},

	log(message: string) {
		const messages = message.match(new RegExp(`.{1,${process.stdout.columns - 8}}`, 'g')) as RegExpMatchArray;
		this.messages.push(...messages.map(match => match.trim()));
		this.render();
	},

	async handleMissingArguments() {
		return CLIListenerHandlers.handleMissingArguments.call(this, this.log.bind(this));
	},

	async handleInvalidDatetime(datetimeArg: string) {
		return CLIListenerHandlers.handleInvalidDatetime.call(this, this.log.bind(this), datetimeArg);
	},

	async handleDatetimeInFuture(datetime: Date) {
		return CLIListenerHandlers.handleDatetimeInFuture.call(this, this.log.bind(this), datetime);
	},

	async handleRunStart() {
		return CLIListenerHandlers.handleRunStart.call(this, this.log);
	},

	async handleReadingPackageFileStart() {
		return CLIListenerHandlers.handleReadingPackageFileStart.call(this, this.log);
	},

	async handleReadingPackageFileFinish(content: string) {
		return CLIListenerHandlers.handleReadingPackageFileFinish.call(this, this.log, content);
	},

	async handleDiscoveringDependencyMapStart(map: DependencyType) {
		this.current.dependencyType = map;
		return CLIListenerHandlers.handleDiscoveringDependencyMapStart.call(this, this.log, map);
	},

	async handleDiscoveringDependencyMapFinish(map: DependencyType, dependencyMap?: DependencyMap) {
		this.counts.packages += Object.keys(dependencyMap ?? {}).length;
		this.dependencyMaps[map] = dependencyMap ?? {};
		return CLIListenerHandlers.handleDiscoveringDependencyMapFinish.call(this, this.log, map, dependencyMap);
	},

	async handleGettingPackageVersionDatesStart(packageName: string) {
		for (const dependencyType of Object.keys(this.dependencyMaps)) {
			if (packageName in (this.dependencyMaps[dependencyType as DependencyType] as DependencyMap)) {
				this.current.dependencyType = dependencyType as DependencyType;
				break;
			}
		}

		this.current.packageName = packageName;
		return CLIListenerHandlers.handleGettingPackageVersionDatesStart.call(this, this.log, packageName);
	},

	async handleNPMRegistryError(packageName: string, error: NPMRegistryError) {
		return CLIListenerHandlers.handleNPMRegistryError.call(this, this.log, packageName, error);
	},

	async handleGettingPackageVersionDatesFinish(packageName: string, cacheDate: Date, versions: VersionMap) {
		return CLIListenerHandlers.handleGettingPackageVersionDatesFinish.call(
			this,
			this.log,
			packageName,
			cacheDate,
			versions,
		);
	},

	async handleCalculatedHighestVersion(packageName: string, version: string, highestVersion: string | null) {
		return CLIListenerHandlers.handleCalculatedHighestVersion.call(
			this,
			this.log,
			packageName,
			version,
			highestVersion,
		);
	},

	async handlePromptUserForVersionAction(packageName: string, actions: VersionAction[]): Promise<string> {
		return CLIListenerHandlers.handlePromptUserForVersionAction.call(this, this.log, packageName, actions);
	},

	async handleDependencyProcessed(packageName: string, version: { old: string; new: string }) {
		this.counts.processed++;
		if (version.old !== version.new) {
			this.counts.updated++;
		}
		return CLIListenerHandlers.handleDependencyProcessed.call(this, this.log, packageName, version);
	},

	async handleDependencyMapProcessed(map: DependencyType, updates: DependencyMap) {
		this.current.packageName = null;
		return CLIListenerHandlers.handleDependencyMapProcessed.call(this, this.log, map, updates);
	},

	async handleChangesMade(changesMade: boolean) {
		this.current.dependencyType = null;
		return CLIListenerHandlers.handleChangesMade.call(this, this.log, changesMade);
	},

	handleMakeChanges: CLIListener.handleMakeChanges,
};
