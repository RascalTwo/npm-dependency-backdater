import type { BaseEventsListener, UnresponsiveBaseEventsHandlers } from './events/BaseListener';
import BaseListener from './events/BaseListener';
import type { Options } from './types';

export const generateMockListener = () => {
	const listener = {
		...Object.keys(BaseListener).reduce((obj, key) => {
			if (typeof BaseListener[key as keyof BaseEventsListener] !== 'function') return obj;
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[K in keyof BaseEventsListener]: BaseEventsListener[K] extends (...args: any[]) => any
			? jest.Mock<ReturnType<BaseEventsListener[K]>, Parameters<BaseEventsListener[K]>>
			: BaseEventsListener[K];
	};
	return listener;
};

const TEST_MAP = {
	initialize: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('initialize', async () => expectResult(await listener.initialize('', new Date(), {} as Options))),
	clone: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('clone', async () => {
			const cloned = await listener.clone();

			expectResult(undefined);
			expect(cloned).not.toBe(listener);
			expect(cloned.options).not.toBe(listener.options);
			expect(cloned.options.listener).toBe(cloned);
			expect(cloned).toMatchObject(listener);
		}),
	handleMissingArguments: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleMissingArguments', async () => expectResult(await listener.handleMissingArguments())),
	handleInvalidDatetime: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleInvalidDatetime', async () => expectResult(await listener.handleInvalidDatetime(''))),
	handleDatetimeInFuture: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleDatetimeInFuture', () => {
			expect(listener.handleDatetimeInFuture(new Date())).rejects.toThrowError('Not implemented');
			expectResult(undefined);
		}),
	handleRunStart: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleRunStart', async () => expectResult(await listener.handleRunStart())),
	handleRunFinish: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleRunFinish', async () => expectResult(await listener.handleRunFinish())),
	handleReadingPackageFileStart: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleReadingPackageFileStart', async () => expectResult(await listener.handleReadingPackageFileStart())),
	handleReadingPackageFileFinish: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleReadingPackageFileFinish', async () => expectResult(await listener.handleReadingPackageFileFinish(''))),
	handleDiscoveringDependencyMapStart: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleDiscoveringDependencyMapStart', async () =>
			expectResult(await listener.handleDiscoveringDependencyMapStart('dependencies'))),
	handleDiscoveringDependencyMapFinish: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleDiscoveringDependencyMapFinish', async () =>
			expectResult(await listener.handleDiscoveringDependencyMapFinish('dependencies'))),
	handleGettingPackageVersionDatesStart: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleGettingPackageVersionDatesStart', async () =>
			expectResult(await listener.handleGettingPackageVersionDatesStart(''))),
	handleGettingPackageVersionDatesFinish: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleGettingPackageVersionDatesFinish', async () =>
			expectResult(await listener.handleGettingPackageVersionDatesFinish('', new Date(), {}))),
	handleCalculatedHighestVersion: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleCalculatedHighestVersion', async () =>
			expectResult(await listener.handleCalculatedHighestVersion('', '', ''))),
	handlePromptUserForVersionAction: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handlePromptUserForVersionAction', async () => {
			await expect(listener.handlePromptUserForVersionAction('', [])).rejects.toThrowError('Not implemented');
			expectResult(undefined);
		}),
	handleDependencyProcessed: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleDependencyProcessed', async () =>
			expectResult(await listener.handleDependencyProcessed('', { old: '', new: '' }))),
	handleDependencyMapProcessed: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleDependencyMapProcessed', async () =>
			expectResult(await listener.handleDependencyMapProcessed('dependencies', {}))),
	handleChangesMade: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleChangesMade', async () => expectResult(await listener.handleChangesMade(false))),
	handleMakeChanges: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('handleMakeChanges', async () => {
			await expect(listener.handleMakeChanges({}, {})).rejects.toThrowError('Not implemented');
			expectResult(undefined);
		}),
};

export function testHandlersAreSilent(
	listener: BaseEventsListener,
	expectResult: (result: unknown) => void,
	...handlerNames: UnresponsiveBaseEventsHandlers
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
