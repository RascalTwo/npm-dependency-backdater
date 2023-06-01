import generateVersionActions from './generateVersionActions';

import parseRawVersion from './parseRawVersion';

const parseRawVersionMock = parseRawVersion as jest.MockedFunction<typeof parseRawVersion>;

jest.mock('./parseRawVersion');

describe('generateVersionActions', () => {
	it('should return the correct actions', () => {
		const result = generateVersionActions(
			{
				raw: '^1.0.0',
				prefix: '^',
				version: '1.0.0',
			},
			'2.0.0',
		);

		expect(result).toEqual([
			['Leave as', '^1.0.0'],
			['Change to', '^2.0.0'],
			['Change to', '2.0.0'],
		]);
	});

	it('should return the correct actions when there is no semver prefix', () => {
		const result = generateVersionActions(
			{
				raw: '1.0.0',
				prefix: null,
				version: '1.0.0',
			},
			'2.0.0',
		);

		expect(result).toEqual([
			['Leave as', '1.0.0'],
			['Change to', '2.0.0'],
		]);
	});

	it('should return the correct actions when stripPrefixes is false', () => {
		const result = generateVersionActions(
			{
				raw: '^1.0.0',
				prefix: '^',
				version: '1.0.0',
			},
			'2.0.0',
			true,
		);

		expect(result).toEqual([
			['Leave as', '^1.0.0'],
			['Change to', '2.0.0'],
			['Change to', '^2.0.0'],
		]);
	});
});
