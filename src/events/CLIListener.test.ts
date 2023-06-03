import { DEPENDENCY_TYPES, SUPPORTED_VERSION_PREFIXES } from '../constants';
import type { Options, VersionAction } from '../types';

import CLIListener from './CLIListener';

import { generateConsoleMock } from '../testHelpers';
import { handleMakeChanges } from './commonHandlers';
import promptUserForVersionAction from '../utils/promptUserForVersionAction';

const handleMakeChangesMock = handleMakeChanges as jest.MockedFunction<typeof handleMakeChanges>;
const promptUserForVersionActionMock = promptUserForVersionAction as jest.MockedFunction<
	typeof promptUserForVersionAction
>;

jest.mock('./commonHandlers');
jest.mock('../utils/promptUserForVersionAction');

describe('CLIListener', () => {
	const console = generateConsoleMock('log', 'warn', 'error');

	describe('handleMissingArguments', () => {
		test('outputs usage instructions', () => {
			CLIListener.handleMissingArguments();

			expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Usage: npm-dependency-backdater'));
			expect(console.error).toHaveBeenCalledWith(expect.stringContaining(SUPPORTED_VERSION_PREFIXES.join(', ')));
		});
	});

	describe('handleInvalidDatetime', () => {
		test('outputs error message with provided datetime', () => {
			CLIListener.handleInvalidDatetime('2023-06-03T10:00:00Z');

			expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Expected a valid datetime'));
			expect(console.error).toHaveBeenCalledWith(expect.stringContaining('2023-06-03T10:00:00Z'));
		});
	});

	describe('handleDatetimeInFuture', () => {
		test('warning message logged and current datetime returned', () => {
			const currentDate = new Date();
			const futureDate = new Date(currentDate.getTime() + 1000);
			jest.useFakeTimers().setSystemTime(currentDate);

			const result = CLIListener.handleDatetimeInFuture(futureDate);

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining(`Warning: The provided datetime - ${futureDate.toISOString()} - is in the future`),
			);
			expect(result).toStrictEqual(currentDate);
		});
	});

	describe('handleRunStart', () => {
		test('outputs package file path and datetime', () => {
			const packageFilePath = 'path/to/package.json';
			const datetime = new Date();
			CLIListener.initialize(packageFilePath, datetime, {} as Options);

			CLIListener.handleRunStart();

			expect(console.log).toHaveBeenCalledWith(
				`Attempting to update package versions in "${packageFilePath}" to their latest versions as of ${datetime.toISOString()}...`,
			);
		});
	});

	describe('handleReadingPackageFileStart', () => {
		test('outputs package file path', () => {
			const packageFilePath = 'path/to/package.json';
			CLIListener.initialize(packageFilePath, new Date(), {} as Options);

			CLIListener.handleReadingPackageFileStart();

			expect(console.log).toHaveBeenCalledWith(`Reading package file "${packageFilePath}"...`);
		});
	});

	describe('handleReadingPackageFileFinish', () => {
		test('outputs package file path and read byte count', () => {
			const packageFilePath = 'path/to/package.json';
			CLIListener.initialize(packageFilePath, new Date(), {} as Options);

			CLIListener.handleReadingPackageFileFinish('string content');

			expect(console.log).toHaveBeenCalledWith(`14 bytes of "${packageFilePath}" read.`);
		});

		test('word "byte" is properly pluralized', () => {
			const packageFilePath = 'path/to/package.json';
			CLIListener.initialize(packageFilePath, new Date(), {} as Options);

			CLIListener.handleReadingPackageFileFinish(' ');

			expect(console.log).toHaveBeenCalledWith(`1 byte of "${packageFilePath}" read.`);
		});
	});

	describe('handleDiscoveringDependencyMapStart', () => {
		test.each(DEPENDENCY_TYPES)('outputs dependency map name "%s"', dependencyType => {
			CLIListener.handleDiscoveringDependencyMapStart(dependencyType);

			expect(console.log).toHaveBeenCalledWith(`Discovering "${dependencyType}" dependencies...`);
		});
	});

	describe('handleDiscoveringDependencyMapFinish', () => {
		test('outputs number of dependencies found', () => {
			CLIListener.handleDiscoveringDependencyMapFinish('devDependencies', {
				dependency1: '1.0.0',
				dependency2: '1.0.0',
			});

			expect(console.log).toHaveBeenCalledWith('2 "devDependencies" dependencies found.');
		});

		test('output dependency as singular when there is only one', () => {
			CLIListener.handleDiscoveringDependencyMapFinish('devDependencies', { dependency1: '1.0.0' });

			expect(console.log).toHaveBeenCalledWith('1 "devDependencies" dependency found.');
		});

		test('outputs when none are found', () => {
			CLIListener.handleDiscoveringDependencyMapFinish('devDependencies', undefined);

			expect(console.log).toHaveBeenCalledWith('No "devDependencies" dependencies found.');
		});
	});

	describe('handleGettingPackageVersionDatesStart', () => {
		test('outputs dependency name', () => {
			CLIListener.handleGettingPackageVersionDatesStart('dependency1');

			expect(console.log).toHaveBeenCalledWith('Getting version dates for "dependency1"...');
		});
	});

	describe('handleGettingPackageVersionDatesFinish', () => {
		test('outputs number of versions found', () => {
			const datetime = new Date();
			const cacheDate = datetime;
			const versions = {
				'1.0.0': datetime.toISOString(),
				'1.1.0': datetime.toISOString(),
			};
			CLIListener.initialize('', datetime, {} as Options);

			CLIListener.handleGettingPackageVersionDatesFinish('dependency1', cacheDate, versions);

			expect(console.log).toHaveBeenCalledWith('Found 2 versions for "dependency1".');
		});

		test('version has no s when only one was found', () => {
			const datetime = new Date();
			const cacheDate = datetime;
			const versions = {
				'1.0.0': datetime.toISOString(),
			};
			CLIListener.initialize('', datetime, {} as Options);

			CLIListener.handleGettingPackageVersionDatesFinish('dependency1', cacheDate, versions);

			expect(console.log).toHaveBeenCalledWith('Found 1 version for "dependency1".');
		});

		test('indicated when from cache', () => {
			const datetime = new Date();
			const cacheDate = new Date();
			const versions = {
				'1.0.0': new Date().toISOString(),
			};
			CLIListener.initialize('', datetime, {} as Options);

			CLIListener.handleGettingPackageVersionDatesFinish('dependency1', cacheDate, versions);

			expect(console.log).toHaveBeenCalledWith(
				`Found 1 version for "dependency1". (cached from ${cacheDate.toISOString()})`,
			);
		});
	});

	describe('handleCalculatedHighestVersion', () => {
		test('outputs when no versions are available', () => {
			CLIListener.handleCalculatedHighestVersion('dependency1', '1.0.0', null);

			expect(console.log).toHaveBeenCalledWith('No versions available.');
		});

		test('outputs highest version when available', () => {
			CLIListener.handleCalculatedHighestVersion('dependency1', '1.0.0', '1.1.0');

			expect(console.log).toHaveBeenCalledWith('Highest version of "dependency1" available is "1.1.0".');
		});

		test.each([
			['', false],
			[' and pre-releases are allowed', true],
		])('outputs when the highest version is the same as the current version%s', (_, allowPreRelease) => {
			CLIListener.initialize('', new Date(), { allowPreRelease } as Options);

			CLIListener.handleCalculatedHighestVersion('dependency1', '1.1.0', '1.1.0');

			expect(console.log).toHaveBeenCalledWith(
				'Highest version of "dependency1" available is "1.1.0".' + (allowPreRelease ? ' (including pre-releases)' : ''),
			);
		});
	});

	describe('handlePromptUserForVersionAction', () => {
		test('chooses first mutative action when non-interactive', async () => {
			const packageName = 'dependency1';
			const actions = [
				['keep', '1.0.0'],
				['change', '1.1.0'],
			] as VersionAction[];

			const result = await CLIListener.handlePromptUserForVersionAction(packageName, actions);

			expect(result).toEqual('1.1.0');
		});

		test('calls promptUserForVersionAction when interactive', async () => {
			const packageName = 'dependency1';
			const actions = [
				['keep', '1.0.0'],
				['change', '1.1.0'],
			] as VersionAction[];
			promptUserForVersionActionMock.mockResolvedValueOnce('1.0.0');
			CLIListener.initialize('', new Date(), { interactive: true } as Options);

			const result = await CLIListener.handlePromptUserForVersionAction(packageName, actions);

			expect(promptUserForVersionActionMock).toHaveBeenCalledWith(packageName, actions, console.log);
			expect(result).toEqual('1.0.0');
		});
	});

	describe('handleDependencyProcessed', () => {
		test('outputs when version has changed', () => {
			CLIListener.handleDependencyProcessed('dependency1', { old: '1.0.0', new: '1.1.0' });

			expect(console.log).toHaveBeenCalledWith('Updated "dependency1" from "1.0.0" to "1.1.0".');
		});

		test('outputs when version has not changed', () => {
			CLIListener.handleDependencyProcessed('dependency1', { old: '1.0.0', new: '1.0.0' });

			expect(console.log).toHaveBeenCalledWith('Left "dependency1" as "1.0.0".');
		});
	});

	describe('handleDependencyMapProcessed', () => {
		test('outputs when changes were made', () => {
			CLIListener.handleDependencyMapProcessed('dependencies', {});

			expect(console.log).toHaveBeenCalledWith('No changes made to "dependencies".');
		});

		test('outputs when changes were not made', () => {
			CLIListener.handleDependencyMapProcessed('dependencies', { dependency1: '1.1.0' });

			expect(console.log).toHaveBeenCalledWith('Updated 1 "dependencies" dependency.');
		});

		test('outputs dependency as plural when multiple changes were made', () => {
			CLIListener.handleDependencyMapProcessed('devDependencies', { dependency1: '1.1.0', dependency2: '1.1.0' });

			expect(console.log).toHaveBeenCalledWith('Updated 2 "devDependencies" dependencies.');
		});
	});

	describe('handleChangesMade', () => {
		test('outputs when no changes were made', () => {
			CLIListener.handleChangesMade(false);

			expect(console.log).toHaveBeenCalledWith('No changes made.');
		});

		test('not log when changes were made', () => {
			CLIListener.handleChangesMade(true);

			expect(console.log).not.toHaveBeenCalled();
		});
	});

	test('handleMakeChanges is called with logging', async () => {
		CLIListener.initialize('filepath', new Date(), { dryRun: true } as Options);

		await CLIListener.handleMakeChanges({ old: true }, { new: true });

		expect(handleMakeChangesMock).toHaveBeenCalledWith(
			true,
			'filepath',
			{ old: { old: true }, new: { new: true } },
			true,
		);
	});
});
