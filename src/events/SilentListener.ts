import type { AllEventsListener } from './BaseListener';
import BaseListener from './BaseListener';
import CLIListener from './CLIListener';
import { handleMakeChanges } from './commonHandlers';

export default {
	...BaseListener,

	handleMissingArguments: CLIListener.handleMissingArguments,

	handleInvalidDatetime: CLIListener.handleInvalidDatetime,

	handleDatetimeInFuture: CLIListener.handleDatetimeInFuture,

	handlePromptUserForVersionAction: CLIListener.handlePromptUserForVersionAction,

	handleMakeChanges: handleMakeChanges.bind(null, false),
} as AllEventsListener;
