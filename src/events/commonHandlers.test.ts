import { diff } from 'jest-diff';
import fs from 'fs';

import { generateConsoleMock } from '../testHelpers';

import { handleMakeChanges } from './commonHandlers';

const diffMock = diff as jest.MockedFunction<typeof diff>;

jest.mock('fs', () => ({
	existsSync: jest.fn(),
	promises: {
		mkdir: jest.fn(),
		readFile: jest.fn(),
		writeFile: jest.fn(),
	},
}));
jest.mock('jest-diff');

describe('handleMakeChanges', () => {
	const packageJson = { old: {}, new: {} };
	const console = generateConsoleMock('log');

	test('diff is logged when dryRun is true', async () => {
		diffMock.mockReturnValueOnce('diff');

		await handleMakeChanges(false, '', packageJson, true);

		expect(diffMock).toHaveBeenCalledWith(packageJson.old, packageJson.new, {
			aAnnotation: 'Old Version(s)',
			aColor: expect.any(Function),
			bAnnotation: 'New Version(s)',
			bColor: expect.any(Function),
		});
		expect(console.log).toHaveBeenCalledWith('diff');
	});

	test('file is updated when dryRun is false', async () => {
		await handleMakeChanges(false, 'filepath', packageJson, false);

		expect(fs.promises.writeFile).toHaveBeenCalledWith('filepath', JSON.stringify(packageJson.new, undefined, 2));
		expect(console.log).not.toBeCalled();
	});

	test('logs messages when logging is true while writing to file', async () => {
		await handleMakeChanges(true, 'filepath', packageJson, false);

		expect(console.log).toHaveBeenCalledWith('Writing changes to "filepath"...');
		expect(fs.promises.writeFile).toHaveBeenCalledWith('filepath', JSON.stringify(packageJson.new, undefined, 2));
		expect(console.log).toHaveBeenCalledWith('Changes written to "filepath".');
	});
});
