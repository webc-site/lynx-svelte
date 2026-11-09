import { mount, unmount as svelteUnmount } from 'svelte';
import { lynxRenderer, setPageId } from './renderer.js';
import { flushTree } from './elementOp.js';
import { PAGE_COMPONENT_ID, PAGE_CSS_ID } from './constant.js';

const pageCreate = () => {
	const create = globalThis.__CreatePage;
	if (create != null) return create(PAGE_COMPONENT_ID, PAGE_CSS_ID);
	return { __lynx_fallback_tag: 'page' };
};

const pageMount = (RootComponent, props = {}) => {
	const page = pageCreate(),
		unique_get = globalThis.__GetElementUniqueID,
		page_id = unique_get == null ? 0 : unique_get(page),
		fragment = lynxRenderer.createFragment();

	setPageId(page_id);

	const component = mount(RootComponent, {
		target: fragment,
		renderer: lynxRenderer,
		props
	});

	lynxRenderer.insert(page, fragment, null);
	flushTree(page);

	return { page, fragment, component, unmount: () => svelteUnmount(component) };
};

const pageUnmount = async (handle) => {
	if (handle == null) return;
	await handle.unmount?.();
	lynxRenderer.remove(handle.fragment);
	flushTree(handle.page);
};

const runWorklet = (value, params = []) => {
	if (typeof value === 'function') return value(...params);
	if (value != null && typeof value.value === 'function') return value.value(...params);
	return undefined;
};

const installPageGlobals = () => {
	globalThis.queueMicrotask ??= (callback) => setTimeout(callback, 0);
	globalThis.updatePage ??= () => undefined;
	globalThis.processData ??= () => undefined;
	globalThis.loadCard ??= () => undefined;
	globalThis.runWorklet ??= runWorklet;
};

const pageStart = (RootComponent, props = {}) => {
	installPageGlobals();
	let handle = null;
	globalThis.renderPage = () => {
		handle = pageMount(RootComponent, props);
		return handle.page;
	};
	return () => handle;
};

export { pageMount, pageUnmount, pageStart, runWorklet, installPageGlobals, setPageId };
