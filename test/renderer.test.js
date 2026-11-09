import { test, expect, beforeEach, afterEach } from 'bun:test';
import { installPapi, uninstallPapi } from './mockPapi.js';
import { lynxRenderer, setPageId } from '../pkg/core/src/renderer.js';
import { nodeTypeGet } from '../pkg/core/src/elementOp.js';

let page = null;

beforeEach(() => {
	const { page_li } = installPapi();
	page = page_li[0] ?? globalThis.__CreatePage('0', 0);
	setPageId(globalThis.__GetElementUniqueID(page));
});

afterEach(() => {
	uninstallPapi();
	setPageId(0);
});

test('renderer exposes all 19 methods', () => {
	const name_li = [
		'createFragment',
		'createElement',
		'createTextNode',
		'createComment',
		'nodeType',
		'getNodeValue',
		'getAttribute',
		'setAttribute',
		'removeAttribute',
		'hasAttribute',
		'setText',
		'getFirstChild',
		'getLastChild',
		'getNextSibling',
		'insert',
		'remove',
		'getParent',
		'addEventListener',
		'removeEventListener'
	];
	name_li.forEach((name) => expect(typeof lynxRenderer[name]).toBe('function'));
});

test('creates built-in Lynx elements and raw text', () => {
	const view = lynxRenderer.createElement('view'),
		scroll = lynxRenderer.createElement('scroll-view'),
		text = lynxRenderer.createElement('text'),
		image = lynxRenderer.createElement('image'),
		list = lynxRenderer.createElement('list'),
		custom = lynxRenderer.createElement('my-tag'),
		raw = lynxRenderer.createTextNode('hello');

	expect(view.tag).toBe('view');
	expect(scroll.tag).toBe('scroll-view');
	expect(text.tag).toBe('text');
	expect(image.tag).toBe('image');
	expect(list.tag).toBe('list');
	expect(custom.tag).toBe('my-tag');
	expect(typeof list.list_callbacks[0]).toBe('function');
	expect(typeof list.list_callbacks[1]).toBe('function');
	expect(lynxRenderer.nodeType(raw)).toBe('text');
	expect(lynxRenderer.getNodeValue(raw)).toBe('hello');
	expect(nodeTypeGet(view)).toBe('element');
});

test('creates and inserts comment placeholders', () => {
	const comment = lynxRenderer.createComment('anchor');
	expect(lynxRenderer.nodeType(comment)).toBe('comment');
	expect(lynxRenderer.getNodeValue(comment)).toBe('anchor');

	lynxRenderer.insert(page, comment, null);
	expect(page.children.at(-1).tag).toBe('non-element');
	expect(lynxRenderer.getParent(comment)).toBe(page);
});

test('falls back to DOM comment when __CreateNonElement is unavailable', () => {
	const original_document = globalThis.document;
	delete globalThis.__CreateNonElement;
	globalThis.document = { createComment: (data) => ({ tag: 'dom-comment', data }) };

	const comment = lynxRenderer.createComment('web-anchor');
	expect(comment.node.tag).toBe('dom-comment');
	expect(comment.node.data).toBe('web-anchor');
	expect(lynxRenderer.getNodeValue(comment)).toBe('web-anchor');

	globalThis.document = original_document;
});

test('fragment insertion expands children in order', () => {
	const fragment = lynxRenderer.createFragment(),
		first = lynxRenderer.createElement('view'),
		second = lynxRenderer.createElement('text'),
		third = lynxRenderer.createElement('image');

	lynxRenderer.insert(fragment, first, null);
	lynxRenderer.insert(fragment, second, null);
	lynxRenderer.insert(fragment, third, null);

	expect(lynxRenderer.getFirstChild(fragment)).toBe(first);
	expect(lynxRenderer.getLastChild(fragment)).toBe(third);
	expect(lynxRenderer.getNextSibling(first)).toBe(second);
	expect(lynxRenderer.getNextSibling(third)).toBe(null);

	lynxRenderer.insert(page, fragment, null);

	expect(page.children.map((node) => node.tag)).toEqual(['view', 'text', 'image']);
});

test('inserts before anchor and moves nodes between parents', () => {
	const parent = lynxRenderer.createElement('view'),
		other = lynxRenderer.createElement('view'),
		a = lynxRenderer.createElement('text'),
		b = lynxRenderer.createElement('text');

	lynxRenderer.insert(parent, a, null);
	lynxRenderer.insert(parent, b, a);
	expect(parent.children.map((node) => node.tag)).toEqual(['text', 'text']);
	expect(parent.children[0]).toBe(b);
	expect(parent.children[1]).toBe(a);

	lynxRenderer.insert(other, b, null);
	expect(parent.children.length).toBe(1);
	expect(parent.children[0]).toBe(a);
	expect(other.children[0]).toBe(b);
	expect(lynxRenderer.getParent(b)).toBe(other);
});

test('removes nodes and clears parent relation', () => {
	const parent = lynxRenderer.createElement('view'),
		child = lynxRenderer.createElement('view');

	lynxRenderer.insert(parent, child, null);
	lynxRenderer.remove(child);
	expect(parent.children.length).toBe(0);
	expect(lynxRenderer.getParent(child)).toBe(null);
});

test('attributes dispatch to style, class, id, dataset and plain channels', () => {
	const view = lynxRenderer.createElement('view');

	lynxRenderer.setAttribute(view, 'style', 'color:red');
	lynxRenderer.setAttribute(view, 'class', 'card active');
	lynxRenderer.setAttribute(view, 'id', 'root');
	lynxRenderer.setAttribute(view, 'data-index', '3');
	lynxRenderer.setAttribute(view, 'src', 'logo.png');

	expect(view.styles).toBe('color:red');
	expect(view.classes).toBe('card active');
	expect(view.element_id).toBe('root');
	expect(view.dataset.index).toBe('3');
	expect(view.attrs.src).toBe('logo.png');

	expect(lynxRenderer.getAttribute(view, 'src')).toBe('logo.png');
	expect(lynxRenderer.hasAttribute(view, 'src')).toBe(true);
	expect(lynxRenderer.getAttribute(view, 'missing')).toBe(null);

	lynxRenderer.removeAttribute(view, 'src');
	expect(lynxRenderer.hasAttribute(view, 'src')).toBe(false);
	expect(view.attrs.src).toBe(null);

	lynxRenderer.setAttribute(view, 'data-extra', 'x');
	lynxRenderer.removeAttribute(view, 'data-extra');
	expect(view.dataset.index).toBe('3');
	expect('extra' in view.dataset).toBe(false);
});

test('removeAttribute clears style, class, id and text channels', () => {
	const view = lynxRenderer.createElement('view');

	lynxRenderer.setAttribute(view, 'style', 'color:red');
	lynxRenderer.setAttribute(view, 'class', 'card');
	lynxRenderer.setAttribute(view, 'id', 'root');
	lynxRenderer.setAttribute(view, 'title', 'hello');

	lynxRenderer.removeAttribute(view, 'style');
	lynxRenderer.removeAttribute(view, 'class');
	lynxRenderer.removeAttribute(view, 'id');
	lynxRenderer.removeAttribute(view, 'title');

	expect(view.styles).toBe('');
	expect(view.classes).toBe('');
	expect(view.element_id).toBe(null);
	expect(view.attrs.title).toBe(null);
	expect(lynxRenderer.getAttribute(view, 'style')).toBe(null);
	expect(lynxRenderer.getAttribute(view, 'class')).toBe(null);
	expect(lynxRenderer.getAttribute(view, 'id')).toBe(null);
});

test('nodeType and getNodeValue handle elements, fragments and unknown objects', () => {
	const view = lynxRenderer.createElement('view'),
		fragment = lynxRenderer.createFragment(),
		unknown = { tag: 'unknown' };

	expect(lynxRenderer.nodeType(view)).toBe('element');
	expect(lynxRenderer.nodeType(fragment)).toBe('fragment');
	expect(lynxRenderer.nodeType(unknown)).toBe('element');
	expect(lynxRenderer.getNodeValue(view)).toBe(null);
	expect(lynxRenderer.getNodeValue(fragment)).toBe(null);
});

test('nested children support lastChild, parent and sibling traversal', () => {
	const parent = lynxRenderer.createElement('view'),
		first = lynxRenderer.createElement('text'),
		second = lynxRenderer.createElement('text'),
		grand = lynxRenderer.createElement('image');

	lynxRenderer.insert(parent, first, null);
	lynxRenderer.insert(parent, second, null);
	lynxRenderer.insert(first, grand, null);

	expect(lynxRenderer.getLastChild(parent)).toBe(second);
	expect(lynxRenderer.getFirstChild(first)).toBe(grand);
	expect(lynxRenderer.getParent(grand)).toBe(first);
	expect(lynxRenderer.getNextSibling(first)).toBe(second);
	expect(lynxRenderer.getNextSibling(second)).toBe(null);
});

test('renderer degrades safely without PAPI globals', () => {
	uninstallPapi();

	const view = lynxRenderer.createElement('view'),
		text = lynxRenderer.createTextNode('plain');

	expect(view.__lynx_fallback_tag).toBe('view');
	expect(lynxRenderer.nodeType(text)).toBe('text');
	expect(lynxRenderer.getNodeValue(text)).toBe('plain');
	expect(() => lynxRenderer.insert(view, text, null)).not.toThrow();
	expect(lynxRenderer.getFirstChild(view)).toBe(text);
});

test('setText updates text nodes and elements', () => {
	const raw = lynxRenderer.createTextNode('a'),
		view = lynxRenderer.createElement('text');

	lynxRenderer.setText(raw, 'b');
	expect(lynxRenderer.getNodeValue(raw)).toBe('b');
	expect(raw.text).toBe('b');

	lynxRenderer.setText(view, 'c');
	expect(view.attrs.text).toBe('c');
});

test('event registration and removal', () => {
	const view = lynxRenderer.createElement('view'),
		handler = () => undefined;

	lynxRenderer.addEventListener(view, 'bindtap', handler);
	expect(view.events.length).toBe(1);
	expect(view.events[0].event_type).toBe('bindEvent');
	expect(view.events[0].name).toBe('tap');
	expect(view.events[0].handler.value).toBe(handler);

	lynxRenderer.removeEventListener(view, 'bindtap', handler);
	expect(view.events.length).toBe(0);
});

test('event name variants map to Lynx event types', () => {
	const view = lynxRenderer.createElement('view'),
		handler = () => undefined,
		cases = [
			['bindtap', 'bindEvent', 'tap'],
			['catchtap', 'catchEvent', 'tap'],
			['capture-bindtap', 'capture-bind', 'tap'],
			['capture-catchtap', 'capture-catch', 'tap'],
			['global-bindtap', 'global-bindEvent', 'tap'],
			['onclick', 'bindEvent', 'onclick']
		];

	cases.forEach(([type, event_type, name]) => {
		lynxRenderer.addEventListener(view, type, handler);
		const event = view.events.at(-1);
		expect(event.event_type).toBe(event_type);
		expect(event.name).toBe(name);
	});
});
