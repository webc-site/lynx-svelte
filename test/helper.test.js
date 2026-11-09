import { test, expect, beforeEach } from 'bun:test';
import { styleBind } from '../pkg/helper/src/styleBind.js';
import { classBind } from '../pkg/helper/src/classBind.js';
import { transformParse, transformParseCss } from '../pkg/helper/src/transformParse.js';
import { propMerge, styleMerge, classMerge } from '../pkg/helper/src/propMerge.js';
import { propHandle } from '../pkg/helper/src/propHandle.js';
import { inputBind, onceWrap, eventValue, eventMerge } from '../pkg/helper/src/eventWrap.js';

beforeEach(() => undefined);

test('styleBind merges object, array and string', () => {
	expect(styleBind({ color: 'red', fontSize: 12 })).toBe('color:red;font-size:12px;');
	expect(styleBind([{ color: 'red' }, { opacity: 0.5 }])).toBe('color:red;opacity:0.5;');
	expect(styleBind('color:red;font-size:12px')).toBe('color:red;font-size:12px;');
	expect(styleBind([[{ marginTop: 8 }, 'padding-left:4px'], null, false])).toBe(
		'margin-top:8px;padding-left:4px;'
	);
});

test('styleBind converts camelCase and keeps unitless values', () => {
	expect(styleBind({ backgroundColor: '#fff', lineHeight: 1.5, width: 0 })).toBe(
		'background-color:#fff;line-height:1.5;width:0;'
	);
});

test('classBind handles object, array and string', () => {
	expect(classBind(['base', { active: true, hidden: false }, null, 'tail'])).toBe('base active tail');
	expect(classBind('one two')).toBe('one two');
	expect(classBind([1, ['nested', { deep: true }], { off: 0 }])).toBe('1 nested deep');
});

test('transformParse builds transform string', () => {
	expect(transformParse({ rotate: 45, translateX: 10, scale: 2 })).toBe(
		'rotate(45deg) translateX(10px) scale(2)'
	);
	expect(transformParse('rotate(10deg)')).toBe('rotate(10deg)');
	expect(transformParse([{ translateY: 4 }, 'skewX(2deg)', { scale: 1.5 }])).toBe(
		'translateY(4px) skewX(2deg) scale(1.5)'
	);
	expect(transformParse({ translate: ['1px', '2px'], rotate: '10deg' })).toBe(
		'translate(1px,2px) rotate(10deg)'
	);
});

test('transformParseCss parses vue-native style transform strings', () => {
	expect(transformParseCss('rotate(45deg) translate(10px, 20px) scale(1.5)')).toEqual({
		rotate: '45deg',
		scale: 1.5,
		translateX: 10,
		translateY: 20
	});
	expect(transformParseCss('skewX(10deg)')).toEqual({ skewX: '10deg' });
	expect(transformParseCss(null)).toEqual({});
});

test('propMerge chains handlers and lets later values win', () => {
	const call_li = [];
	const first = () => call_li.push('first');
	const second = () => call_li.push('second');
	const merged = propMerge(
		{ class: 'base', onclick: first, title: 'a' },
		{ class: 'override', onclick: second }
	);

	expect(merged.class).toBe('override');
	expect(merged.title).toBe('a');
	merged.onclick();
	expect(call_li).toEqual(['first', 'second']);
});

test('styleMerge and classMerge flatten nested values', () => {
	expect(styleMerge({ color: 'red' }, [{ fontSize: 12 }], 'opacity:0.5')).toEqual([
		{ color: 'red' },
		{ fontSize: 12 },
		'opacity:0.5'
	]);
	expect(classMerge('base', [['one', { active: true }], null])).toEqual(['base', 'one', { active: true }]);
});

test('propHandle filters events and functions', () => {
	expect(
		propHandle('view', {
			id: 'x',
			onclick: () => undefined,
			children: [],
			hidden: false,
			enabled: true,
			'data-index': 2
		})
	).toEqual({ id: 'x', enabled: '', 'data-index': 2 });
});

test('eventWrap extracts values and wraps once', () => {
	expect(eventValue({ detail: { value: 'hello' } })).toBe('hello');
	expect(eventValue({ detail: 'plain' })).toBe('plain');
	expect(eventValue({ value: 3 })).toBe(3);
	expect(eventValue(null)).toBe(undefined);
	expect(eventValue({ detail: {} })).toEqual({});

	let received = null;
	const handler = inputBind((value) => (received = value));
	handler({ detail: { value: 'typed' } });
	expect(received).toBe('typed');

	let count = 0;
	let last_arg = null;
	const once = onceWrap((value) => {
		last_arg = value;
		return ++count;
	});
	expect(once('first')).toBe(1);
	once();
	expect(count).toBe(1);
	expect(last_arg).toBe('first');
});

test('eventMerge invokes multiple handlers in order', () => {
	const call_li = [];
	const merged = eventMerge([(value) => call_li.push('a' + value), null, (value) => call_li.push('b' + value)]);
	merged(1);
	expect(call_li).toEqual(['a1', 'b1']);
	expect(eventMerge(null)).toBe(null);
});
