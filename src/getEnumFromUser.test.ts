import getEnumFromUser from './getEnumFromUser';
import type readline from 'readline';

const readlineInterface = {
	question: jest.fn() as jest.Mock<readline.Interface['question']>,
	close: jest.fn(),
} as unknown as jest.Mocked<readline.Interface>;

jest.mock('readline', () => ({
	createInterface: () => readlineInterface,
}));

const mockQuestion = (answer: string) =>
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	readlineInterface.question.mockImplementationOnce((query: string, callback: (answer: string) => void) => {
		callback(answer);
	});

describe('getEnumFromUser', () => {
	it('should return the chosen value', async () => {
		mockQuestion('b');

		const result = await getEnumFromUser('a', 'b');

		expect(result).toBe('b');
		expect(readlineInterface.question).toHaveBeenCalled();
	});

	it('works with numbers', async () => {
		mockQuestion('1');

		const result = await getEnumFromUser(1, 2);

		expect(result).toBe(1);
		expect(readlineInterface.question).toHaveBeenCalled();
	});

	it('should handle if the user enters an invalid value', async () => {
		jest.spyOn(console, 'log').mockImplementationOnce(() => undefined);
		mockQuestion('foo');
		mockQuestion('1');

		const result = await getEnumFromUser(0, 1);

		expect(result).toBe(1);
		expect(readlineInterface.question).toHaveBeenCalledTimes(2);
		expect(console.log).toHaveBeenCalledWith('Please enter one of: 0, 1');
	});

	it('should throw if not provided any values', async () => {
		await expect(getEnumFromUser()).rejects.toThrow('Must provide at least one acceptable value');
	});
});
