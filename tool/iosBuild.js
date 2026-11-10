import path from 'node:path';
import { DIST_DIR, dirClean, exists, run } from './common.js';
import { sparklingEnsure, SPARKLING_DIR } from './sparklingEnsure.js';

const IOS_DIR = path.join(SPARKLING_DIR, 'ios'),
	WORKSPACE = path.join(IOS_DIR, 'SparklingGo.xcworkspace'),
	OUTPUT_DIR = path.join(DIST_DIR, 'ios'),
	OUTPUT_FILE = path.join(OUTPUT_DIR, 'lynx-svelte-ios-simulator.zip'),
	SPARKLING_SOURCE_DIR = path.join(
		IOS_DIR,
		'Pods/Sparkling/packages/sparkling-sdk/ios/Sparkling'
	),
	SPARKLING_PATCH_LI = [
		['Service/LynxService/SPKLynxService.swift', 'SPKLynxService'],
		['Application/Container/Resource/SPKResourceLoaderImpl.swift', 'SPKResourceLoaderImpl']
	];

const sparklingPatch = async () => {
	for (const [rel_path, class_name] of SPARKLING_PATCH_LI) {
		const file_path = path.join(SPARKLING_SOURCE_DIR, rel_path);
		if (!exists(file_path)) continue;
		let source = await Bun.file(file_path).text();
		if (!source.includes('SPK_PRE_SVC')) continue;
		source = source.replace(
			/@_used\n@_section\("__DATA, SPK_PRE_SVC"\)\nnonisolated\(unsafe\)\nprivate let [^\n]+\n/,
			''
		);
		source = source.replace(
			'@objcMembers\n',
			`#spk_register(class: "${class_name}")\n@objcMembers\n`
		);
		await Bun.write(file_path, source);
	}
};

const buildIos = async () => {
	await sparklingEnsure();
	if (exists(path.join(SPARKLING_DIR, 'Gemfile'))) {
		await run('bundle', ['install'], { cwd: SPARKLING_DIR });
		await run('bundle', ['exec', 'pod', 'install'], { cwd: IOS_DIR });
	} else {
		await run('pod', ['install'], { cwd: IOS_DIR });
	}
	await sparklingPatch();

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
