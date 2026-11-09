import { LynxTemplatePlugin } from '@lynx-js/template-webpack-plugin';

const MANIFEST_ENTRY = '/app-service.js';

const webManifestFallbackPlugin = () => ({
	apply(compiler) {
		compiler.hooks.thisCompilation.tap('LynxSvelteWebManifestFallback', (compilation) => {
			const hooks = LynxTemplatePlugin.getLynxTemplatePluginHooks(compilation);
			hooks.beforeEncode.tap(
				{ name: 'LynxSvelteWebManifestFallback', stage: 99 },
				(options) => {
					const manifest = options.encodeData.manifest ?? {};
					if (Object.keys(manifest).length === 0) {
						options.encodeData.manifest = { [MANIFEST_ENTRY]: ' ' };
					}
					return options;
				}
			);
		});
	}
});

export { webManifestFallbackPlugin, MANIFEST_ENTRY };
