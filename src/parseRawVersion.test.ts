import parseRawVersion, { SUPPORTED_PREFIXES } from './parseRawVersion';

describe('parseRawVersion', () => {
	test.each(SUPPORTED_PREFIXES)('should parse %s', prefix => {
		expect(parseRawVersion(`${prefix}1.2.3`)).toEqual([prefix, '1.2.3']);
	});

	test('should not handle unsupported prefixes', () => {
		expect(parseRawVersion('1.2.3')).toEqual([null, '1.2.3']);
	});

	test('should not handle unsupported prefixes', () => {
		expect(parseRawVersion('random1.2.3')).toEqual([null, 'random1.2.3']);
	});
});
