import { defineConfig } from '@rsbuild/core';
import { pluginLynxtron } from '@lynx-js/lynxtron-dev-plugins/rsbuild';

export default defineConfig({
	environments: {
		desktop: {
			source: {
				entry: {
					main: './src/main/desktop/main.ts',
					preload: './src/main/desktop/preload.ts'
				}
			},
			plugins: [pluginLynxtron({ args: ['--inspect=9222'] })],
			output: {
				target: 'node',
				distPath: {
					root: './dist/desktop'
				},
				copy: [
					{ from: './package.json', to: 'package.json' },
					{ from: './main.lynx.bundle', to: 'main.lynx.bundle' }
				]
			},
			dev: {
				writeToDisk: true
			}
		}
	}
});
