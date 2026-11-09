import { test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { mount, unmount, tick } from 'svelte';
import { installPapi, uninstallPapi, findNode, treeText, dispatchEvent } from './mockPapi.js';
import { lynxRenderer, setPageId } from '../pkg/core/src/renderer.js';
import { pageMount, pageUnmount, pageStart } from '../pkg/core/src/pageRuntime.js';

const CUSTOM_RENDERER = '@lynx-svelte/core/renderer',
	TMP_DIR = path.join(import.meta.dirname, '.tmp');

const componentLoad = async (source, name) => {
	const result = compile(source, {
			filename: name + '.svelte',
			generate: 'client',
			experimental: {
				customRenderer: CUSTOM_RENDERER
			}
		}),
		file_path = path.join(TMP_DIR, name + '.svelte.js');

	await mkdir(TMP_DIR, { recursive: true });
	await Bun.write(file_path, result.js.code);
	return import(pathToFileURL(file_path).href + '?t=' + Date.now());
};

let page = null;

beforeEach(() => {
	const { page_li } = installPapi();
	page = page_li[0] ?? globalThis.__CreatePage('0', 0);
	setPageId(globalThis.__GetElementUniqueID(page));
});

afterEach(async () => {
	uninstallPapi();
	setPageId(0);
	await rm(TMP_DIR, { recursive: true, force: true });
});

test('mounts a compiled Svelte component into a Lynx page', async () => {
	const module = await componentLoad(
		`<script>
			let count = $state(0);
			const label = $derived('count:' + count);
		</script>
		<view class="root"><text>{label}</text></view>`,
		'E2eStatic'
	);

	const component = mount(module.default, { target: page, renderer: lynxRenderer });

	expect(page.children.length).toBeGreaterThan(0);
	const root = findNode(page, (node) => node.tag === 'view' && node.classes === 'root');
	expect(root).not.toBe(null);
	expect(treeText(root)).toContain('count:0');

	unmount(component);
	expect(findNode(page, (node) => node.tag === 'view' && node.classes === 'root')).toBe(null);
});

test('pageMount creates a page and pageUnmount cleans it', async () => {
	const module = await componentLoad(
		`<script>
			let count = $state(0);
		</script>
		<view class="root"><text>count:{count}</text></view>`,
		'E2ePageMount'
	);

	const handle = pageMount(module.default);

	expect(handle.page.tag).toBe('page');
	expect(handle.component).not.toBe(undefined);
	expect(findNode(handle.page, (node) => node.tag === 'view' && node.classes === 'root')).not.toBe(null);
	expect(treeText(findNode(handle.page, (node) => node.tag === 'view' && node.classes === 'root'))).toContain(
		'count:0'
	);

	await pageUnmount(handle);

	expect(findNode(handle.page, (node) => node.tag === 'view' && node.classes === 'root')).toBe(null);
});

test('pageStart installs renderPage bridge and returns the handle getter', async () => {
	const module = await componentLoad(
		`<script>
			let count = $state(0);
		</script>
		<view class="root"><text>count:{count}</text></view>`,
		'E2ePageStart'
	);

	const handleGet = pageStart(module.default),
		page_element = globalThis.renderPage(),
		handle = handleGet();

	expect(typeof globalThis.updatePage).toBe('function');
	expect(typeof globalThis.processData).toBe('function');
	expect(typeof globalThis.runWorklet).toBe('function');
	expect(page_element.tag).toBe('page');
	expect(handle).not.toBe(null);
	expect(findNode(page_element, (node) => node.tag === 'view' && node.classes === 'root')).not.toBe(null);

	await pageUnmount(handle);
	delete globalThis.renderPage;
	delete globalThis.updatePage;
	delete globalThis.processData;
	delete globalThis.runWorklet;
});

test('responds to Lynx tap events and updates the tree', async () => {
	const module = await componentLoad(
		`<script>
			let count = $state(0);
			const label = $derived('count:' + count);
		</script>
		<view class="root" onbindtap={() => ++count}>
			<text>{label}</text>
			{#if count > 0}<text class="hint">tapped</text>{/if}
		</view>`,
		'E2eEvent'
	);

	mount(module.default, { target: page, renderer: lynxRenderer });

	const root = findNode(page, (node) => node.tag === 'view' && node.classes === 'root'),
		hint_before = findNode(page, (node) => node.tag === 'text' && node.classes === 'hint');

	expect(hint_before).toBe(null);
	expect(dispatchEvent(root, 'tap')).toBe(1);
	await tick();

	expect(treeText(findNode(page, (node) => node.tag === 'view' && node.classes === 'root'))).toContain(
		'count:1'
	);
	expect(findNode(page, (node) => node.tag === 'text' && node.classes === 'hint')).not.toBe(null);
});

test('renders keyed each lists and child components', async () => {
	const child = await componentLoad(
		`<script>
			let { item, onselect } = $props();
		</script>
		<view class="row" onbindtap={onselect}><text>{item.name}</text></view>`,
		'E2eChild'
	);

	const module = await componentLoad(
		`<script>
			import Row from './E2eChild.svelte.js';
			let item_li = $state([
				{ id: 1, name: 'alpha' },
				{ id: 2, name: 'beta' }
			]);
			let picked = $state('');
		</script>
		<view class="list">
			{#each item_li as item (item.id)}
				<Row {item} onselect={() => (picked = item.name)} />
			{/each}
			<text class="picked">{picked}</text>
		</view>`,
		'E2eList'
	);

	mount(module.default, { target: page, renderer: lynxRenderer });

	const row_li = [];
	const collect = (node) => {
		if (node.tag === 'view' && node.classes === 'row') row_li.push(node);
		node.children.forEach(collect);
	};
	collect(page);

	expect(row_li.length).toBe(2);
	expect(treeText(row_li[0])).toContain('alpha');
	expect(treeText(row_li[1])).toContain('beta');

	dispatchEvent(row_li[1], 'tap');
	await tick();
	expect(treeText(findNode(page, (node) => node.tag === 'text' && node.classes === 'picked'))).toContain(
		'beta'
	);

	void child;
});
