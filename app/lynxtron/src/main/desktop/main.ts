import { app, LynxWindow } from '@lynx-js/lynxtron';
import path from 'node:path';
import { LYNX_BUNDLE_PATH } from './vendorPaths';

const main = async () => {
	await app.whenReady();

	const window = new LynxWindow({
		width: 1100,
		height: 1400,
		title: 'Lynx Svelte',
		lynxPreference: {
			preload: path.join(__dirname, 'preload.js')
		}
	});

	window.show();
	await window.loadFile(LYNX_BUNDLE_PATH);
};

main();
