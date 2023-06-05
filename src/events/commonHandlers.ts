import chalk from 'chalk';
import { diff } from 'jest-diff';
import fs from 'fs';

export async function handleMakeChanges(
	output: ((message: string) => void) | undefined,
	packageFilePath: string,
	packageJson: { old: object; new: object },
	dryRun: boolean,
): Promise<void> {
	if (dryRun)
		return output?.(
			diff(packageJson.old, packageJson.new, {
				aAnnotation: 'Old Version(s)',
				aColor: chalk.red,
				bAnnotation: 'New Version(s)',
				bColor: chalk.green,
			}) as string,
		);

	output?.(`Writing changes to "${packageFilePath}"...`);
	await fs.promises.writeFile(packageFilePath, JSON.stringify(packageJson.new, undefined, 2));
	output?.(`Changes written to "${packageFilePath}".`);
}
