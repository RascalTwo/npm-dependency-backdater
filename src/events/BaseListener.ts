import { EVENT_NAMES } from './types';
import type { Events } from './types';

export interface Listener {
	emit<K extends keyof Events>(name: K, payload: Events[K]['payload']): Events[K]['return'];
	handle<K extends keyof Events>(name: K, handler: (payload: Events[K]['payload']) => Events[K]['return']): this;
	validate(): void;
}

export default class BaseListener implements Listener {
	private handles: Map<keyof Events, (payload: any) => any> = new Map();

	emit<K extends keyof Events>(name: K, payload: Events[K]['payload']): Events[K]['return'] {
		return this.getHandle(name)(payload);
	}

	getHandle(name: keyof Events) {
		// successful call to validate() ensures that this is always true
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.handles.get(name)!;
	}

	handle<K extends keyof Events>(name: K, handler: (payload: Events[K]['payload']) => Events[K]['return']): this {
		this.handles.set(name, handler);
		return this;
	}

	validate() {
		for (const name of EVENT_NAMES) {
			if (!this.handles.has(name)) {
				throw new Error(`Event "${name}" is not handled.`);
			}
		}
	}
}
