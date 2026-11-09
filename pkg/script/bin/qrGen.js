#!/usr/bin/env -S bun
import { networkInterfaces } from 'node:os';
import { qr } from 'headless-qr';

const WHITE_WHITE = '█',
	BLACK_BLACK = ' ',
	BLOCK_WHITE = '▄',
	WHITE_BLACK = '▀';

const argGet = (name, fallback) => {
	const index = process.argv.indexOf(name);
	return index === -1 ? fallback : process.argv[index + 1] ?? fallback;
};

const localAddressGet = () => {
	const networks = networkInterfaces(),
		names = Object.keys(networks);
	for (let i = 0; i < names.length; ++i) {
		const item = (networks[names[i]] ?? []).find((entry) => entry.family === 'IPv4' && !entry.internal);
		if (item != null) return item.address;
	}
	return '127.0.0.1';
};

const codeRender = (matrix) => {
	const line_li = [],
		width = matrix.length,
		border = WHITE_WHITE.repeat(width + 4);
	line_li.push(border);
	for (let row = 0; row < matrix.length; row += 2) {
		let line = WHITE_WHITE + WHITE_WHITE;
		const row_one = matrix[row],
			row_two = matrix[row + 1] ?? Array.from({ length: width }).fill(false);
		for (let col = 0; col < width; ++col) {
			const top = row_one[col],
				bottom = row_two[col];
			if (top && bottom) line += BLACK_BLACK;
			else if (top) line += BLOCK_WHITE;
			else if (bottom) line += WHITE_BLACK;
			else line += WHITE_WHITE;
		}
		line_li.push(line + WHITE_WHITE + WHITE_WHITE);
	}
	line_li.push(border);
	return line_li.join('\n');
};

const port = argGet('--port', '8080'),
	address = argGet('--url', `http://${localAddressGet()}:${port}/main.lynx.bundle?fullscreen=true`),
	matrix = qr(address, { version: 4 }),
	code = codeRender(matrix);

await Bun.write(import.meta.dirname + '/../../../qr.txt', code + '\n' + address + '\n');
console.log(code);
console.log('\n' + address);
