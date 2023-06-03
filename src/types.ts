import type { AllEventsListener } from './events/BaseListener';
import type { DEPENDENCY_TYPES } from './constants';

export type LoggingFunction = (message: string) => void;

export interface Options {
	stripPrefixes?: boolean;
	interactive?: boolean;
	allowPreRelease?: boolean;
	dryRun?: boolean;
	listener: AllEventsListener;
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
}

export type DependencyType = (typeof DEPENDENCY_TYPES)[number];

export type VersionAction = [string, string];
