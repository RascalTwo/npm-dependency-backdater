import { generateConsoleMock, testHandlersAreSilent } from '../testHelpers';

import CLIListener from './CLIListener';
import SilentListener from './SilentListener';

import { handleMakeChanges } from './commonHandlers';

const CLIListenerMock = CLIListener as jest.Mocked<typeof CLIListener>;
const handleMakeChangesMock = handleMakeChanges as jest.MockedFunction<typeof handleMakeChanges>;

jest.mock('./CLIListener');
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
		] as const)('%s', handler => {
			expect(SilentListener[handler]).toBe(CLIListenerMock[handler]);
		});
	});

	test('handleMakeChanges is called with logging disabled', async () => {
		const args = ['', { old: {}, new: {} }, true] as const;

		await SilentListener.handleMakeChanges(...args);

		expect(handleMakeChangesMock).toHaveBeenCalledWith(false, ...args);
	});
});
