const MAIN_THREAD_FLAG = 'lynx:main-thread',
	MAIN_ASSET_NAME = 'main.js';

const mainThreadPlugin = (asset_name = MAIN_ASSET_NAME) => ({
	apply(compiler) {
		const { RuntimeGlobals } = compiler.webpack;

		compiler.hooks.thisCompilation.tap('LynxSvelteMainThread', (compilation) => {
			compilation.hooks.additionalTreeRuntimeRequirements.tap(
				'LynxSvelteMainThread',
				(chunk, set) => {
					if (!chunk.name?.includes('main-thread')) return;
					set.add(RuntimeGlobals.startup);
					set.add(RuntimeGlobals.require);
				}
			);
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
