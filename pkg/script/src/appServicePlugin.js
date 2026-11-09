import { LynxTemplatePlugin } from '@lynx-js/template-webpack-plugin';

const APP_SERVICE_NAME = '/app-service.js',
	APP_SERVICE_STAGE = 300,
	APP_SERVICE_SOURCE =
		"(function(){function n({tt}){return {init:function(){}};}return {init:n};})()";

const appServicePlugin = () => ({
	apply(compiler) {
		compiler.hooks.thisCompilation.tap('LynxSvelteAppService', (compilation) => {
			const hooks = LynxTemplatePlugin.getLynxTemplatePluginHooks(compilation);
			hooks.beforeEncode.tapPromise(
				{ name: 'LynxSvelteAppService', stage: APP_SERVICE_STAGE },
				async (args) => {
					args.encodeData.manifest[APP_SERVICE_NAME] = APP_SERVICE_SOURCE;
					return args;
				}
			);
		});
	}
});

export { appServicePlugin, APP_SERVICE_SOURCE };
