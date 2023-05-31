import chalk from 'chalk';
import { diff } from 'jest-diff';
import fs from 'fs';

export async function handleMakeChanges(
	logging: boolean,
	packageFilePath: string,
	packageJson: { old: object; new: object },
	dryRun: boolean,
): Promise<void> {
	if (dryRun)
		return console.log(
			diff(packageJson.old, packageJson.new, {
				aAnnotation: 'Old Version(s)',
				aColor: chalk.red,
				bAnnotation: 'New Version(s)',
				bColor: chalk.green,
			}),
		);

	if (logging) console.log(`Writing changes to ${packageFilePath}...`);
	await fs.promises.writeFile(packageFilePath, JSON.stringify(packageJson.new, undefined, 2));
	if (logging) console.log(`Changes written to ${packageFilePath}.`);
}
