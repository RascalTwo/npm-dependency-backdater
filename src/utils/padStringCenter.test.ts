import padStringCenter from './padStringCenter';

describe('padStringCenter', () => {
	test('pads string to the left and right', () => {
		expect(padStringCenter('test', 10)).toBe('   test   ');
		expect(padStringCenter('test', 8)).toBe('  test  ');
	});

	test('extra space goes to the left when padding for an odd-length', () => {
		expect(padStringCenter('test', 11)).toBe('   test    ');
		expect(padStringCenter('test', 9)).toBe('  test   ');
	});

	test('returns unmodified string when length is already met', () => {
		expect(padStringCenter('test', 4)).toBe('test');
		expect(padStringCenter('test', 2)).toBe('test');
	});
});
