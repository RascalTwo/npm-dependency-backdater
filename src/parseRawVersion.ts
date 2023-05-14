export const SUPPORTED_PREFIXES = ['>=', '<=', '>', '<', '~', '^'];

export default function parseRawVersion(rawVersion: string) {
	const prefix = SUPPORTED_PREFIXES.find(prefix => rawVersion.startsWith(prefix));
	if (!prefix) return [null, rawVersion];

	return [prefix, rawVersion.slice(prefix.length)];
}
