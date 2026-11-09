import path from 'node:path';
import { ROOT_DIR, run, runCapture, exists, SVELTE_DIR } from './common.js';

const PR_REF = 'pr-18042';

const prepareSvelte = async () => {
	if (!exists(path.join(SVELTE_DIR, 'package.json'))) {
		throw new Error('svelte checkout missing; checkout sveltejs/svelte into ../svelte first');
	}

	const [ref_code] = await runCapture('git', ['rev-parse', '--verify', PR_REF], { cwd: SVELTE_DIR });
	if (ref_code !== 0) {
		await run('git', ['fetch', 'origin', `pull/18042/head:${PR_REF}`], { cwd: SVELTE_DIR });
	}

	const [merged_code] = await runCapture('git', ['merge-base', '--is-ancestor', PR_REF, 'HEAD'], {
		cwd: SVELTE_DIR
	});
	if (merged_code !== 0) {
		await run('git', ['config', 'user.name', 'lynx-svelte'], { cwd: SVELTE_DIR });
		await run('git', ['config', 'user.email', 'lynx-svelte@users.noreply.github.com'], {
			cwd: SVELTE_DIR
		});
		await run('git', ['merge', '--no-ff', PR_REF, '-m', 'Merge sveltejs/svelte#18042'], {
			cwd: SVELTE_DIR
		});
	}

	await run('bun', ['x', 'pnpm', 'install', '--frozen-lockfile'], { cwd: SVELTE_DIR });

	const svelte_pkg = path.join(SVELTE_DIR, 'packages/svelte');
	await run('bun', ['x', 'rollup', '-c'], { cwd: svelte_pkg });
	await run('bun', ['scripts/process-messages'], { cwd: svelte_pkg });
	await run('bun', ['scripts/generate-types.js'], { cwd: svelte_pkg });
	await run('bun', ['scripts/check-treeshakeability.js'], { cwd: svelte_pkg });

	await run('bun', ['install', '--frozen-lockfile'], { cwd: ROOT_DIR });
};

if (import.meta.main) await prepareSvelte();

export { prepareSvelte };
