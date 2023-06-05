import getHighestVersionAtTime from './getHighestVersionAtTime';

describe('getHighestVersionAtTime', () => {
	const versions: Record<string, string> = {
		'0.9.0.alpha': '2021-06-01T00:00:00Z',
		'1.0.0': '2022-01-01T00:00:00Z',
		'2.0.0': '2022-02-01T00:00:00Z',
		'2.1.0': '2022-03-01T00:00:00Z',
		'2.1.5': '2022-03-20T00:00:00Z',
		'3.0.0': '2022-04-01T00:00:00Z',
		'3.1.0': '2022-05-01T00:00:00Z',
	};

	test('highest valid semantic version is returned', () => {
		const datetime = new Date('2022-03-15T00:00:00Z');

		const result = getHighestVersionAtTime(versions, datetime, true);

		expect(result).toBe('2.1.0');
	});

	test('handles when date is identical', () => {
		const datetime = new Date('2022-01-01T00:00:00Z');

		const result = getHighestVersionAtTime(versions, datetime, true);

		expect(result).toBe('1.0.0');
	});

	test('null is returned when there are no valid versions', () => {
		const datetime = new Date('2021-01-01T00:00:00Z');

		const result = getHighestVersionAtTime(versions, datetime, true);

		expect(result).toBeNull();
	});

	test('suffixed version can be returned when enabled', () => {
		const datetime = new Date('2021-09-01T00:00:00Z');

		const result = getHighestVersionAtTime(versions, datetime, false);

		expect(result).toBe('0.9.0.alpha');
	});

	describe('locking', () => {
		test('major', () => {
			const datetime = new Date('2022-05-01T00:00:00Z');

			const result = getHighestVersionAtTime(versions, datetime, true, { current: [2, 0], major: true });

			expect(result).toBe('2.1.5');
		});

		test('minor', () => {
			const datetime = new Date('2022-07-01T00:00:00Z');

			const result = getHighestVersionAtTime(versions, datetime, true, { current: [2, 1], minor: true });

			expect(result).toBe('2.1.5');
		});
	});
});
