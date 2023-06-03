import type { BaseEventsListener, UnresponsiveBaseEventsHandlers } from './BaseListener';

import { generateConsoleMock, testHandlersAreSilent } from '../testHelpers';

import BaseListener from './BaseListener';

describe('BaseListener default handlers are all silent', () => {
	const console = generateConsoleMock('log', 'warn', 'error');

	const expectResult = (result: unknown) => {
		expect(console.log).not.toHaveBeenCalled();
		expect(console.warn).not.toHaveBeenCalled();
		expect(console.error).not.toHaveBeenCalled();
		expect(result).toBeUndefined();
	};

	testHandlersAreSilent(
		BaseListener,
		expectResult,
		...(Object.keys(BaseListener).filter(
			key => typeof BaseListener[key as keyof BaseEventsListener] === 'function' && key.startsWith('handle'),
		) as UnresponsiveBaseEventsHandlers),
	);
});
