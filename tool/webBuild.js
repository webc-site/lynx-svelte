import path from 'node:path';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { DEMO_DIR, DIST_DIR, ROOT_DIR, copyDir, dirClean, run, zipDir } from './common.js';

const WEB_DIR = path.join(DIST_DIR, 'web'),
	WEB_CORE_DIR = path.join(ROOT_DIR, 'node_modules/@lynx-js/web-core/dist/client_prod/static'),
	TEMPLATE_FILE = path.join(ROOT_DIR, 'tool/template/index.html'),
	WEB_ZIP = path.join(DIST_DIR, 'lynx-svelte-web.zip');

const webBuild = async () => {
	await run('bun', ['run', 'build:web'], { cwd: DEMO_DIR });
	await dirClean(WEB_DIR);

	await copyFile(path.join(DEMO_DIR, 'dist/main.web.bundle'), path.join(WEB_DIR, 'main.web.bundle'));
	await copyDir(WEB_CORE_DIR, path.join(WEB_DIR, 'static'));
	await writeFile(path.join(WEB_DIR, 'index.html'), await readFile(TEMPLATE_FILE, 'utf8'));

	await zipDir(WEB_DIR, WEB_ZIP);
	console.log(`web site: ${WEB_DIR}`);
	console.log(`web zip: ${WEB_ZIP}`);
};

if (import.meta.main) await webBuild();

export { webBuild, WEB_DIR, WEB_ZIP };
