import { SUPPORTED_VERSION_PREFIXES } from './constants';
import parseRawVersion from './parseRawVersion';

describe('parseRawVersion', () => {
	test.each(SUPPORTED_VERSION_PREFIXES)('should parse %s', prefix => {
		const raw = `${prefix}1.2.3`;

		const result = parseRawVersion(raw);

		expect(result).toEqual({
			raw,
			prefix,
			version: '1.2.3',
		});
	});

	test('should not handle unsupported prefixes', () => {
		const raw = '1.2.3';

		const result = parseRawVersion(raw);

		expect(result).toEqual({
			raw,
			prefix: null,
			version: raw,
		});
	});

	test('should not handle unsupported prefixes', () => {
		const raw = 'random1.2.3';

		const result = parseRawVersion(raw);

		expect(result).toEqual({
			raw,
			prefix: null,
			version: raw,
		});
	});
});
