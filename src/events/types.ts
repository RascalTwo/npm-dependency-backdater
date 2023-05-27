import type { DependencyMap, Options, VersionAction, VersionMap } from '../types';

export interface Events {
	missing_arguments: {
		payload: void;
		return: void;
	};
	invalid_datetime: {
		payload: string;
		return: void;
	};
	datetime_in_future: {
		payload: Date;
		return: Date;
	};
	run: {
		payload: {
			edge: 'start' | 'finish';
			options: Options;
			packageFilePath: string;
			datetime: Date;
		};
		return: void;
	};
	reading_package_file: {
		payload: {
			packageFilePath: string;
		} & (
			| {
					edge: 'start';
			  }
			| {
					edge: 'finish';
					content: string;
			  }
		);
		return: void;
	};
	discovering_dependency_map: {
		payload: {
			map: 'dependencies' | 'devDependencies';
		} & (
			| {
					edge: 'start';
			  }
			| {
					edge: 'finish';
					dependencyMap?: DependencyMap;
			  }
		);
		return: void;
	};
	getting_package_version_dates: {
		payload: {
			packageName: string;
			version: {
				raw: string;
				prefix: string | null;
				parsed: string;
			};
			datetime: Date;
		} & (
			| {
					edge: 'start';
			  }
			| {
					edge: 'finish';
					cacheDate: Date;
					versions: VersionMap;
			  }
		);
		return: void;
	};
	calculated_highest_version: {
		payload: {
			packageName: string;
			version: string;
			highestVersion: string | null;
			allowPreRelease: boolean;
		};
		return: void;
	};
	prompt_user_for_version_action: {
		payload: {
			options: Options;
			packageName: string;
			actions: VersionAction[];
		};
		return: Promise<string>;
	};
	dependency_processed: {
		payload: {
			packageName: string;
			version: {
				old: string;
				new: string;
			};
		};
		return: void;
	};
	dependency_map_processed: {
		payload: {
			map: 'dependencies' | 'devDependencies';
			updates: DependencyMap;
		};
		return: void;
	};
	changes_made: {
		payload: boolean;
		return: void;
	};
	make_changes: {
		payload: {
			packageFilePath: string;
			packageJson: {
				old: object;
				new: object;
			};
			dryRun: boolean;
		};
		return: Promise<void>;
	};
}

export const EVENT_NAMES: Array<keyof Events> = [
	'missing_arguments',
	'invalid_datetime',
	'datetime_in_future',
	'run',
	'reading_package_file',
	'discovering_dependency_map',
	'getting_package_version_dates',
	'calculated_highest_version',
	'prompt_user_for_version_action',
	'dependency_processed',
	'dependency_map_processed',
	'changes_made',
	'make_changes',
];
