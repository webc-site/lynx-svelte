import path from 'node:path';
import { copyFile, mkdir } from 'node:fs/promises';
import { APP_DIR, DEMO_DIR, dirClean, exists, run } from './common.js';

const SPARKLING_DIR = path.join(APP_DIR, 'sparkling'),
	SPARKLING_CLI = 'create-sparkling-app@2.0.1',
	APP_NAMESPACE = 'dev.lynxsvelte.demo';

const sparklingEnsure = async () => {
	if (!exists(path.join(SPARKLING_DIR, 'package.json'))) {
		await run(
			'bun',
			[
				'x',
				SPARKLING_CLI,
				'sparkling',
				'--yes',
				'--force',
				'--no-install',
				'--no-git',
				'--pm',
				'bun',
				'--namespace',
				APP_NAMESPACE
			],
			{ cwd: APP_DIR }
		);
	}

	await run('bun', ['run', 'build'], { cwd: DEMO_DIR });
	await run('bun', ['install'], { cwd: SPARKLING_DIR });

	const bundle_path = path.join(DEMO_DIR, 'dist/main.lynx.bundle'),
		android_assets = path.join(SPARKLING_DIR, 'android/app/src/main/assets'),
		ios_assets = path.join(SPARKLING_DIR, 'ios/SparklingGo/SparklingGo/Resources/Assets');

	await dirClean(path.join(SPARKLING_DIR, 'dist'));
	await copyFile(bundle_path, path.join(SPARKLING_DIR, 'dist/main.lynx.bundle'));

	await mkdir(android_assets, { recursive: true });
	await copyFile(bundle_path, path.join(android_assets, 'main.lynx.bundle'));

	await mkdir(ios_assets, { recursive: true });
	await copyFile(bundle_path, path.join(ios_assets, 'main.lynx.bundle'));

	console.log(`sparkling bundle staged: ${bundle_path}`);
};

export { sparklingEnsure, SPARKLING_DIR };
