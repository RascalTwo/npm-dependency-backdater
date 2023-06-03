import type { AllEventsListener, OptionalEventsListener } from './events/BaseListener';
import BaseListener from './events/BaseListener';
import type { Options } from './types';

export const generateMockListener = () => {
	const listener = {
		...Object.keys(BaseListener).reduce((obj, key) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			obj[key] = jest.fn();
			return obj;
		}, {}),
		handleMissingArguments: jest.fn(),
		handleDatetimeInFuture: jest.fn(),
		handlePromptUserForVersionAction: jest.fn(),
		handleMakeChanges: jest.fn(),
	} as {
		[K in keyof AllEventsListener]: jest.Mock<ReturnType<AllEventsListener[K]>, Parameters<AllEventsListener[K]>>;
	};
	return listener;
};

const TEST_MAP = {
	handleMissingArguments: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleMissingArguments', () => expectResult(listener.handleMissingArguments())),
	handleInvalidDatetime: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleInvalidDatetime', () => expectResult(listener.handleInvalidDatetime(''))),
	handleRunStart: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleRunStart', () => expectResult(listener.handleRunStart({} as Options, '', new Date()))),
	handleRunFinish: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleRunFinish', () => expectResult(listener.handleRunFinish({} as Options, '', new Date()))),
	handleReadingPackageFileStart: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleReadingPackageFileStart', () => expectResult(listener.handleReadingPackageFileStart(''))),
	handleReadingPackageFileFinish: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleReadingPackageFileFinish', () => expectResult(listener.handleReadingPackageFileFinish('', ''))),
	handleDiscoveringDependencyMapStart: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleDiscoveringDependencyMapStart', () =>
			expectResult(listener.handleDiscoveringDependencyMapStart('dependencies'))),
	handleDiscoveringDependencyMapFinish: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleDiscoveringDependencyMapFinish', () =>
			expectResult(listener.handleDiscoveringDependencyMapFinish('dependencies'))),
	handleGettingPackageVersionDatesStart: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleGettingPackageVersionDatesStart', () =>
			expectResult(listener.handleGettingPackageVersionDatesStart(''))),
	handleGettingPackageVersionDatesFinish: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleGettingPackageVersionDatesFinish', () =>
			expectResult(listener.handleGettingPackageVersionDatesFinish('', new Date(), new Date(), {}))),
	handleCalculatedHighestVersion: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleCalculatedHighestVersion', () =>
			expectResult(listener.handleCalculatedHighestVersion('', '', '', false))),
	handleDependencyProcessed: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleDependencyProcessed', () => expectResult(listener.handleDependencyProcessed('', { old: '', new: '' }))),
	handleDependencyMapProcessed: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleDependencyMapProcessed', () => expectResult(listener.handleDependencyMapProcessed('dependencies', {}))),
	handleChangesMade: (listener: OptionalEventsListener, expectResult: (result: unknown) => void) =>
		test('handleChangesMade', () => expectResult(listener.handleChangesMade(false))),
};

export function testHandlersAreSilent(
	listener: OptionalEventsListener,
	expectResult: (result: unknown) => void,
	...handlerNames: (keyof OptionalEventsListener)[]
) {
	for (const handlerName of handlerNames) {
		TEST_MAP[handlerName](listener, expectResult);
	}
}

export function generateConsoleMock(...methods: (keyof Console)[]) {
	return methods.reduce((obj, method) => {
		obj[method] = console[method] = jest.fn();
		return obj;
	}, {} as Record<keyof Console, jest.Mock>);
}
