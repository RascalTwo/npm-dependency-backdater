import getEnumFromUser from './utils/getEnumFromUser';

import promptUserForVersionAction from './utils/promptUserForVersionAction';

const getEnumFromUserMock = getEnumFromUser as jest.MockedFunction<typeof getEnumFromUser>;

jest.mock('./utils/getEnumFromUser');

describe('promptUserForVersionAction', () => {
	test('chosen value is returned', async () => {
		const log = jest.fn();
		getEnumFromUserMock.mockResolvedValueOnce(1);

		const result = await promptUserForVersionAction(
			'foo',
			[
				['install', '1.0.0'],
				['upgrade', '2.0.0'],
			],
			log,
		);

		expect(result).toBe('2.0.0');
		expect(getEnumFromUserMock).toHaveBeenCalledWith(0, 1);
		expect(log).toHaveBeenCalledWith('Choose action for foo:');
	});

	test('version actions are logged with numeric prefix', async () => {
		const log = jest.fn();
		getEnumFromUserMock.mockResolvedValueOnce(0);

		await promptUserForVersionAction(
			'foo',
			[
				['install', '1.0.0'],
				['upgrade', '2.0.0'],
			],
			log,
		);

		expect(log).toHaveBeenCalledWith('0 - install 1.0.0');
		expect(log).toHaveBeenCalledWith('1 - upgrade 2.0.0');
	});

	test('only option is returned if no others exist', async () => {
		const log = jest.fn();

		const result = await promptUserForVersionAction('foo', [['install', '1.0.0']], log);

		expect(result).toBe('1.0.0');
		expect(getEnumFromUserMock).not.toHaveBeenCalled();
		expect(log).not.toHaveBeenCalled();
	});

	test('console.log is the default logger', async () => {
		jest.spyOn(console, 'log').mockImplementation(() => undefined);
		getEnumFromUserMock.mockResolvedValueOnce(1);

		const result = await promptUserForVersionAction('foo', [
			['install', '1.0.0'],
			['upgrade', '2.0.0'],
		]);

		expect(result).toBe('2.0.0');
		expect(getEnumFromUserMock).toHaveBeenCalledWith(0, 1);
		expect(console.log).toHaveBeenCalledWith('Choose action for foo:');
	});
});
