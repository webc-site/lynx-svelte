import { test, expect } from 'bun:test';
import { transformSource, OPERATOR_MAP } from '../pkg/script/src/lepusPlugin.js';

test('downgrades logical assignment operators', () => {
	const source = 'let a = null; a ??= 1; let b = 1; b &&= 2; let c = 0; c ||= 3;',
		output = transformSource(source);

	expect(OPERATOR_MAP['??=']).toBe('??');
	expect(output).toContain('a = a ?? 1');
	expect(output).toContain('b = b && 2');
	expect(output).toContain('c = c || 3');
	expect(output).not.toContain('??=');
	expect(output).not.toContain('&&=');
	expect(output).not.toContain('||=');
});

test('leaves unrelated code unchanged semantically', () => {
	const output = transformSource('const value = { a: 1 }; value.a = value.a ?? 2;');
	expect(output).toContain('value.a = value.a ?? 2');
});
