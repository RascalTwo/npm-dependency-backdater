import type { BaseEventsListener, UnresponsiveBaseEventsHandlers } from './events/BaseListener';
import BaseListener from './events/BaseListener';
import { NPMRegistryError } from './fetchPackageVersionDates';
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
		test('initialize', async () => {
			await listener.initialize('', new Date(), {} as Options);
			expectResult(undefined);
		}),
	clone: (listener: BaseEventsListener, expectResult: (result: unknown) => void) =>
		test('clone', async () => {
			const cloned = await listener.clone();

			expectResult(undefined);
			expect(cloned).not.toBe(listener);
			expect(cloned.options).not.toBe(listener.options);
			expect(cloned.options.listener).toBe(cloned);
			expect(cloned).toMatchObject(listener);
		}),
	handleMissingArguments: (listener: BaseEventsListener, expectResult: (result: unknown) => void, delay?: number) =>
		test('handleMissingArguments', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleMissingArguments(),
			)),
	handleInvalidDatetime: (listener: BaseEventsListener, expectResult: (result: unknown) => void, delay?: number) =>
		test('handleInvalidDatetime', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleInvalidDatetime(''),
			)),
	handleDatetimeInFuture: (listener: BaseEventsListener, expectResult: (result: unknown) => void, delay?: number) =>
		test('handleDatetimeInFuture', () => {
			expect(listener.handleDatetimeInFuture(new Date())).rejects.toThrowError('Not implemented');
			expectResult(undefined);
		}),
	handleRunStart: (listener: BaseEventsListener, expectResult: (result: unknown) => void, delay?: number) =>
		test('handleRunStart', async () =>
			expectResult(
				await (await (await listener.clone()).initialize('', new Date(), { delay } as Options)).handleRunStart(),
			)),
	handleRunFinish: (listener: BaseEventsListener, expectResult: (result: unknown) => void, delay?: number) =>
		test('handleRunFinish', async () =>
			expectResult(
				await (await (await listener.clone()).initialize('', new Date(), { delay } as Options)).handleRunFinish(),
			)),
	handleReadingPackageFileStart: (
		listener: BaseEventsListener,
		expectResult: (result: unknown) => void,
		delay?: number,
	) =>
		test('handleReadingPackageFileStart', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleReadingPackageFileStart(),
			)),
	handleReadingPackageFileFinish: (
		listener: BaseEventsListener,
		expectResult: (result: unknown) => void,
		delay?: number,
	) =>
		test('handleReadingPackageFileFinish', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleReadingPackageFileFinish(''),
			)),
	handleDiscoveringDependencyMapStart: (
		listener: BaseEventsListener,
		expectResult: (result: unknown) => void,
		delay?: number,
	) =>
		test('handleDiscoveringDependencyMapStart', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleDiscoveringDependencyMapStart('dependencies'),
			)),
	handleDiscoveringDependencyMapFinish: (
		listener: BaseEventsListener,
		expectResult: (result: unknown) => void,
		delay?: number,
	) =>
		test('handleDiscoveringDependencyMapFinish', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleDiscoveringDependencyMapFinish('dependencies'),
			)),
	handleGettingPackageVersionDatesStart: (
		listener: BaseEventsListener,
		expectResult: (result: unknown) => void,
		delay?: number,
	) =>
		test('handleGettingPackageVersionDatesStart', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleGettingPackageVersionDatesStart(''),
			)),
	handleNPMRegistryError: (listener: BaseEventsListener, expectResult: (result: unknown) => void, delay?: number) =>
		test('handleNPMRegistryError', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleNPMRegistryError('', new NPMRegistryError('', { error: '' })),
			)),
	handleGettingPackageVersionDatesFinish: (
		listener: BaseEventsListener,
		expectResult: (result: unknown) => void,
		delay?: number,
	) =>
		test('handleGettingPackageVersionDatesFinish', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleGettingPackageVersionDatesFinish('', new Date(), {}),
			)),
	handleCalculatedHighestVersion: (
		listener: BaseEventsListener,
		expectResult: (result: unknown) => void,
		delay?: number,
	) =>
		test('handleCalculatedHighestVersion', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleCalculatedHighestVersion('', '', ''),
			)),
	handlePromptUserForVersionAction: (
		listener: BaseEventsListener,
		expectResult: (result: unknown) => void,
		delay?: number,
	) =>
		test('handlePromptUserForVersionAction', async () => {
			await expect(
				(
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handlePromptUserForVersionAction('', []),
			).rejects.toThrowError('Not implemented');
			expectResult(undefined);
		}),
	handleDependencyProcessed: (listener: BaseEventsListener, expectResult: (result: unknown) => void, delay?: number) =>
		test('handleDependencyProcessed', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleDependencyProcessed('', { old: '', new: '' }),
			)),
	handleDependencyMapProcessed: (
		listener: BaseEventsListener,
		expectResult: (result: unknown) => void,
		delay?: number,
	) =>
		test('handleDependencyMapProcessed', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleDependencyMapProcessed('dependencies', {}),
			)),
	handleChangesMade: (listener: BaseEventsListener, expectResult: (result: unknown) => void, delay?: number) =>
		test('handleChangesMade', async () =>
			expectResult(
				await (
					await (await listener.clone()).initialize('', new Date(), { delay } as Options)
				).handleChangesMade(false),
			)),
	handleMakeChanges: (listener: BaseEventsListener, expectResult: (result: unknown) => void, delay?: number) =>
		test('handleMakeChanges', async () => {
			await expect(listener.handleMakeChanges({}, {})).rejects.toThrowError('Not implemented');
			expectResult(undefined);
		}),
};

export function testHandlersAreSilent(
	listener: BaseEventsListener,
	expectResult: (result: unknown) => void,
	delay?: number,
	...handlerNames: UnresponsiveBaseEventsHandlers
) {
	for (const handlerName of handlerNames) {
		TEST_MAP[handlerName](listener, expectResult, delay);
	}
}

export function generateConsoleMock(...methods: (keyof Console)[]) {
	return methods.reduce((obj, method) => {
		obj[method] = console[method] = jest.fn();
		return obj;
	}, {} as Record<keyof Console, jest.Mock>);
}
