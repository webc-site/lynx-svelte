import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { DIST_DIR, dirClean, exists, run } from './common.js';
import { sparklingEnsure, SPARKLING_DIR } from './sparklingEnsure.js';

const IOS_DIR = path.join(SPARKLING_DIR, 'ios'),
	WORKSPACE = path.join(IOS_DIR, 'SparklingGo.xcworkspace'),
	OUTPUT_DIR = path.join(DIST_DIR, 'ios'),
	OUTPUT_FILE = path.join(OUTPUT_DIR, 'lynx-svelte-ios-simulator.zip'),
	PODFILE_PATH = path.join(IOS_DIR, 'Podfile'),
	SPARKLING_VENDOR_DIR = path.join(SPARKLING_DIR, 'vendor/sparkling');

const sparkingMainEnsure = async () => {
	if (exists(path.join(SPARKLING_VENDOR_DIR, 'packages'))) return;
	await mkdir(path.dirname(SPARKLING_VENDOR_DIR), { recursive: true });
	await run('git', [
		'clone',
		'--depth=1',
		'--branch',
		'main',
		'https://github.com/tiktok/sparkling.git',
		SPARKLING_VENDOR_DIR
	]);
};

const podspecFind = async (name) => {
	const glob = new Bun.Glob(`**/${name}.podspec`);
	for await (const file of glob.scan({ cwd: SPARKLING_VENDOR_DIR, absolute: true })) {
		return path.dirname(file);
	}
	throw new Error(`Sparkling main podspec not found: ${name}`);
};

const podfilePatch = async () => {
	const sparkling_dir = await podspecFind('Sparkling'),
		method_dir = await podspecFind('SparklingMethod'),
		macro_dir = await podspecFind('SparklingMacro'),
		rel = (dir) => path.relative(IOS_DIR, dir);

	let source = await Bun.file(PODFILE_PATH).text();
	source = source
		.replace(
			"pod 'Sparkling', SPARKLING_VERSION",
			`pod 'Sparkling', :path => '${rel(sparkling_dir)}'`
		)
		.replace(
			"pod 'SparklingMethod', SPARKLING_VERSION",
			`pod 'SparklingMethod', :path => '${rel(method_dir)}'`
		)
		.replace(
			`pod 'Sparkling', :path => '${rel(sparkling_dir)}'`,
			`pod 'Sparkling', :path => '${rel(sparkling_dir)}'\n  pod 'SparklingMacro', :path => '${rel(macro_dir)}'`
		);
	await Bun.write(PODFILE_PATH, source);
};

const buildIos = async () => {
	await sparklingEnsure();
	await sparkingMainEnsure();
	await podfilePatch();
	if (exists(path.join(SPARKLING_DIR, 'Gemfile'))) {
		await run('bundle', ['install'], { cwd: SPARKLING_DIR });
		await run('bundle', ['exec', 'pod', 'install'], { cwd: IOS_DIR });
	} else {
		await run('pod', ['install'], { cwd: IOS_DIR });
	}

	await run(
		'xcodebuild',
		[
			'-workspace',
			WORKSPACE,
			'-scheme',
			'SparklingGo',
			'-configuration',
			'Debug',
			'-sdk',
			'iphonesimulator',
			'-derivedDataPath',
			path.join(IOS_DIR, 'build'),
			'CODE_SIGNING_ALLOWED=NO',
			'build'
		],
		{ cwd: IOS_DIR }
	);

	const app_path = path.join(IOS_DIR, 'build/Build/Products/Debug-iphonesimulator/SparklingGo.app');
	await dirClean(OUTPUT_DIR);
	await run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', app_path, OUTPUT_FILE]);
	console.log(`ios simulator app: ${OUTPUT_FILE}`);
};

if (import.meta.main) await buildIos();

export { buildIos };
