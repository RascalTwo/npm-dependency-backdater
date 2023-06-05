import { diff } from 'jest-diff';
import fs from 'fs';

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

	test('diff is logged when dryRun is true', async () => {
		diffMock.mockReturnValueOnce('diff');
		const output = jest.fn();

		await handleMakeChanges(output, '', packageJson, true);

		expect(diffMock).toHaveBeenCalledWith(packageJson.old, packageJson.new, {
			aAnnotation: 'Old Version(s)',
			aColor: expect.any(Function),
			bAnnotation: 'New Version(s)',
			bColor: expect.any(Function),
		});
		expect(output).toHaveBeenCalledWith('diff');
	});

	test('file is updated when dryRun is false', async () => {
		await handleMakeChanges(undefined, 'filepath', packageJson, false);

		expect(fs.promises.writeFile).toHaveBeenCalledWith('filepath', JSON.stringify(packageJson.new, undefined, 2));
	});

	test('logs messages when logging is true while writing to file', async () => {
		const output = jest.fn();

		await handleMakeChanges(output, 'filepath', packageJson, false);

		expect(output).toHaveBeenCalledWith('Writing changes to "filepath"...');
		expect(fs.promises.writeFile).toHaveBeenCalledWith('filepath', JSON.stringify(packageJson.new, undefined, 2));
		expect(output).toHaveBeenCalledWith('Changes written to "filepath".');
	});
});
