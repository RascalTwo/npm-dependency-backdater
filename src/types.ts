export type LoggingFunction = (message: string) => void;

export interface Options {
	stripPrefixes?: boolean;
	log?: LoggingFunction;
}
