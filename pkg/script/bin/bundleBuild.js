#!/usr/bin/env -S bun
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { rspack } from '@rspack/core';

const configPath = path.resolve(process.cwd(), process.argv[2] ?? 'rspack.config.js'),
	configModule = await import(pathToFileURL(configPath).href),
	config = configModule.default,
	watch = process.argv.includes('--watch'),
	printStats = (stats) => {
		const text = stats.toString({ colors: true, chunks: false, modules: false });
		console.log(text);
		if (stats.hasErrors()) process.exitCode = 1;
	};

const compiler = rspack(config);

if (watch) {
	compiler.watch({}, (error, stats) => {
		if (error != null) {
			console.error(error);
			process.exitCode = 1;
			return;
		}
		printStats(stats);
	});
} else {
	await new Promise((resolve) => {
		compiler.run((error, stats) => {
			if (error != null) {
				console.error(error);
				process.exitCode = 1;
			} else {
				printStats(stats);
			}
			compiler.close(() => resolve());
		});
	});
}
