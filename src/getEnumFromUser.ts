import readline from 'readline';

const question = (query: string) =>
	new Promise<string>(resolve => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question(query, answer => {
			rl.close();
			resolve(answer);
		});
	});

export default async function getEnumFromUser<T extends Array<string | number>>(...acceptableValues: T) {
	if (!acceptableValues.length) throw new Error('Must provide at least one acceptable value');

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const response = await question('>');

		const responseNumber = parseFloat(response);
		const includesResponseNumber = acceptableValues.includes(responseNumber);

		if (acceptableValues.includes(response) || includesResponseNumber) {
			return includesResponseNumber ? responseNumber : (response as T[number]);
		} else {
			console.log(`Please enter one of: ${acceptableValues.join(', ')}`);
		}
	}
}
