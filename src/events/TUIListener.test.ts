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

		beforeEach(() => {
			TUIInstance = TUIListener.clone();
		});

		beforeAll(() => {
			jest.useFakeTimers().setSystemTime(new Date('2023-06-05').getTime());
		});

		test('minimal frame is rendered', () => {
			process.stdout.columns = 80;
			process.stdout.rows = 11;
			TUIInstance.initialize('package.json', new Date(), {} as Options);

			TUIInstance.render();

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

		test('progress is accurate', () => {
			process.stdout.columns = 80;
			process.stdout.rows = 11;
			TUIInstance.initialize('package.json', new Date(), {} as Options);
			TUIInstance.counts.packages = 10;
			TUIInstance.counts.processed = 5;
			TUIInstance.counts.updated = 2;

			TUIInstance.render();

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

		test('breadcrumbs is accurate', () => {
			process.stdout.columns = 80;
			process.stdout.rows = 11;
			TUIInstance.initialize('package.json', new Date(), {} as Options);
			TUIInstance.current.dependencyType = 'dependencies';
			TUIInstance.current.packageName = 'test-package';

			TUIInstance.render();

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

		test('only latest messages are rendered', () => {
			process.stdout.columns = 80;
			process.stdout.rows = 11;
			TUIInstance.initialize('package.json', new Date(), {} as Options);
			TUIInstance.messages = ['test message 1', 'test message 2', 'test message 3'];

			TUIInstance.render();

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

	test('splits messages up by line length', () => {
		const TUIInstance = TUIListener.clone();
		process.stdout.columns = 20;
		process.stdout.rows = 15;

		TUIInstance.log('aaaaaaaaaaaaaaa');

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

	test('preloadDependencies is forced on', () => {
		const TUIInstance = TUIListener.clone();

		TUIInstance.initialize('package.json', new Date(), {} as Options);

		expect(TUIInstance.options.preloadDependencies).toBe(true);
	});

	test('handleDiscoveringDependencyMapStart updates current dependencyType', () => {
		const TUIInstance = TUIListener.clone();

		TUIInstance.handleDiscoveringDependencyMapStart('dependencies');

		expect(TUIInstance.current.dependencyType).toBe('dependencies');
	});

	test.each([
		['', { a: 'b' }],
		[" when there's no dependency map", undefined],
	])('handleDiscoveringDependencyMapFinish updates package count and internal dependency map%s', (_, dependencyMap) => {
		const TUIInstance = TUIListener.clone();
		TUIInstance.counts.packages = 5;

		TUIInstance.handleDiscoveringDependencyMapFinish('dependencies', dependencyMap);

		expect(TUIInstance.counts.packages).toBe(dependencyMap ? 6 : 5);
		expect(TUIInstance.dependencyMaps).toEqual({
			dependencies: dependencyMap ?? {},
		});
	});

	test('handleGettingPackageVersionDatesStart updates current dependencyType and packageName', () => {
		const TUIInstance = TUIListener.clone();
		TUIInstance.current.dependencyType = 'dependencies';
		TUIInstance.dependencyMaps = {
			devDependencies: {
				'test-package': 'b',
			},
		};
		TUIInstance.handleGettingPackageVersionDatesStart('test-package');

		expect(TUIInstance.current.dependencyType).toBe('devDependencies');
		expect(TUIInstance.current.packageName).toBe('test-package');
	});

	describe('calls CLIListenerHandlers', () => {
		let TUIInstance: typeof TUIListener;
		beforeEach(() => (TUIInstance = TUIListener.clone()));

		test('handleMissingArguments', () => {
			TUIInstance.handleMissingArguments();

			expect(CLIListenerHandlersMock.handleMissingArguments).toHaveBeenCalledWith(TUIInstance.log);
		});

		test('handleInvalidDatetime', () => {
			TUIInstance.handleInvalidDatetime('test');

			expect(CLIListenerHandlersMock.handleInvalidDatetime).toHaveBeenCalledWith(TUIInstance.log, 'test');
		});

		test('handleDatetimeInFuture', () => {
			TUIInstance.handleDatetimeInFuture(new Date());

			expect(CLIListenerHandlersMock.handleDatetimeInFuture).toHaveBeenCalledWith(TUIInstance.log, new Date());
		});

		test('handleRunStart', () => {
			TUIInstance.handleRunStart();

			expect(CLIListenerHandlersMock.handleRunStart).toHaveBeenCalledWith(TUIInstance.log);
		});

		test('handleReadingPackageFileStart', () => {
			TUIInstance.handleReadingPackageFileStart();

			expect(CLIListenerHandlersMock.handleReadingPackageFileStart).toHaveBeenCalledWith(TUIInstance.log);
		});

		test('handleReadingPackageFileFinish', () => {
			TUIInstance.handleReadingPackageFileFinish('content');

			expect(CLIListenerHandlersMock.handleReadingPackageFileFinish).toHaveBeenCalledWith(TUIInstance.log, 'content');
		});

		test('handleDiscoveringDependencyMapStart', () => {
			TUIInstance.handleDiscoveringDependencyMapStart('dependencies');

			expect(CLIListenerHandlersMock.handleDiscoveringDependencyMapStart).toHaveBeenCalledWith(
				TUIInstance.log,
				'dependencies',
			);
		});

		test('handleDiscoveringDependencyMapFinish', () => {
			TUIInstance.handleDiscoveringDependencyMapFinish('dependencies', { a: 'b' });

			expect(CLIListenerHandlersMock.handleDiscoveringDependencyMapFinish).toHaveBeenCalledWith(
				TUIInstance.log,
				'dependencies',
				{ a: 'b' },
			);
		});

		test('handleGettingPackageVersionDatesStart', () => {
			TUIInstance.handleGettingPackageVersionDatesStart('test-package');

			expect(CLIListenerHandlersMock.handleGettingPackageVersionDatesStart).toHaveBeenCalledWith(
				TUIInstance.log,
				'test-package',
			);
		});

		test('handleGettingPackageVersionDatesFinish', () => {
			const cacheDate = new Date();
			TUIInstance.handleGettingPackageVersionDatesFinish('test-package', cacheDate, { a: 'b' });

			expect(CLIListenerHandlersMock.handleGettingPackageVersionDatesFinish).toHaveBeenCalledWith(
				TUIInstance.log,
				'test-package',
				cacheDate,
				{ a: 'b' },
			);
		});

		test('handleCalculatedHighestVersion', () => {
			TUIInstance.handleCalculatedHighestVersion('test-package', '1.0.0', '1.1.0');

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

		test('handleDependencyMapProcessed', () => {
			TUIInstance.handleDependencyMapProcessed('dependencies', {});

			expect(CLIListenerHandlersMock.handleDependencyMapProcessed).toHaveBeenCalledWith(
				TUIInstance.log,
				'dependencies',
				{},
			);
		});

		test('handleChangesMade', () => {
			TUIInstance.handleChangesMade(false);

			expect(CLIListenerHandlersMock.handleChangesMade).toHaveBeenCalledWith(TUIInstance.log, false);
		});

		test('handleMakeChanges', () => {
			TUIInstance.handleMakeChanges({}, {});

			expect(CLIListenerMock.handleMakeChanges).toHaveBeenCalledWith({}, {});
		});
	});

	describe('handleDependencyProcessed', () => {
		test('updates processed count', () => {
			const TUIInstance = TUIListener.clone();
			TUIInstance.counts.processed = 5;

			TUIInstance.handleDependencyProcessed('test-package', { old: '1', new: '1' });

			expect(TUIInstance.counts.processed).toBe(6);
		});

		test('updates updated count', () => {
			const TUIInstance = TUIListener.clone();
			TUIInstance.counts.updated = 5;

			TUIInstance.handleDependencyProcessed('test-package', { old: '1', new: '2' });

			expect(TUIInstance.counts.updated).toBe(6);
		});
	});

	test('handleDependencyMapProcessed clears current packageName', () => {
		const TUIInstance = TUIListener.clone();
		TUIInstance.current.packageName = 'test-package';

		TUIInstance.handleDependencyMapProcessed('dependencies', {});

		expect(TUIInstance.current.packageName).toBe(null);
	});

	test('handleChangesMade clears current dependencyType', () => {
		const TUIInstance = TUIListener.clone();
		TUIInstance.current.dependencyType = 'dependencies';

		TUIInstance.handleChangesMade(false);

		expect(TUIInstance.current.dependencyType).toBe(null);
	});
});
