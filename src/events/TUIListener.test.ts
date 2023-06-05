import CLIListener, { CLIListenerHandlers } from './CLIListener';
import type { Options } from '../types';
import TUIListener from './TUIListener';
import { generateConsoleMock } from '../testHelpers';

const CLIListenerMock = CLIListener as jest.Mocked<typeof CLIListener>;
const CLIListenerHandlersMock = CLIListenerHandlers as jest.Mocked<typeof CLIListenerHandlers>;

jest.mock('./CLIListener');

describe('TUIListener', () => {
	const console = generateConsoleMock('log', 'clear');

	describe('rendering', () => {
		let TUIInstance: typeof TUIListener;

		beforeEach(async () => {
			TUIInstance = await TUIListener.clone();
		});

		beforeAll(() => {
			jest.useFakeTimers().setSystemTime(new Date('2023-06-05').getTime());
		});

		test('minimal frame is rendered', async () => {
			process.stdout.columns = 80;
			process.stdout.rows = 11;
			await TUIInstance.initialize('package.json', new Date(), {} as Options);

			await TUIInstance.render();

			expect(console.clear).toHaveBeenCalled();
			expect(console.log).toHaveBeenCalled();
			const call = console.log.mock.calls[0][0];
			expect(call).toMatchInlineSnapshot(`
			"┌──────────────────────────────────────────────────────────────────────────┐
			│ 00 / 00 (  0.00%) Processed                    00 / 00 (  0.00%) Updated │
			├▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒──────────────▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒┤
			│ package.json @ 2023-06-05                                                |
			├──────────────────────────────────────────────────────────────────────────┤
			│                                                                          │
			╰──────────────────────────────────────────────────────────────────────────╯"
		`);
		});

		test('progress is accurate', async () => {
			process.stdout.columns = 80;
			process.stdout.rows = 11;
			await TUIInstance.initialize('package.json', new Date(), {} as Options);
			TUIInstance.counts.packages = 10;
			TUIInstance.counts.processed = 5;
			TUIInstance.counts.updated = 2;

			await TUIInstance.render();

			expect(console.clear).toHaveBeenCalled();
			expect(console.log).toHaveBeenCalled();
			const call = console.log.mock.calls[0][0];
			expect(call).toMatchInlineSnapshot(`
			"┌──────────────────────────────────────────────────────────────────────────┐
			│ 05 / 10 ( 50.00%) Processed                    02 / 10 ( 20.00%) Updated │
			├███████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒──────────────██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒┤
			│ package.json @ 2023-06-05                                                |
			├──────────────────────────────────────────────────────────────────────────┤
			│                                                                          │
			╰──────────────────────────────────────────────────────────────────────────╯"
		`);
		});

		test('breadcrumbs is accurate', async () => {
			process.stdout.columns = 80;
			process.stdout.rows = 11;
			await TUIInstance.initialize('package.json', new Date(), {} as Options);
			TUIInstance.current.dependencyType = 'dependencies';
			TUIInstance.current.packageName = 'test-package';

			await TUIInstance.render();

			expect(console.clear).toHaveBeenCalled();
			expect(console.log).toHaveBeenCalled();
			const call = console.log.mock.calls[0][0];
			expect(call).toMatchInlineSnapshot(`
			"┌──────────────────────────────────────────────────────────────────────────┐
			│ 00 / 00 (  0.00%) Processed                    00 / 00 (  0.00%) Updated │
			├▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒──────────────▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒┤
			│ package.json @ 2023-06-05 >     dependencies     >     test-package      |
			├──────────────────────────────────────────────────────────────────────────┤
			│                                                                          │
			╰──────────────────────────────────────────────────────────────────────────╯"
		`);
		});

		test('only latest messages are rendered', async () => {
			process.stdout.columns = 80;
			process.stdout.rows = 11;
			await TUIInstance.initialize('package.json', new Date(), {} as Options);
			TUIInstance.messages = ['test message 1', 'test message 2', 'test message 3'];

			await TUIInstance.render();

			expect(console.clear).toHaveBeenCalled();
			expect(console.log).toHaveBeenCalled();
			const call = console.log.mock.calls[0][0];
			expect(call).toMatchInlineSnapshot(`
			"┌──────────────────────────────────────────────────────────────────────────┐
			│ 00 / 00 (  0.00%) Processed                    00 / 00 (  0.00%) Updated │
			├▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒──────────────▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒┤
			│ package.json @ 2023-06-05                                                |
			├──────────────────────────────────────────────────────────────────────────┤
			│ test message 3                                                           │
			╰──────────────────────────────────────────────────────────────────────────╯"
		`);
		});
	});

	test('splits messages up by line length', async () => {
		const TUIInstance = await TUIListener.clone();
		process.stdout.columns = 20;
		process.stdout.rows = 15;

		await TUIInstance.log('aaaaaaaaaaaaaaa');

		expect(console.clear).toHaveBeenCalled();
		expect(console.log).toHaveBeenCalled();
		const call = console.log.mock.calls[0][0].split('\n').slice(4).join('\n');
		expect(call).toMatchInlineSnapshot(`
		"├──────────────┤
		│ aaaaaaaaaaaa │
		│ aaa          │
		│              │
		│              │
		│              │
		╰──────────────╯"
	`);
	});

	test('preloadDependencies is forced on', async () => {
		const TUIInstance = await TUIListener.clone();

		await TUIInstance.initialize('package.json', new Date(), {} as Options);

		expect(TUIInstance.options.preloadDependencies).toBe(true);
	});

	test('handleDiscoveringDependencyMapStart updates current dependencyType', async () => {
		const TUIInstance = await TUIListener.clone();

		await TUIInstance.handleDiscoveringDependencyMapStart('dependencies');

		expect(TUIInstance.current.dependencyType).toBe('dependencies');
	});

	test.each([
		['', { a: 'b' }],
		[" when there's no dependency map", undefined],
	])(
		'handleDiscoveringDependencyMapFinish updates package count and internal dependency map%s',
		async (_, dependencyMap) => {
			const TUIInstance = await TUIListener.clone();
			TUIInstance.counts.packages = 5;

			await TUIInstance.handleDiscoveringDependencyMapFinish('dependencies', dependencyMap);

			expect(TUIInstance.counts.packages).toBe(dependencyMap ? 6 : 5);
			expect(TUIInstance.dependencyMaps).toEqual({
				dependencies: dependencyMap ?? {},
			});
		},
	);

	test('handleGettingPackageVersionDatesStart updates current dependencyType and packageName', async () => {
		const TUIInstance = await TUIListener.clone();
		TUIInstance.current.dependencyType = 'dependencies';
		TUIInstance.dependencyMaps = {
			devDependencies: {
				'test-package': 'b',
			},
		};
		await TUIInstance.handleGettingPackageVersionDatesStart('test-package');

		expect(TUIInstance.current.dependencyType).toBe('devDependencies');
		expect(TUIInstance.current.packageName).toBe('test-package');
	});

	describe('calls CLIListenerHandlers', () => {
		let TUIInstance: typeof TUIListener;
		beforeEach(async () => (TUIInstance = await TUIListener.clone()));

		test('handleMissingArguments', async () => {
			await TUIInstance.handleMissingArguments();

			expect(CLIListenerHandlersMock.handleMissingArguments).toHaveBeenCalledWith(TUIInstance.log);
		});

		test('handleInvalidDatetime', async () => {
			await TUIInstance.handleInvalidDatetime('test');

			expect(CLIListenerHandlersMock.handleInvalidDatetime).toHaveBeenCalledWith(TUIInstance.log, 'test');
		});

		test('handleDatetimeInFuture', async () => {
			await TUIInstance.handleDatetimeInFuture(new Date());

			expect(CLIListenerHandlersMock.handleDatetimeInFuture).toHaveBeenCalledWith(TUIInstance.log, new Date());
		});

		test('handleRunStart', async () => {
			await TUIInstance.handleRunStart();

			expect(CLIListenerHandlersMock.handleRunStart).toHaveBeenCalledWith(TUIInstance.log);
		});

		test('handleReadingPackageFileStart', async () => {
			await TUIInstance.handleReadingPackageFileStart();

			expect(CLIListenerHandlersMock.handleReadingPackageFileStart).toHaveBeenCalledWith(TUIInstance.log);
		});

		test('handleReadingPackageFileFinish', async () => {
			await TUIInstance.handleReadingPackageFileFinish('content');

			expect(CLIListenerHandlersMock.handleReadingPackageFileFinish).toHaveBeenCalledWith(TUIInstance.log, 'content');
		});

		test('handleDiscoveringDependencyMapStart', async () => {
			await TUIInstance.handleDiscoveringDependencyMapStart('dependencies');

			expect(CLIListenerHandlersMock.handleDiscoveringDependencyMapStart).toHaveBeenCalledWith(
				TUIInstance.log,
				'dependencies',
			);
		});

		test('handleDiscoveringDependencyMapFinish', async () => {
			await TUIInstance.handleDiscoveringDependencyMapFinish('dependencies', { a: 'b' });

			expect(CLIListenerHandlersMock.handleDiscoveringDependencyMapFinish).toHaveBeenCalledWith(
				TUIInstance.log,
				'dependencies',
				{ a: 'b' },
			);
		});

		test('handleGettingPackageVersionDatesStart', async () => {
			await TUIInstance.handleGettingPackageVersionDatesStart('test-package');

			expect(CLIListenerHandlersMock.handleGettingPackageVersionDatesStart).toHaveBeenCalledWith(
				TUIInstance.log,
				'test-package',
			);
		});

		test('handleGettingPackageVersionDatesFinish', async () => {
			const cacheDate = new Date();
			await TUIInstance.handleGettingPackageVersionDatesFinish('test-package', cacheDate, { a: 'b' });

			expect(CLIListenerHandlersMock.handleGettingPackageVersionDatesFinish).toHaveBeenCalledWith(
				TUIInstance.log,
				'test-package',
				cacheDate,
				{ a: 'b' },
			);
		});

		test('handleCalculatedHighestVersion', async () => {
			await TUIInstance.handleCalculatedHighestVersion('test-package', '1.0.0', '1.1.0');

			expect(CLIListenerHandlersMock.handleCalculatedHighestVersion).toHaveBeenCalledWith(
				TUIInstance.log,
				'test-package',
				'1.0.0',
				'1.1.0',
			);
		});

		test('handlePromptUserForVersionAction', async () => {
			await TUIInstance.handlePromptUserForVersionAction('test-package', []);

			expect(CLIListenerHandlersMock.handlePromptUserForVersionAction).toHaveBeenCalledWith(
				TUIInstance.log,
				'test-package',
				[],
			);
		});

		test('handleDependencyMapProcessed', async () => {
			await TUIInstance.handleDependencyMapProcessed('dependencies', {});

			expect(CLIListenerHandlersMock.handleDependencyMapProcessed).toHaveBeenCalledWith(
				TUIInstance.log,
				'dependencies',
				{},
			);
		});

		test('handleChangesMade', async () => {
			await TUIInstance.handleChangesMade(false);

			expect(CLIListenerHandlersMock.handleChangesMade).toHaveBeenCalledWith(TUIInstance.log, false);
		});

		test('handleMakeChanges', async () => {
			await TUIInstance.handleMakeChanges({}, {});

			expect(CLIListenerMock.handleMakeChanges).toHaveBeenCalledWith({}, {});
		});
	});

	describe('handleDependencyProcessed', () => {
		test('updates processed count', async () => {
			const TUIInstance = await TUIListener.clone();
			TUIInstance.counts.processed = 5;

			await TUIInstance.handleDependencyProcessed('test-package', { old: '1', new: '1' });

			expect(TUIInstance.counts.processed).toBe(6);
		});

		test('updates updated count', async () => {
			const TUIInstance = await TUIListener.clone();
			TUIInstance.counts.updated = 5;

			await TUIInstance.handleDependencyProcessed('test-package', { old: '1', new: '2' });

			expect(TUIInstance.counts.updated).toBe(6);
		});
	});

	test('handleDependencyMapProcessed clears current packageName', async () => {
		const TUIInstance = await TUIListener.clone();
		TUIInstance.current.packageName = 'test-package';

		await TUIInstance.handleDependencyMapProcessed('dependencies', {});

		expect(TUIInstance.current.packageName).toBe(null);
	});

	test('handleChangesMade clears current dependencyType', async () => {
		const TUIInstance = await TUIListener.clone();
		TUIInstance.current.dependencyType = 'dependencies';

		await TUIInstance.handleChangesMade(false);

		expect(TUIInstance.current.dependencyType).toBe(null);
	});
});
