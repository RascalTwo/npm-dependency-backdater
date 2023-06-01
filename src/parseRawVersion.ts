import type { ParsedVersion } from './types';

export const SUPPORTED_PREFIXES = ['>=', '<=', '>', '<', '~', '^'];

export default function parseRawVersion(raw: string): ParsedVersion {
	const foundPrefix = SUPPORTED_PREFIXES.find(prefix => raw.startsWith(prefix));

	const prefix = foundPrefix ? raw.slice(0, foundPrefix.length) : null;
	const version = foundPrefix ? raw.slice(foundPrefix.length) : raw;

	return {
		raw,
		prefix,
		version,
	};
}
