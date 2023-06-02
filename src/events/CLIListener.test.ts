import type { Options, VersionAction } from '../types';
import CLIListener from './CLIListener';
import { SUPPORTED_PREFIXES } from '../parseRawVersion';

import { handleMakeChanges } from './commonHandlers';
import promptUserForVersionAction from '../utils/promptUserForVersionAction';

const handleMakeChangesMock = handleMakeChanges as jest.MockedFunction<typeof handleMakeChanges>;
const promptUserForVersionActionMock = promptUserForVersionAction as jest.MockedFunction<
	typeof promptUserForVersionAction
>;

jest.mock('./commonHandlers');
jest.mock('../utils/promptUserForVersionAction');

describe('CLIListener', () => {
	const logMock = (console.log = jest.fn());
	const warnMock = (console.warn = jest.fn());
	const errorMock = (console.error = jest.fn());

	beforeEach(() => {
		logMock.mockClear();
		warnMock.mockClear();
		errorMock.mockClear();
	});

	describe('handleMissingArguments', () => {
		it('should log the usage instructions', () => {
			CLIListener.handleMissingArguments();

			expect(errorMock).toHaveBeenCalledWith(expect.stringContaining('Usage: npm-dependency-backdater'));
			expect(errorMock).toHaveBeenCalledWith(expect.stringContaining(SUPPORTED_PREFIXES.join(', ')));
		});
	});

	describe('handleInvalidDatetime', () => {
		it('should log an error message with the received datetime', () => {
			CLIListener.handleInvalidDatetime('2023-06-03T10:00:00Z');

			expect(errorMock).toHaveBeenCalledWith(expect.stringContaining('Expected a valid datetime'));
			expect(errorMock).toHaveBeenCalledWith(expect.stringContaining('2023-06-03T10:00:00Z'));
		});
	});

	describe('handleDatetimeInFuture', () => {
		it('should log a warning message and return the current datetime', () => {
			const currentDate = new Date();
			const futureDate = new Date(currentDate.getTime() + 1000);
			jest.useFakeTimers().setSystemTime(currentDate);

			const result = CLIListener.handleDatetimeInFuture(futureDate);

			expect(warnMock).toHaveBeenCalledWith(
				expect.stringContaining(`Warning: The provided datetime - ${futureDate.toISOString()} - is in the future`),
			);
			expect(result).toStrictEqual(currentDate);
		});
	});

	describe('handleRunStart', () => {
		it('should log the package file path and datetime', () => {
			const packageFilePath = 'path/to/package.json';
			const datetime = new Date();

			CLIListener.handleRunStart({} as Options, packageFilePath, datetime);

			expect(logMock).toHaveBeenCalledWith(
				`Attempting to update package versions in "${packageFilePath}" to their latest versions as of ${datetime.toISOString()}...`,
			);
		});
	});

	describe('handleReadingPackageFileStart', () => {
		it('should log the package file path', () => {
			const packageFilePath = 'path/to/package.json';

			CLIListener.handleReadingPackageFileStart(packageFilePath);

			expect(logMock).toHaveBeenCalledWith(`Reading package file "${packageFilePath}"...`);
		});
	});

	describe('handleReadingPackageFileFinish', () => {
		it('should log the package file path and read byte count', () => {
			const packageFilePath = 'path/to/package.json';

			CLIListener.handleReadingPackageFileFinish(packageFilePath, 'string content');

			expect(logMock).toHaveBeenCalledWith(`14 bytes of "${packageFilePath}" read.`);
		});

		it('properly pluralized byte', () => {
			const packageFilePath = 'path/to/package.json';

			CLIListener.handleReadingPackageFileFinish(packageFilePath, ' ');

			expect(logMock).toHaveBeenCalledWith(`1 byte of "${packageFilePath}" read.`);
		});
	});

	describe('handleDiscoveringDependencyMapStart', () => {
		it('should log the dependency map name', () => {
			CLIListener.handleDiscoveringDependencyMapStart('dependencies');

			expect(logMock).toHaveBeenCalledWith('Discovering "dependencies" dependencies...');
		});
	});

	describe('handleDiscoveringDependencyMapFinish', () => {
		it('should log the number of dependencies found', () => {
			CLIListener.handleDiscoveringDependencyMapFinish('devDependencies', {
				dependency1: '1.0.0',
				dependency2: '1.0.0',
			});

			expect(logMock).toHaveBeenCalledWith('2 "devDependencies" dependencies found.');
		});

		it('should output dependency as singular when there is only one', () => {
			CLIListener.handleDiscoveringDependencyMapFinish('devDependencies', { dependency1: '1.0.0' });

			expect(logMock).toHaveBeenCalledWith('1 "devDependencies" dependency found.');
		});

		it('should log when none are found', () => {
			CLIListener.handleDiscoveringDependencyMapFinish('devDependencies', undefined);

			expect(logMock).toHaveBeenCalledWith('No "devDependencies" dependencies found.');
		});
	});

	describe('handleGettingPackageVersionDatesStart', () => {
		it('should log the dependency name', () => {
			CLIListener.handleGettingPackageVersionDatesStart('dependency1');

			expect(logMock).toHaveBeenCalledWith('Getting version dates for "dependency1"...');
		});
	});

	describe('handleGettingPackageVersionDatesFinish', () => {
		it('should log the number of versions found', () => {
			const datetime = new Date();
			const cacheDate = datetime;
			const versions = {
				'1.0.0': datetime.toISOString(),
				'1.1.0': datetime.toISOString(),
			};

			CLIListener.handleGettingPackageVersionDatesFinish('dependency1', datetime, cacheDate, versions);

			expect(logMock).toHaveBeenCalledWith('Found 2 versions for "dependency1".');
		});

		it('version has no s when only one was found', () => {
			const datetime = new Date();
			const cacheDate = datetime;
			const versions = {
				'1.0.0': datetime.toISOString(),
			};

			CLIListener.handleGettingPackageVersionDatesFinish('dependency1', datetime, cacheDate, versions);

			expect(logMock).toHaveBeenCalledWith('Found 1 version for "dependency1".');
		});

		it('indicated when from cache', () => {
			const datetime = new Date();
			const cacheDate = new Date();
			const versions = {
				'1.0.0': new Date().toISOString(),
			};

			CLIListener.handleGettingPackageVersionDatesFinish('dependency1', datetime, cacheDate, versions);

			expect(logMock).toHaveBeenCalledWith(
				`Found 1 version for "dependency1". (cached from ${cacheDate.toISOString()})`,
			);
		});
	});

	describe('handleCalculatedHighestVersion', () => {
		it('should log when no versions are available', () => {
			CLIListener.handleCalculatedHighestVersion('dependency1', '1.0.0', null, false);

			expect(logMock).toHaveBeenCalledWith('No versions available.');
		});

		it('should log the highest version', () => {
			CLIListener.handleCalculatedHighestVersion('dependency1', '1.0.0', '1.1.0', false);

			expect(logMock).toHaveBeenCalledWith('Highest version of "dependency1" available is "1.1.0".');
		});

		it('should log when the highest version is the same as the current version', () => {
			CLIListener.handleCalculatedHighestVersion('dependency1', '1.1.0', '1.1.0', false);

			expect(logMock).toHaveBeenCalledWith('"dependency1" is already "1.1.0".');
		});

		it('should log when the highest version is the same as the current version and allow pre-release', () => {
			CLIListener.handleCalculatedHighestVersion('dependency1', '1.1.0', '1.1.0', true);

			expect(logMock).toHaveBeenCalledWith(
				'Highest version of "dependency1" available is "1.1.0". (including pre-releases)',
			);
		});
	});

	describe('handlePromptUserForVersionAction', () => {
		it('should return the first mutative action when not interactive', async () => {
			const options = { interactive: false } as Options;
			const packageName = 'dependency1';
			const actions = [
				['keep', '1.0.0'],
				['change', '1.1.0'],
			] as VersionAction[];

			const result = await CLIListener.handlePromptUserForVersionAction(options, packageName, actions);

			expect(result).toEqual('1.1.0');
		});

		it('should call promptUserForVersionAction when interactive', async () => {
			const options = { interactive: true } as Options;
			const packageName = 'dependency1';
			const actions = [
				['keep', '1.0.0'],
				['change', '1.1.0'],
			] as VersionAction[];
			promptUserForVersionActionMock.mockResolvedValueOnce('1.0.0');

			const result = await CLIListener.handlePromptUserForVersionAction(options, packageName, actions);

			expect(promptUserForVersionActionMock).toHaveBeenCalledWith(packageName, actions, console.log);
			expect(result).toEqual('1.0.0');
		});
	});

	describe('handleDependencyProcessed', () => {
		it('should log when the version has changed', () => {
			CLIListener.handleDependencyProcessed('dependency1', { old: '1.0.0', new: '1.1.0' });

			expect(logMock).toHaveBeenCalledWith('Updated "dependency1" from "1.0.0" to "1.1.0".');
		});

		it('should log when the version has not changed', () => {
			CLIListener.handleDependencyProcessed('dependency1', { old: '1.0.0', new: '1.0.0' });

			expect(logMock).toHaveBeenCalledWith('Left "dependency1" as "1.0.0".');
		});
	});

	describe('handleDependencyMapProcessed', () => {
		it('should log when no changes were made', () => {
			CLIListener.handleDependencyMapProcessed('dependencies', {});

			expect(logMock).toHaveBeenCalledWith('No changes made to "dependencies".');
		});

		it('should log when changes were made', () => {
			CLIListener.handleDependencyMapProcessed('dependencies', { dependency1: '1.1.0' });

			expect(logMock).toHaveBeenCalledWith('Updated 1 "dependencies" dependency.');
		});

		it('should log dependency as plural when multiple changes made', () => {
			CLIListener.handleDependencyMapProcessed('devDependencies', { dependency1: '1.1.0', dependency2: '1.1.0' });

			expect(logMock).toHaveBeenCalledWith('Updated 2 "devDependencies" dependencies.');
		});
	});

	describe('handleChangesMade', () => {
		it('should log when no changes were made', () => {
			CLIListener.handleChangesMade(false);

			expect(logMock).toHaveBeenCalledWith('No changes made.');
		});

		it('should not log when changes were made', () => {
			CLIListener.handleChangesMade(true);

			expect(logMock).not.toHaveBeenCalled();
		});
	});

	test('handleMakeChanges is called with logging', async () => {
		await CLIListener.handleMakeChanges('', { old: {}, new: {} }, true);

		expect(handleMakeChangesMock).toHaveBeenCalledWith(true, '', { old: {}, new: {} }, true);
	});
});
