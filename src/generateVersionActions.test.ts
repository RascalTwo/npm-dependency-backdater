import generateVersionActions from './generateVersionActions';

describe('generateVersionActions', () => {
	test('generated actions with prefix', () => {
		const version = {
			raw: '^1.0.0',
			prefix: '^',
			version: '1.0.0',
			major: 1,
			minor: 0,
		};

		const result = generateVersionActions(version, '2.0.0');

		expect(result).toEqual([
			['Leave as', '^1.0.0'],
			['Change to', '^2.0.0'],
			['Change to', '2.0.0'],
		]);
	});

	test('generated actions without prefix', () => {
		const version = {
			raw: '1.0.0',
			prefix: null,
			version: '1.0.0',
			major: 1,
			minor: 0,
		};

		const result = generateVersionActions(version, '2.0.0');

		expect(result).toEqual([
			['Leave as', '1.0.0'],
			['Change to', '2.0.0'],
		]);
	});

	test('preserves prefix in generated actions when stripPrefixes is true', () => {
		const version = {
			raw: '^1.0.0',
			prefix: '^',
			version: '1.0.0',
			major: 1,
			minor: 0,
		};

		const result = generateVersionActions(version, '2.0.0', true);

		expect(result).toEqual([
			['Leave as', '^1.0.0'],
			['Change to', '2.0.0'],
			['Change to', '^2.0.0'],
		]);
	});
});
