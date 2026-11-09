#!/usr/bin/env -S bun
import path from 'node:path';

const ROOT_DIR = import.meta.dirname,
	DIST_DIR = path.join(ROOT_DIR, 'dist'),
	WEB_CORE_DIR = path.resolve(
		ROOT_DIR,
		'../node_modules/@lynx-js/web-core/dist/client_prod/static'
	),
	PORT = Number(process.argv[2] ?? 4173);

const html = `<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>lynx-svelte web smoke</title>
	<link rel="icon" href="data:," />
	<link rel="stylesheet" href="/web-core/client.css" />
	<script type="module" src="/web-core/client.js"></script>
</head>
<body>
	<lynx-view style="height:100vh;width:100vw" url="/main.web.bundle"></lynx-view>
</body>
</html>`;

const fileGet = async (file_path, content_type) => {
	const file = Bun.file(file_path);
	if (await file.exists()) {
		return new Response(file, {
			headers: content_type == null ? {} : { 'content-type': content_type }
		});
	}
	return new Response('not found', { status: 404 });
};

const server = Bun.serve({
	port: PORT,
	async fetch(request) {
		const url = new URL(request.url),
			pathname = url.pathname;

		if (pathname === '/') return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
		if (pathname === '/main.web.bundle') {
			return fileGet(path.join(DIST_DIR, 'main.web.bundle'), 'application/json');
		}
		if (pathname === '/web-core/client.js') {
			return fileGet(path.join(WEB_CORE_DIR, 'js/client.js'), 'text/javascript; charset=utf-8');
		}
		if (pathname === '/web-core/client.css') {
			return fileGet(path.join(WEB_CORE_DIR, 'css/client.css'), 'text/css; charset=utf-8');
		}
		if (pathname.startsWith('/static/')) {
			const rel = pathname.slice('/static/'.length);
			return fileGet(
				path.join(WEB_CORE_DIR, rel),
				rel.endsWith('.js') ? 'text/javascript; charset=utf-8' : undefined
			);
		}
		if (pathname.startsWith('/web-core/')) {
			const rel = pathname.startsWith('/web-core/static/')
				? pathname.slice('/web-core/static/'.length)
				: pathname.slice('/web-core/'.length);
			return fileGet(
				path.join(WEB_CORE_DIR, rel),
				rel.endsWith('.js')
					? 'text/javascript; charset=utf-8'
					: rel.endsWith('.css')
						? 'text/css; charset=utf-8'
						: undefined
			);
		}
		return new Response('not found', { status: 404 });
	}
});

console.log(`http://127.0.0.1:${server.port}/`);
