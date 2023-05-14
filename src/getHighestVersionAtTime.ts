const SEMVER_PATTERN = {
	STRICT: /^\d+\.\d+\.\d+$/,
	LOOSE: /^\d+\.\d+\.\d+[^-\s]*$/,
};

export default function getHighestVersionAtTime(
	versions: Record<string, string>,
	datetime: Date,
	strict: boolean,
): string | null {
	const semverPattern = strict ? SEMVER_PATTERN.STRICT : SEMVER_PATTERN.LOOSE;

	let highestVersion: string | null = null;

	for (const version in versions) {
		const releaseDate = new Date(versions[version]);

		if (semverPattern.test(version) && releaseDate <= datetime) {
			if (highestVersion === null || version > highestVersion) {
				highestVersion = version;
			}
		}
	}

	return highestVersion;
}
