import type { AllEventsListener } from './events/BaseListener';

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

export type VersionAction = [string, string];
