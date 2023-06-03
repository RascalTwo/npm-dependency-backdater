import BaseListener from './BaseListener';
import CLIListener from './CLIListener';
import { handleMakeChanges } from './commonHandlers';

export default {
	...BaseListener,

	handleMissingArguments: CLIListener.handleMissingArguments,

	handleInvalidDatetime: CLIListener.handleInvalidDatetime,

	handleDatetimeInFuture: CLIListener.handleDatetimeInFuture,

	handlePromptUserForVersionAction: CLIListener.handlePromptUserForVersionAction,

	handleMakeChanges(oldPackageJson: object, newPackageJson: object) {
		return handleMakeChanges.call(
			this,
			false,
			this.packageFilePath,
			{ old: oldPackageJson, new: newPackageJson },
			!!this.options.dryRun,
		);
	},
};
