import path from 'node:path';
import { cp, mkdir, rename } from 'node:fs/promises';
import { APP_DIR, exists, run } from './common.js';

const LYNXTRON_DIR = path.join(APP_DIR, 'lynxtron'),
	LYNXTRON_PACKAGE_DIR = path.join(LYNXTRON_DIR, 'node_modules/@lynx-js/lynxtron'),
	RUNTIME_DIR = path.join(LYNXTRON_PACKAGE_DIR, 'dist/devtool'),
	BUILDER_RUNTIME_DIR = path.join(LYNXTRON_PACKAGE_DIR, 'dist/builder'),
	EXECUTABLE_PATH = {
		darwin: 'lynxtron.app/Contents/MacOS/lynxtron',
		linux: 'lynxtron',
		win32: 'lynxtron.exe'
	};

const runtimePackageName = (platform, arch) => {
	if (platform === 'darwin') return `@lynx-js/lynxtron-runtime-darwin-${arch}-devtool`;
	if (platform === 'win32') return '@lynx-js/lynxtron-runtime-win32-x64-devtool';
	return '@lynx-js/lynxtron-runtime-linux-x64-devtool';
};

const prepareBuilderRuntime = async () => {
	if (process.platform !== 'darwin') {
		if (!exists(BUILDER_RUNTIME_DIR)) {
			await cp(RUNTIME_DIR, BUILDER_RUNTIME_DIR, { recursive: true });
		}
		return;
	}

	const builder_app = path.join(BUILDER_RUNTIME_DIR, 'Lynxtron.app');
	if (exists(builder_app)) return;

	await cp(RUNTIME_DIR, BUILDER_RUNTIME_DIR, { recursive: true });
	await rename(path.join(BUILDER_RUNTIME_DIR, 'lynxtron.app'), builder_app);
	await rename(
		path.join(builder_app, 'Contents/MacOS/lynxtron'),
		path.join(builder_app, 'Contents/MacOS/Lynxtron')
	);
};

const lynxtronEnsure = async () => {
	await run('bun', ['install'], {
		cwd: LYNXTRON_DIR,
		env: { ...process.env, LYNXTRON_SKIP_DOWNLOAD: '1' }
	});

	const executable_path = path.join(RUNTIME_DIR, EXECUTABLE_PATH[process.platform]);
	if (exists(executable_path)) {
		await prepareBuilderRuntime();
		return;
	}

	const runtime_package = path.join(
			LYNXTRON_DIR,
			'node_modules',
			runtimePackageName(process.platform, process.arch)
		),
		runtime_zip = path.join(runtime_package, 'runtime.zip');

	if (!exists(runtime_zip)) {
		throw new Error(`Lynxtron runtime archive missing: ${runtime_zip}`);
	}

	await mkdir(RUNTIME_DIR, { recursive: true });

	if (process.platform === 'win32') {
		await run('7z', ['x', runtime_zip, `-o${RUNTIME_DIR}`, '-y']);
	} else {
		await run('unzip', ['-q', '-o', runtime_zip, '-d', RUNTIME_DIR]);
	}

	const upper_app = path.join(RUNTIME_DIR, 'Lynxtron.app');
	if (exists(upper_app)) await rename(upper_app, path.join(RUNTIME_DIR, 'lynxtron.app'));

	if (!exists(executable_path)) {
		throw new Error(`Lynxtron runtime executable missing: ${executable_path}`);
	}

	await prepareBuilderRuntime();
};

export { lynxtronEnsure, LYNXTRON_DIR };
