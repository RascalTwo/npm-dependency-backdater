import type { ParsedVersion } from './types';
import { SUPPORTED_VERSION_PREFIXES } from './constants';

export default function parseRawVersion(raw: string): ParsedVersion {
	const foundPrefix = SUPPORTED_VERSION_PREFIXES.find(prefix => raw.startsWith(prefix));

	const prefix = foundPrefix ? raw.slice(0, foundPrefix.length) : null;
	const version = foundPrefix ? raw.slice(foundPrefix.length) : raw;

	const major = Number(version.split('.')[0].replace(/\D/g, ''));
	const minor = Number(version.split('.')[1].replace(/\D/g, ''));

	return {
		raw,
		prefix,
		version,
		major,
		minor,
	};
}
