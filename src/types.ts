import type { Listener } from './events/BaseListener';

export type LoggingFunction = (message: string) => void;

export interface Options {
	stripPrefixes?: boolean;
	interactive?: boolean;
	allowPreRelease?: boolean;
	dryRun?: boolean;
	listener: Listener;
}

export interface DependencyMap {
	[packageName: string]: string;
}

export interface VersionMap {
	[version: string]: string;
}

export type VersionAction = [string, string];
