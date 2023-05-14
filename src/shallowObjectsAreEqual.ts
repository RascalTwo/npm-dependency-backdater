export default function shallowObjectsAreEqual(a: Record<string, unknown>, b: Record<string, unknown>) {
	if (a === b) return true;

	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);

	if (aKeys.length !== bKeys.length) return false;

	return aKeys.every(key => key in b && a[key] === b[key]);
}
