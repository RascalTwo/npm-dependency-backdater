import fs from 'fs';
import path from 'path';

export const DEPENDENCY_TYPES = [
	'dependencies',
	'devDependencies',
	'peerDependencies',
	'optionalDependencies',
] as const;

export const SUPPORTED_VERSION_PREFIXES = ['>=', '<=', '>', '<', '~', '^'];
export const PACKAGE_NAME =
	process.env.npm_package_name || JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')).name;
