import { loadCache, saveCache } from './cache';
import fs from 'fs';
import os from 'os';

jest.mock('os');
jest.mock('fs', () => ({
	existsSync: jest.fn(),
	promises: {
		mkdir: jest.fn(),
		readFile: jest.fn(),
		writeFile: jest.fn(),
	},
}));

beforeEach(() => jest.spyOn(os, 'tmpdir').mockReturnValue('/tmp'));

const cache = { foo: 'bar' };

describe('loadCache', () => {
	test("returns empty object if it doesn't exist", async () => {
		jest.spyOn(fs, 'existsSync').mockReturnValue(false);

		expect(await loadCache()).toEqual({});

		expect(os.tmpdir).toHaveBeenCalled();
		expect(fs.promises.readFile).not.toHaveBeenCalled();
	});

	test('returns parsed JSON if it does exist', async () => {
		jest.spyOn(fs, 'existsSync').mockReturnValue(true);
		jest.spyOn(fs.promises, 'readFile').mockResolvedValue(JSON.stringify(cache));

		const result = await loadCache();

		expect(result).toEqual({ foo: 'bar' });

		expect(fs.promises.readFile).toHaveBeenCalled();
	});
});

describe('saveCache', () => {
	test('saves JSON to file', async () => {
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
