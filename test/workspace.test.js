import { test, expect } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
	pageMount,
	pageUnmount,
	pageStart,
	runWorklet,
	installPageGlobals,
	lynxRenderer,
	setPageId,
	NODE_TYPE_FRAGMENT,
	parentGet,
	attrHas
} from '@lynx-svelte/core';
import renderer from '@lynx-svelte/core/renderer';
import {
	styleBind,
	classBind,
	transformParse,
	transformParseCss,
	propMerge,
	styleMerge,
	classMerge,
	propHandle,
	eventValue,
	eventMerge,
	inputBind
} from '@lynx-svelte/helper';
import {
	rspackConfig,
	rspackWebConfig,
	lepusCompatPlugin,
	mainThreadPlugin,
	webManifestFallbackPlugin,
	transformSource
} from '@lynx-svelte/script';
import { createRenderer } from 'svelte/renderer';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');

test('root workspace pins local svelte and links each package', () => {
	const root_pkg = JSON.parse(readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));

	expect(root_pkg.workspaces).toEqual(['pkg/*', 'demo']);
	expect(root_pkg.dependencies.svelte).toBe('file:../svelte/packages/svelte');
	expect(existsSync(path.join(ROOT_DIR, 'node_modules/svelte/package.json'))).toBe(true);

	['core', 'helper', 'script'].forEach((name) => {
		expect(existsSync(path.join(ROOT_DIR, 'node_modules/@lynx-svelte', name))).toBe(true);
	});
});

test('public package entries export the documented API', () => {
	expect(typeof renderer.createFragment).toBe('function');
	expect(typeof lynxRenderer.insert).toBe('function');
	expect(typeof createRenderer).toBe('function');
	expect(typeof pageMount).toBe('function');
	expect(typeof pageUnmount).toBe('function');
	expect(typeof pageStart).toBe('function');
	expect(typeof runWorklet).toBe('function');
	expect(typeof installPageGlobals).toBe('function');
	expect(typeof setPageId).toBe('function');
	expect(NODE_TYPE_FRAGMENT).toBe('fragment');
	expect(typeof parentGet).toBe('function');
	expect(typeof attrHas).toBe('function');

	expect(typeof styleBind).toBe('function');
	expect(typeof classBind).toBe('function');
	expect(typeof transformParse).toBe('function');
	expect(typeof transformParseCss).toBe('function');
	expect(typeof propMerge).toBe('function');
	expect(typeof styleMerge).toBe('function');
	expect(typeof classMerge).toBe('function');
	expect(typeof propHandle).toBe('function');
	expect(typeof eventValue).toBe('function');
	expect(typeof eventMerge).toBe('function');
	expect(typeof inputBind).toBe('function');

	expect(typeof rspackConfig).toBe('function');
	expect(typeof rspackWebConfig).toBe('function');
	expect(typeof lepusCompatPlugin).toBe('function');
	expect(typeof mainThreadPlugin).toBe('function');
	expect(typeof webManifestFallbackPlugin).toBe('function');
	expect(typeof transformSource).toBe('function');
});

test('script package exposes working build config factories', () => {
	const native = rspackConfig('./src/index.js', ROOT_DIR),
		web = rspackWebConfig('./src/index.js', ROOT_DIR);

	expect(native.entry['main-thread']).toBe(path.join(ROOT_DIR, 'src/index.js'));
	expect(native.entry.main).toContain('backgroundEntry.js');
	expect(native.resolve.conditionNames).toContain('browser');
	expect(native.plugins.length).toBe(5);
	expect(web.plugins.length).toBe(4);
});
