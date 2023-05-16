export type LoggingFunction = (message: string) => void;

export interface Options {
	stripPrefixes?: boolean;
	interactive?: boolean;
	allowPreRelease?: boolean;
	log?: LoggingFunction;
}
