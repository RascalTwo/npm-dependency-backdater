import type { NPMRegistryErrorResponse, NPMRegistryResponse } from './types';
import fetch from 'node-fetch';

export class NPMRegistryError extends Error {
	public static NPM_REGISTRY_NOT_FOUND_ERROR = 'Not found';

	constructor(message: string, public response: NPMRegistryErrorResponse) {
		super(message);
	}

	isNotFound() {
		return this.response.error === NPMRegistryError.NPM_REGISTRY_NOT_FOUND_ERROR;
	}

	isUnknown() {
		return !this.isNotFound();
	}
}

export default async function fetchPackageVersionDates(packageName: string) {
	const response = await fetch(`https://registry.npmjs.org/${packageName}`);
	const data = (await response.json()) as NPMRegistryResponse;

	if ('error' in data) {
		throw new NPMRegistryError(
			data.error === NPMRegistryError.NPM_REGISTRY_NOT_FOUND_ERROR
				? `Package "${packageName}" not found`
				: `NPM Registry Error for "${packageName}": ${data.error}\n${JSON.stringify(data, undefined, 2)}`,
			data as NPMRegistryErrorResponse,
		);
	}

	return data.time;
}
