import { CLIListener, main } from 'npm-dependency-backdater';
import type { BaseEventsListener } from 'npm-dependency-backdater';

const CustomEventListener: BaseEventsListener = {
	...CLIListener,
	async handleRunStart() {
		console.log('CustomEventListener: handleRunStart');
	},
	async handleRunFinish() {
		console.log('CustomEventListener: handleRunFinish');
	},
};

main('../../package.json', new Date().toISOString(), { listener: CustomEventListener });
