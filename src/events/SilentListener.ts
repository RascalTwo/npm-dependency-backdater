import BaseListener from './BaseListener';
import CLIListener from './CLIListener';
import chalk from 'chalk';
import { diff } from 'jest-diff';
import fs from 'fs';

const NOOP = () => undefined;

export default new BaseListener()
	.handle('missing_arguments', CLIListener.getHandle('missing_arguments'))
	.handle('invalid_datetime', CLIListener.getHandle('invalid_datetime'))
	.handle('datetime_in_future', CLIListener.getHandle('datetime_in_future'))
	.handle('run', NOOP)
	.handle('reading_package_file', NOOP)
	.handle('discovering_dependency_map', NOOP)
	.handle('getting_package_version_dates', NOOP)
	.handle('calculated_highest_version', NOOP)
	.handle('prompt_user_for_version_action', CLIListener.getHandle('prompt_user_for_version_action'))
	.handle('dependency_processed', NOOP)
	.handle('dependency_map_processed', NOOP)
	.handle('changes_made', NOOP)
	.handle('make_changes', async ({ packageFilePath, packageJson, dryRun }) => {
		if (dryRun)
			return console.log(
				diff(packageJson.old, packageJson.new, {
					aAnnotation: 'Old Version(s)',
					aColor: text => chalk.red(text),
					bAnnotation: 'New Version(s)',
					bColor: text => chalk.green(text),
				}),
			);

		await fs.promises.writeFile(packageFilePath, JSON.stringify(packageJson.new, undefined, 2));
	});
