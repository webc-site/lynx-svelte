const SCOPE_RE = /:where\((\.svelte-[a-zA-Z0-9_-]+)\)/g;

const scopeCssPlugin = () => ({
	apply(compiler) {
		const { Compilation, sources } = compiler.webpack;

		compiler.hooks.compilation.tap('LynxSvelteScopeCss', (compilation) => {
			compilation.hooks.processAssets.tap(
				{
					name: 'LynxSvelteScopeCss',
					stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
				},
				() => {
					for (const name of Object.keys(compilation.assets)) {
						if (!name.endsWith('.css')) continue;
						const asset = compilation.getAsset(name),
							source = asset.source.source().toString();
						if (!source.includes(':where(.svelte-')) continue;
						compilation.updateAsset(
							name,
							new sources.RawSource(source.replaceAll(SCOPE_RE, '$1')),
							{ ...asset.info }
						);
					}
				}
			);
		});
	}
});

export { scopeCssPlugin, SCOPE_RE };
