import BaseListener from './events/BaseListener';
import type { Events } from './events/types';

export const generateMockListener = (...events: Array<keyof Events>) => {
	const listener = new BaseListener();
	const handles = events.reduce(
		(handles, event) => {
			const handle = jest.fn();
			handles[event] = handle;
			listener.handle(event, handle);
			return handles;
		},
		{} as {
			[K in keyof Events]: jest.Mock<Events[K]['return'], [Events[K]['payload']]>;
		},
	);
	return { listener, handles };
};
