import { SUPPORTED_VERSION_PREFIXES } from './constants';

import parseRawVersion from './parseRawVersion';

describe('parseRawVersion', () => {
	test.each(SUPPORTED_VERSION_PREFIXES)('supports "%s" prefix', prefix => {
		const raw = `${prefix}1.2.3`;

		const result = parseRawVersion(raw);

		expect(result).toEqual({
			raw,
			prefix,
			version: '1.2.3',
			major: 1,
			minor: 2,
		});
	});

	test("version is raw when there's no prefix", () => {
		const raw = '1.2.3';

		const result = parseRawVersion(raw);

		expect(result).toEqual({
			raw,
			prefix: null,
			version: raw,
			major: 1,
			minor: 2,
		});
	});

	test('unsupported prefixes are ignored', () => {
		const raw = 'random1.2.3';

		const result = parseRawVersion(raw);

		expect(result).toEqual({
			raw,
			prefix: null,
			version: raw,
			major: 1,
			minor: 2,
		});
	});
});
