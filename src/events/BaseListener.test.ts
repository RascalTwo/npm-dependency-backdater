import BaseListener from './BaseListener';
import type { OptionalEventsListener } from './BaseListener';
import { testHandlersAreSilent } from '../testHelpers';

describe('BaseListener default handlers are all silent', () => {
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

	testHandlersAreSilent(BaseListener, expectResult, ...(Object.keys(BaseListener) as (keyof OptionalEventsListener)[]));
});
