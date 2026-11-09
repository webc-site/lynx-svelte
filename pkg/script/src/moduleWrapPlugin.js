const moduleWrapPlugin = (asset_name, module_name) => ({
	apply(compiler) {
		const { Compilation, sources } = compiler.webpack;

		compiler.hooks.compilation.tap('LynxSvelteModuleWrap', (compilation) => {
			compilation.hooks.processAssets.tap(
				{
					name: 'LynxSvelteModuleWrap',
					stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
				},
				() => {
					const asset = compilation.getAsset(asset_name);
					if (asset == null) return;

					const source = asset.source.source().toString(),
						wrapped = `(function(){${source};return {init:function(){}};})()`;
					compilation.updateAsset(asset_name, new sources.RawSource(wrapped), { ...asset.info });
				}
			);
		});
	}
});

export { moduleWrapPlugin };
