import path from 'node:path';
import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const ROOT_DIR = path.resolve(import.meta.dirname, '..'),
	DEMO_DIR = path.join(ROOT_DIR, 'demo'),
	APP_DIR = path.join(ROOT_DIR, 'app'),
	DIST_DIR = path.join(ROOT_DIR, 'dist'),
	SVELTE_DIR = path.resolve(ROOT_DIR, '../svelte');

const run = async (cmd, args = [], options = {}) => {
	const child = Bun.spawn([cmd, ...args], {
		cwd: ROOT_DIR,
		stdout: 'inherit',
		stderr: 'inherit',
		env: process.env,
		...options
	});
	const exit_code = await child.exited;
	if (exit_code !== 0) throw new Error(`${cmd} ${args.join(' ')} exited with ${exit_code}`);
};

const runCapture = async (cmd, args = [], options = {}) => {
	const child = Bun.spawn([cmd, ...args], {
		cwd: ROOT_DIR,
		stdout: 'pipe',
		stderr: 'pipe',
		env: process.env,
		...options
	});
	const [stdout, stderr, exit_code] = await Promise.all([
		new Response(child.stdout).text(),
		new Response(child.stderr).text(),
		child.exited
	]);
	return [exit_code, stdout.trim(), stderr.trim()];
};

const dirClean = async (dir) => {
	await rm(dir, { recursive: true, force: true });
	await mkdir(dir, { recursive: true });
};

const copyDir = (from, to) => cp(from, to, { recursive: true });

const zipDir = async (dir, out_file) => {
	await rm(out_file, { force: true });
	if (process.platform === 'win32') {
		await run('7z', ['a', '-tzip', out_file, '.'], { cwd: dir });
		return;
	}
	await run('zip', ['-r', '-q', out_file, '.'], { cwd: dir });
};

const exists = (file) => existsSync(file);

const targetArg = () => {
	const arg = process.argv.find((item) => item.startsWith('--target='));
	return arg == null ? null : arg.slice('--target='.length);
};

export {
	ROOT_DIR,
	DEMO_DIR,
	APP_DIR,
	DIST_DIR,
	SVELTE_DIR,
	run,
	runCapture,
	dirClean,
	copyDir,
	zipDir,
	exists,
	targetArg
};
