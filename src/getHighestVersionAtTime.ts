import parseRawVersion from './parseRawVersion';

const SEMVER_PATTERN = {
	STRICT: /^\d+\.\d+\.\d+$/,
	LOOSE: /^\d+\.\d+\.\d+[^-\s]*$/,
};

export default function getHighestVersionAtTime(
	versions: Record<string, string>,
	datetime: Date,
	strict: boolean,
	lock?: {
		current: [number, number];
		major?: boolean;
		minor?: boolean;
	},
): string | null {
	const semverPattern = strict ? SEMVER_PATTERN.STRICT : SEMVER_PATTERN.LOOSE;

	let highestVersion: string | null = null;

	for (const version in versions) {
		const releaseDate = new Date(versions[version]);

		if (semverPattern.test(version) && releaseDate <= datetime) {
			if (highestVersion === null || version > highestVersion) {
				if (lock) {
					const { major, minor } = parseRawVersion(version);
					const majorChanged = major !== lock.current[0];
					const minorChanged = minor !== lock.current[1];

					if (lock.major && majorChanged) continue;
					if (lock.minor && (majorChanged || minorChanged)) continue;
				}

				highestVersion = version;
			}
		}
	}

	return highestVersion;
}
