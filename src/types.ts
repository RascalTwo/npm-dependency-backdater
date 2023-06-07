import type { BaseEventsListener } from './events/BaseListener';
import type { DEPENDENCY_TYPES } from './constants';

export interface Options {
	stripPrefixes?: boolean;
	interactive?: boolean;
	allowPreRelease?: boolean;
	dryRun?: boolean;
	preloadDependencies?: boolean;
	noCache?: boolean;
	lock?: {
		major?: boolean;
		minor?: boolean;
	};
	listener: BaseEventsListener;
}

export interface DependencyMap {
	[packageName: string]: string;
}

export interface VersionMap {
	[version: string]: string;
}

export interface ParsedVersion {
	raw: string;
	prefix: string | null;
	version: string;
	major: number;
	minor: number;
}

export type DependencyType = (typeof DEPENDENCY_TYPES)[number];

export type VersionAction = [string, string];
