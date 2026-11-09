import path from 'node:path';
import { copyFile } from 'node:fs/promises';
import { DEMO_DIR, DIST_DIR, run, targetArg } from './common.js';
import { lynxtronEnsure, LYNXTRON_DIR } from './lynxtronEnsure.js';

const TARGET_MAP = {
	mac: 'mac',
	win: 'win',
	linux: 'linux'
};

const buildDesktop = async (target) => {
	const platform = TARGET_MAP[target];
	if (platform == null) throw new Error(`unknown desktop target: ${target}`);

	await run('bun', ['run', 'build'], { cwd: DEMO_DIR });
	await copyFile(
		path.join(DEMO_DIR, 'dist/main.lynx.bundle'),
		path.join(LYNXTRON_DIR, 'main.lynx.bundle')
	);

	await lynxtronEnsure();
	await run('bun', ['x', 'rsbuild', 'build', '--environment', 'desktop'], { cwd: LYNXTRON_DIR });
	await run('bun', ['x', 'lynxtron-builder', `--${platform}`, '--publish', 'never'], {
		cwd: LYNXTRON_DIR,
		env: { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: 'false' }
	});

	console.log(`desktop (${target}) artifacts: ${path.join(DIST_DIR, 'desktop')}`);
};

const target = targetArg() ?? (process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'win' : 'linux');
if (import.meta.main) await buildDesktop(target);

export { buildDesktop };
