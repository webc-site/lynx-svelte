import path from 'node:path';
import { LynxEncodePlugin, LynxTemplatePlugin } from '@lynx-js/template-webpack-plugin';
import { WebWebpackPlugin } from '@lynx-js/web-webpack-plugin';
import { lepusCompatPlugin } from './lepusPlugin.js';
import { mainThreadPlugin } from './mainThreadPlugin.js';
import { moduleWrapPlugin } from './moduleWrapPlugin.js';
import { webManifestFallbackPlugin } from './webBundlePlugin.js';

const CUSTOM_RENDERER_ID = '@lynx-svelte/core/renderer',
	BUNDLE_NAME = 'main.lynx.bundle',
	WEB_BUNDLE_NAME = 'main.web.bundle',
	INTERMEDIATE_NAME = 'main',
	MAIN_THREAD_ASSET_NAME = 'main-thread.js',
	BACKGROUND_ENTRY = path.join(import.meta.dirname, 'backgroundEntry.js'),
	SWC_LOADER = {
		loader: 'builtin:swc-loader',
		options: {
			jsc: {
				target: 'es2015'
			}
		}
	};

const svelteRule = () => ({
	test: /\.svelte$/,
	use: [
		{
			loader: 'svelte-loader',
			options: {
				compilerOptions: {
					dev: false,
					experimental: {
						customRenderer: CUSTOM_RENDERER_ID
					}
				},
				emitCss: true,
				hotReload: false
			}
		}
	]
});

const cssRule = () => ({
	test: /\.css$/,
	type: 'css/auto'
});

const baseConfig = (entry, context_dir) => {
	const entry_path = path.isAbsolute(entry) ? entry : path.resolve(context_dir, entry);

	return {
		entry: {
			main: entry_path
		},
		devServer: {
			hot: false
		},
		resolve: {
			extensions: ['.mjs', '.js', '.ts', '.json', '.svelte'],
			mainFields: ['svelte', 'browser', 'module', 'main'],
			conditionNames: ['browser', 'import', 'module', 'default']
		},
		module: {
			rules: [svelteRule(), cssRule()]
		},
		output: {
			path: path.resolve(context_dir, 'dist'),
			publicPath: '/'
		},
		cache: false,
		experiments: {
			css: true
		}
	};
};

const rspackConfig = (entry, context_dir) => {
	const config = baseConfig(entry, context_dir),
		entry_path = path.isAbsolute(entry) ? entry : path.resolve(context_dir, entry),
		svelte_rule = svelteRule();

	svelte_rule.use.unshift(SWC_LOADER);
	config.entry = {
		main: BACKGROUND_ENTRY,
		'main-thread': entry_path
	};
	config.module.rules = [
		svelte_rule,
		cssRule(),
		{ test: /\.(js|mjs)$/, use: [SWC_LOADER] }
	];

	return {
		...config,
		plugins: [
			lepusCompatPlugin(),
			mainThreadPlugin(MAIN_THREAD_ASSET_NAME),
			moduleWrapPlugin('main.js', '/main.js'),
			new LynxEncodePlugin(),
			new LynxTemplatePlugin({
				filename: BUNDLE_NAME,
				intermediate: INTERMEDIATE_NAME
			})
		]
	};
};

const rspackWebConfig = (entry, context_dir) => {
	const config = baseConfig(entry, context_dir);
	return {
		...config,
		plugins: [
			lepusCompatPlugin(),
			new LynxTemplatePlugin({
				filename: WEB_BUNDLE_NAME,
				intermediate: INTERMEDIATE_NAME
			}),
			new WebWebpackPlugin(),
			webManifestFallbackPlugin()
		]
	};
};

export {
	rspackConfig,
	rspackWebConfig,
	CUSTOM_RENDERER_ID,
	BUNDLE_NAME,
	WEB_BUNDLE_NAME,
	INTERMEDIATE_NAME
};
