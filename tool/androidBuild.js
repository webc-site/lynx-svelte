import path from 'node:path';
import { copyFile } from 'node:fs/promises';
import { DIST_DIR, dirClean, run } from './common.js';
import { sparklingEnsure, SPARKLING_DIR } from './sparklingEnsure.js';

const ANDROID_DIR = path.join(SPARKLING_DIR, 'android'),
	OUTPUT_DIR = path.join(DIST_DIR, 'android');

const buildAndroid = async () => {
	await sparklingEnsure();

	const gradlew = path.join(ANDROID_DIR, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
	if (process.platform !== 'win32') await run('chmod', ['+x', gradlew]);
	await run(gradlew, ['assembleDebug', '--no-daemon'], {
		cwd: ANDROID_DIR,
		env: { ...process.env, SPARKLING_USE_NATIVE_ASSETS: 'true' }
	});

	await dirClean(OUTPUT_DIR);
	await copyFile(
		path.join(ANDROID_DIR, 'app/build/outputs/apk/debug/app-debug.apk'),
		path.join(OUTPUT_DIR, 'lynx-svelte-android.apk')
	);
	console.log(`android apk: ${path.join(OUTPUT_DIR, 'lynx-svelte-android.apk')}`);
};

if (import.meta.main) await buildAndroid();

export { buildAndroid };
