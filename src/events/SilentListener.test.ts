import CLIListener from './CLIListener';
import SilentListener from './SilentListener';
import { handleMakeChanges } from './commonHandlers';
import { testHandlersAreSilent } from '../testHelpers';

const CLIListenerMock = CLIListener as jest.Mocked<typeof CLIListener>;
const handleMakeChangesMock = handleMakeChanges as jest.MockedFunction<typeof handleMakeChanges>;

jest.mock('./commonHandlers');
jest.mock('./CLIListener');

describe('SilentListener default handlers are all silent', () => {
	const logMock = (console.log = jest.fn());
	const warnMock = (console.warn = jest.fn());
	const errorMock = (console.error = jest.fn());

	beforeEach(() => {
		logMock.mockClear();
		warnMock.mockClear();
		errorMock.mockClear();
	});

	const expectResult = (result: unknown) => {
		expect(logMock).not.toHaveBeenCalled();
		expect(warnMock).not.toHaveBeenCalled();
		expect(errorMock).not.toHaveBeenCalled();
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
		await SilentListener.handleMakeChanges('', { old: {}, new: {} }, true);

		expect(handleMakeChangesMock).toHaveBeenCalledWith(false, '', { old: {}, new: {} }, true);
	});
});
