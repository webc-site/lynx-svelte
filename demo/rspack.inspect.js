import { rspackConfig } from '@lynx-svelte/script';
const config = rspackConfig('./src/index.js', import.meta.dirname);
config.plugins = [];
config.output.path = `${import.meta.dirname}/dist-inspect`;
const swc = { loader: 'builtin:swc-loader', options: { jsc: { target: 'es2015' } } };
config.module.rules[0].use.unshift(swc);
config.module.rules.push({ test: /\.(js|mjs)$/, use: [swc] });
export default config;
