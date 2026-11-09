#!/usr/bin/env -S bun
import path from 'node:path';

const ROOT_DIR = path.resolve(import.meta.dirname, '..'),
	DEMO_DIR = path.join(ROOT_DIR, 'demo'),
	SERVER_PORT = process.argv[2] ?? '4173',
	SERVER_URL = `http://127.0.0.1:${SERVER_PORT}/`;

const build = Bun.spawnSync(['bun', 'run', 'build:web'], {
	cwd: DEMO_DIR,
	stdout: 'inherit',
	stderr: 'inherit'
});

if (build.exitCode !== 0) process.exit(build.exitCode ?? 1);

const server = Bun.spawn(['bun', 'webServe.js', SERVER_PORT], {
	cwd: DEMO_DIR,
	stdout: 'ignore',
	stderr: 'inherit'
});

const serverReady = async () => {
	for (let attempt = 0; attempt < 50; ++attempt) {
		try {
			const response = await fetch(SERVER_URL);
			if (response.ok) return true;
		} catch {
			// server not ready yet
		}
		await Bun.sleep(100);
	}
	return false;
};

if (!(await serverReady())) {
	server.kill();
	console.error('web smoke server did not start');
	process.exit(1);
}

const smoke = Bun.spawnSync(['bun', path.join(ROOT_DIR, 'test/web-smoke.mjs'), SERVER_URL], {
	stdout: 'inherit',
	stderr: 'inherit'
});

server.kill();
process.exitCode = smoke.exitCode ?? 1;
