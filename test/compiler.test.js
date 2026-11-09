import { test, expect } from 'bun:test';
import { compile } from 'svelte/compiler';

const CUSTOM_RENDERER = '@lynx-svelte/core/renderer';

const compileSource = (source) =>
	compile(source, {
		filename: 'Test.svelte',
		generate: 'client',
		experimental: {
			customRenderer: CUSTOM_RENDERER
		}
	});

test('compiles runes, if, each and key blocks for a custom renderer', () => {
	const source = `
		<script>
			let count = $state(0);
			let item_li = $state([{ id: 1, name: 'a' }]);
			const doubled = $derived(count * 2);
		</script>
		<view onbindtap={() => ++count}>
			<text>{doubled}</text>
			{#if count > 0}
				<text>positive</text>
			{/if}
			{#each item_li as item (item.id)}
				{#key item.id}
					<text>{item.name}</text>
				{/key}
			{/each}
		</view>
	`;

	const result = compileSource(source),
		code = result.js.code;

	expect(code).toContain("import $renderer from '@lynx-svelte/core/renderer'");
	expect(code).toContain('$.push_renderer($renderer)');
	expect(code).toContain('$$pop_renderer()');
	expect(result.warnings.length).toBe(0);
});

test('per-component custom renderer opt out pushes null', () => {
	const result = compileSource(`
		<svelte:options customRenderer={null} />
		<view><text>dom</text></view>
	`);

	expect(result.js.code).toContain('$.push_renderer(null)');
});

test('rejects DOM-only svelte:head in custom renderer mode', () => {
	const source = `
		<svelte:head><title>hello</title></svelte:head>
		<view><text>body</text></view>
	`;

	expect(() => compileSource(source)).toThrow('incompatible_with_custom_renderer');
});

test('rejects css injected mode in custom renderer mode', () => {
	const source = `
		<svelte:options css="injected" />
		<view><text>body</text></view>
	`;

	expect(() => compileSource(source)).toThrow('incompatible_with_custom_renderer');
});
