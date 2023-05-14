import shallowObjectsAreEqual from './shallowObjectsAreEqual';

describe('shallowObjectsAreEqual', () => {
	it('returns true when the objects are the same in memory', () => {
		const a = { a: 1, b: 2 };
		const b = a;
		expect(shallowObjectsAreEqual(a, b)).toBe(true);
	});

	it('returns true when the objects are the same in value', () => {
		const a = { a: 1, b: 2 };
		const b = { a: 1, b: 2 };
		expect(shallowObjectsAreEqual(a, b)).toBe(true);
	});

	it('returns false when the objects are different in value', () => {
		const a = { a: 1, b: 2 };
		const b = { a: 1, b: 3 };
		expect(shallowObjectsAreEqual(a, b)).toBe(false);
	});

	it('returns false when the objects have different keys', () => {
		const a = { a: 1, b: 2 };
		const b = { a: 1, c: 2 };
		expect(shallowObjectsAreEqual(a, b)).toBe(false);
	});

	it('returns false when the objects have different lengths', () => {
		const a = { a: 1, b: 2 };
		const b = { a: 1, b: 2, c: 3 };
		expect(shallowObjectsAreEqual(a, b)).toBe(false);
	});
});
