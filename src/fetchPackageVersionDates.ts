import fetch from 'node-fetch';

export default async function fetchPackageVersionDates(packageName: string) {
	const response = await fetch(`https://registry.npmjs.org/${packageName}`);
	const data = (await response.json()) as Record<'time', Record<string, string>>;
	return data.time;
}
