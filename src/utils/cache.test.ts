import { loadCache, saveCache } from './cache';

import fs from 'fs';
import os from 'os';

jest.mock('fs', () => ({
	existsSync: jest.fn(),
	promises: {
		mkdir: jest.fn(),
		readFile: jest.fn(),
		writeFile: jest.fn(),
	},
}));
jest.mock('os');

const cache = { foo: 'bar' };

beforeEach(() => jest.spyOn(os, 'tmpdir').mockReturnValue('/tmp'));

describe('loadCache', () => {
	test("empty object is returned if it doesn't exist", async () => {
		jest.spyOn(fs, 'existsSync').mockReturnValue(false);

		const result = await loadCache();

		expect(os.tmpdir).toHaveBeenCalled();
		expect(fs.promises.readFile).not.toHaveBeenCalled();
		expect(result).toEqual({});
	});

	test('parsed JSON is returned', async () => {
		jest.spyOn(fs, 'existsSync').mockReturnValue(true);
		jest.spyOn(fs.promises, 'readFile').mockResolvedValue(JSON.stringify(cache));

		const result = await loadCache();

		expect(result).toEqual({ foo: 'bar' });
		expect(fs.promises.readFile).toHaveBeenCalled();
	});
});

describe('saveCache', () => {
	test('writes JSON to file', async () => {
		await saveCache(cache);

		expect(fs.promises.mkdir).toHaveBeenCalledWith(`/tmp/${process.env.npm_package_name as string}`, {
			recursive: true,
		});
		expect(fs.promises.writeFile).toHaveBeenCalledWith(
			`/tmp/${process.env.npm_package_name as string}/cache.json`,
			JSON.stringify(cache, undefined, 2),
		);
	});
});
