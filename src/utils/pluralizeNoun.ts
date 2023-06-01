export const EXCEPTIONS: Record<string, string> = {
	dependency: 'dependencies',
};

export default function pluralizeNoun(noun: string, count: number): string {
	return count === 1 ? noun : EXCEPTIONS[noun] ?? `${noun}s`;
}
