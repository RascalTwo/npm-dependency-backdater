import { generateConsoleMock, testHandlersAreSilent } from '../testHelpers';

import CLIListener from './CLIListener';
import type { Options } from '../types';
import SilentListener from './SilentListener';

import { handleMakeChanges } from './commonHandlers';

const handleMakeChangesMock = handleMakeChanges as jest.MockedFunction<typeof handleMakeChanges>;

jest.mock('./commonHandlers');

describe('SilentListener default handlers are all silent', () => {
	const console = generateConsoleMock('log', 'warn', 'error');

	const expectResult = (result: unknown) => {
		expect(console.log).not.toHaveBeenCalled();
		expect(console.warn).not.toHaveBeenCalled();
		expect(console.error).not.toHaveBeenCalled();
		expect(result).toBeUndefined();
	};

	testHandlersAreSilent(
		SilentListener,
		expectResult,
		'handleRunStart',
		'handleRunFinish',
		'handleReadingPackageFileStart',
		'handleReadingPackageFileFinish',
		'handleDiscoveringDependencyMapStart',
		'handleDiscoveringDependencyMapFinish',
		'handleGettingPackageVersionDatesStart',
		'handleGettingPackageVersionDatesFinish',
		'handleCalculatedHighestVersion',
		'handleDependencyProcessed',
		'handleDependencyMapProcessed',
		'handleChangesMade',
	);

	describe('extends CLIListener', () => {
		test.each([
			'handleMissingArguments',
			'handleInvalidDatetime',
			'handleDatetimeInFuture',
			'handlePromptUserForVersionAction',
		] as const)('%s', async handler => {
			expect(SilentListener[handler]).toBe(CLIListener[handler]);
		});
	});

	test('handleMakeChanges is called with logging disabled', async () => {
		SilentListener.initialize('filepath', new Date(), {} as Options);

		await SilentListener.handleMakeChanges({ old: true }, { new: true });

		expect(handleMakeChangesMock).toHaveBeenCalledWith(
			false,
			'filepath',
			{ old: { old: true }, new: { new: true } },
			false,
		);
	});
});
