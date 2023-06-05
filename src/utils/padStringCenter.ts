export default function padStringCenter(str: string, length: number) {
	const leftPad = Math.floor((length - str.length) / 2);
	const rightPad = length - str.length - leftPad;
	return ' '.repeat(Math.max(0, leftPad)) + str + ' '.repeat(Math.max(0, rightPad));
}
