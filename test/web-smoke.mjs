#!/usr/bin/env -S bun
import path from 'node:path';
import { chromium } from 'playwright';

const SERVER_URL = process.argv[2] ?? 'http://127.0.0.1:4173/',
	EXPECTED = ['Svelte + Lynx', 'Todo list', 'Merge svelte#18042', 'Implement Lynx renderer'];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
const error_li = [];

page.on('console', (message) => {
	if (message.type() === 'error') error_li.push(message.text());
});
page.on('pageerror', (error) => error_li.push(error.message));

await page.goto(SERVER_URL, { waitUntil: 'load' });

await page.waitForFunction(() => {
	const view = document.querySelector('lynx-view');
	return view != null && view.shadowRoot != null;
}, { timeout: 20000 });

await page.waitForFunction(
	(text_li) => {
		const textGet = (root) => {
			let text = '';
			if (root.shadowRoot != null) text += textGet(root.shadowRoot);
			const frame_li = root.querySelectorAll?.('iframe') ?? [];
			for (const frame of frame_li) {
				try {
					if (frame.contentDocument?.body != null) text += textGet(frame.contentDocument.body);
				} catch {
					// cross-origin frame
				}
			}
			for (const child of root.childNodes) {
				if (child.nodeType === 3) text += child.textContent;
				else if (child.nodeType === 1) text += textGet(child);
			}
			return text;
		};
		const text = textGet(document.body);
		return text_li.every((item) => text.includes(item));
	},
	EXPECTED,
	{ timeout: 20000 }
);

const textGet = () =>
	page.evaluate(() => {
		const walk = (root) => {
			let text = '';
			if (root.shadowRoot != null) text += walk(root.shadowRoot);
			const frame_li = root.querySelectorAll?.('iframe') ?? [];
			for (const frame of frame_li) {
				try {
					if (frame.contentDocument?.body != null) text += walk(frame.contentDocument.body);
				} catch {
					// cross-origin frame
				}
			}
			for (const child of root.childNodes) {
				if (child.nodeType === 3) text += child.textContent;
				else if (child.nodeType === 1) text += walk(child);
			}
			return text;
		};
		return walk(document.body);
	});

const elementClick = (label) =>
	page.evaluate((value) => {
		const element_li = [];
		const walk = (root) => {
			for (const element of root.querySelectorAll('*')) {
				element_li.push(element);
				if (element.shadowRoot != null) walk(element.shadowRoot);
				if (element.tagName === 'IFRAME') {
					try {
						if (element.contentDocument?.body != null) walk(element.contentDocument.body);
					} catch {
						// cross-origin frame
					}
				}
			}
		};
		walk(document.body);
		const target = element_li.find((element) => element.textContent?.trim() === value);
		if (target == null) return false;
		target.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
		return true;
	}, label);

const initial_text = await textGet();

const todo_toggle_clicked = await elementClick('Merge svelte#18042');
await page.waitForTimeout(600);
const todo_after_toggle = await textGet();

const todo_remove_clicked = await elementClick('×');
await page.waitForTimeout(600);
const todo_after_remove = await textGet();

const list_clicked = await elementClick('List');
await page.waitForTimeout(600);
const row_clicked = await elementClick('Row 5');
await page.waitForTimeout(600);
const list_text = await textGet();

const style_clicked = await elementClick('Style');
await page.waitForTimeout(800);
const style_text = await textGet();

const plus_clicked = await elementClick('+1');
await page.waitForTimeout(500);
const plus_clicked_again = await elementClick('+1');
await page.waitForTimeout(800);
const count_text = await textGet();

await page.screenshot({
	path: path.resolve(import.meta.dirname, '../demo/dist/web-smoke.png'),
	fullPage: true
});
await browser.close();

const result = {
	initial_render: EXPECTED.every((item) => initial_text.includes(item)),
	todo_toggle:
		todo_toggle_clicked &&
		todo_after_toggle.includes('2 remaining / 2 total') &&
		todo_after_toggle.includes('Merge svelte#18042'),
	todo_remove:
		todo_remove_clicked &&
		todo_after_remove.includes('1 remaining / 1 total') &&
		!todo_after_remove.includes('Merge svelte#18042'),
	list_select: list_clicked && row_clicked && list_text.includes('Selected: Row 5'),
	tab_switch: style_clicked && style_text.includes('Dynamic style'),
	counter_click: plus_clicked && plus_clicked_again && count_text.includes('count = 2'),
	error_li,
	initial_excerpt: initial_text.replaceAll(/\s+/g, ' ').trim().slice(-240)
};

console.log(JSON.stringify(result, null, 2));

const ok =
	result.initial_render &&
	result.todo_toggle &&
	result.todo_remove &&
	result.list_select &&
	result.tab_switch &&
	result.counter_click &&
	error_li.length === 0;

if (!ok) process.exitCode = 1;
