import { contextBridge } from '@lynx-js/lynxtron/context-bridge';

contextBridge.exposeInLynxBTS({
	echo: (message) => `Echo from Lynxtron: ${message}`
});
