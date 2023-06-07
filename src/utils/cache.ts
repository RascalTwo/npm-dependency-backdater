import { PACKAGE_NAME } from '../constants';

import fs from 'fs';
import os from 'os';
import path from 'path';

const generateCachePath = () => path.join(os.tmpdir(), PACKAGE_NAME, 'cache.json');

export async function loadCache<T extends object>() {
	const cachePath = generateCachePath();
	if (!fs.existsSync(cachePath)) return {} as T;

	return fs.promises.readFile(cachePath, 'utf8').then(JSON.parse);
}

export async function saveCache<T>(cache: T) {
	const cachePath = generateCachePath();
	await fs.promises.mkdir(path.dirname(cachePath), { recursive: true });

	return fs.promises.writeFile(cachePath, JSON.stringify(cache, undefined, 2));
}
