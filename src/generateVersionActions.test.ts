import generateVersionActions from './generateVersionActions';

import parseRawVersion from './parseRawVersion';

const parseRawVersionMock = parseRawVersion as jest.MockedFunction<typeof parseRawVersion>;

jest.mock('./parseRawVersion');

describe('generateVersionActions', () => {
	it('should return the correct actions', () => {
		parseRawVersionMock.mockReturnValueOnce(['^', '1.0.0']);

		const result = generateVersionActions('1.0.0', '2.0.0');

		expect(result).toEqual([
			['Leave as', '1.0.0'],
			['Change to', '^2.0.0'],
			['Change to', '2.0.0'],
		]);
	});

	it('should return the correct actions when there is no semver prefix', () => {
		parseRawVersionMock.mockReturnValueOnce([null, '1.0.0']);

		const result = generateVersionActions('1.0.0', '2.0.0');

		expect(result).toEqual([
			['Leave as', '1.0.0'],
			['Change to', '2.0.0'],
		]);
	});

	it('should return the correct actions when stripPrefixes is false', () => {
		parseRawVersionMock.mockReturnValueOnce(['^', '1.0.0']);

		const result = generateVersionActions('1.0.0', '2.0.0', { stripPrefixes: true });

		expect(result).toEqual([
			['Leave as', '1.0.0'],
			['Change to', '2.0.0'],
			['Change to', '^2.0.0'],
		]);
	});
});
