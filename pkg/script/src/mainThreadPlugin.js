const MAIN_THREAD_FLAG = 'lynx:main-thread',
	MAIN_ASSET_NAME = 'main.js';

const mainThreadPlugin = (asset_name = MAIN_ASSET_NAME) => ({
	apply(compiler) {
		compiler.hooks.thisCompilation.tap('LynxSvelteMainThread', (compilation) => {
			compilation.hooks.processAssets.tap('LynxSvelteMainThread', () => {
				const asset = compilation.getAsset(asset_name);
				if (asset == null) return;
				compilation.updateAsset(asset.name, asset.source, {
					...asset.info,
					[MAIN_THREAD_FLAG]: true
				});
			});
		});
	}
});

export { mainThreadPlugin, MAIN_THREAD_FLAG };
