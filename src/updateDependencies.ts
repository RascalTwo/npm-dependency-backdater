import getHighestVersionAtTime from './getHighestVersionAtTime';
import getPackageVersionDates from './getPackageVersionDates';

export default async function updateDependencies(dependencies: Record<string, string>, datetime: Date) {
	const updatedDependencies: Record<string, string> = {};

	for (const [dependency, version] of Object.entries(dependencies)) {
		const highestVersion = getHighestVersionAtTime(await getPackageVersionDates(dependency), datetime, true);

		updatedDependencies[dependency] = highestVersion || version;
	}

	return updatedDependencies;
}
