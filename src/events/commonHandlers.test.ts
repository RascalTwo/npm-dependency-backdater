import { diff } from 'jest-diff';
import fs from 'fs';
import { handleMakeChanges } from './commonHandlers';

const diffMock = diff as jest.MockedFunction<typeof diff>;

jest.mock('jest-diff');
jest.mock('fs', () => ({
	existsSync: jest.fn(),
	promises: {
		mkdir: jest.fn(),
		readFile: jest.fn(),
		writeFile: jest.fn(),
	},
}));

describe('handleMakeChanges', () => {
	const logMock = (console.log = jest.fn());

	beforeEach(() => {
		logMock.mockClear();
	});

	test('diff is logged when dryRun is true', async () => {
		const packageJson = { old: {}, new: {} };
		const dryRun = true;
		diffMock.mockReturnValueOnce('diff');

		await handleMakeChanges(false, '', packageJson, dryRun);

		expect(diffMock).toHaveBeenCalledWith(packageJson.old, packageJson.new, {
			aAnnotation: 'Old Version(s)',
			aColor: expect.any(Function),
			bAnnotation: 'New Version(s)',
			bColor: expect.any(Function),
		});
		expect(logMock).toHaveBeenCalledWith('diff');
	});

	test('file is updated when dryRun is false', async () => {
		const packageJson = { old: {}, new: {} };
		const dryRun = false;
		jest.spyOn(fs.promises, 'writeFile').mockResolvedValueOnce();

		await handleMakeChanges(false, 'filepath', packageJson, dryRun);

		expect(fs.promises.writeFile).toHaveBeenCalledWith('filepath', JSON.stringify(packageJson.new, undefined, 2));
	});

	test('logs messages when logging is true while writing to file', async () => {
		const packageJson = { old: {}, new: {} };
		const dryRun = false;
		jest.spyOn(fs.promises, 'writeFile').mockResolvedValueOnce();

		await handleMakeChanges(true, 'filepath', packageJson, dryRun);

		expect(logMock).toHaveBeenCalledWith('Writing changes to "filepath"...');
		expect(fs.promises.writeFile).toHaveBeenCalledWith('filepath', JSON.stringify(packageJson.new, undefined, 2));
		expect(logMock).toHaveBeenCalledWith('Changes written to "filepath".');
	});
});
