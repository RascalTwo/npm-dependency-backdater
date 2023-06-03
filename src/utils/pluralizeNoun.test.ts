import pluralizeNoun, { EXCEPTIONS } from './pluralizeNoun';

describe('pluralizeNoun', () => {
	describe.each(Object.entries(EXCEPTIONS))('%s exception', (noun, plural) => {
		test('is pluralized', () => expect(pluralizeNoun(noun, 2)).toBe(plural));

		test('is returned unmodified', () => expect(pluralizeNoun(noun, 1)).toBe(noun));
	});

	test('adds s to end of noun', () => expect(pluralizeNoun('noun', 2)).toBe('nouns'));

	test('returns noun unmodified', () => expect(pluralizeNoun('noun', 1)).toBe('noun'));
});
