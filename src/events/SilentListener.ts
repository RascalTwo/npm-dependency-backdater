import BaseListener from './BaseListener';
import CLIListener from './CLIListener';
import { handleMakeChanges } from './commonHandlers';

export default {
	...BaseListener,

	handleMissingArguments: CLIListener.handleMissingArguments,

	handleInvalidDatetime: CLIListener.handleInvalidDatetime,

	handleDatetimeInFuture: CLIListener.handleDatetimeInFuture,

	handleNPMRegistryError: CLIListener.handleNPMRegistryError,

	handlePromptUserForVersionAction: CLIListener.handlePromptUserForVersionAction,

	async handleMakeChanges(oldPackageJson: object, newPackageJson: object) {
		await this.delay();
		return handleMakeChanges.call(
			this,
			undefined,
			this.packageFilePath,
			{ old: oldPackageJson, new: newPackageJson },
			!!this.options.dryRun,
		);
	},
};
