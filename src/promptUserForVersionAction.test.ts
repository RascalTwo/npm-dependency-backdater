import getEnumFromUser from './getEnumFromUser';

import promptUserForVersionAction from './promptUserForVersionAction';

const getEnumFromUserMock = getEnumFromUser as jest.MockedFunction<typeof getEnumFromUser>;

jest.mock('./getEnumFromUser');

describe('promptUserForVersionAction', () => {
	it('should return the chosen value', async () => {
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

	it('logs each version action with a numeric prefix', async () => {
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

	it("instantly returns the only option if there's only one", async () => {
		const log = jest.fn();

		const result = await promptUserForVersionAction('foo', [['install', '1.0.0']], log);

		expect(result).toBe('1.0.0');
		expect(getEnumFromUserMock).not.toHaveBeenCalled();
		expect(log).not.toHaveBeenCalled();
	});

	it('should use console.log if no log is provided', async () => {
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
