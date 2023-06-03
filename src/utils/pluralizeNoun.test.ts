import pluralizeNoun, { EXCEPTIONS } from './pluralizeNoun';

describe('pluralizeNoun', () => {
	describe.each(Object.entries(EXCEPTIONS))('%s exception', (noun, plural) => {
		test('is pluralized', () => {
			const result = pluralizeNoun(noun, 2);

			expect(result).toBe(plural);
		});

		test('is returned unmodified', () => {
			const result = pluralizeNoun(noun, 1);

			expect(result).toBe(noun);
		});
	});

	test('adds s to end of noun', () => {
		const result = pluralizeNoun('noun', 2);

		expect(result).toBe('nouns');
	});

	test('returns noun unmodified', () => {
		const result = pluralizeNoun('noun', 1);

		expect(result).toBe('noun');
	});
});
