import pluralizeNoun, { EXCEPTIONS } from './pluralizeNoun';

describe('pluralizeNoun', () => {
	describe.each(Object.entries(EXCEPTIONS))('%s exception', (noun, plural) => {
		it('returns the plural form of the noun', () => {
			const result = pluralizeNoun(noun, 2);

			expect(result).toBe(plural);
		});

		it('returns the noun as is', () => {
			const result = pluralizeNoun(noun, 1);

			expect(result).toBe(noun);
		});
	});

	it('adds an s to the end of a noun', () => {
		const result = pluralizeNoun('noun', 2);

		expect(result).toBe('nouns');
	});

	it('returns the noun as is', () => {
		const result = pluralizeNoun('noun', 1);

		expect(result).toBe('noun');
	});
});
