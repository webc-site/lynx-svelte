import { parse } from 'acorn';
import { walk } from 'zimmerframe';
import { print } from 'esrap';
import ts from 'esrap/languages/ts';

const OPERATOR_MAP = {
	'??=': '??',
	'&&=': '&&',
	'||=': '||'
};

const OPERATOR_SET = new Set(Object.keys(OPERATOR_MAP));

const nodeClone = (node) => JSON.parse(JSON.stringify(node));

const transformSource = (source) => {
	const ast = parse(source, {
		ecmaVersion: 'latest',
		sourceType: 'module',
		allowHashBang: true
	});

	const fixed_ast = walk(ast, {}, {
		AssignmentExpression(node, context) {
			if (!OPERATOR_SET.has(node.operator)) {
				context.next();
				return undefined;
			}

			const left = context.visit(node.left),
				right = context.visit(node.right),
				operator = OPERATOR_MAP[node.operator];

			return {
				type: 'AssignmentExpression',
				operator: '=',
				left,
				right: {
					type: 'LogicalExpression',
					operator,
					left: nodeClone(left),
					right
				}
			};
		}
	});

	return print(fixed_ast, ts()).code;
};

const isJavaScriptAsset = (name) => name.endsWith('.js') && !name.endsWith('.map');

const lepusCompatPlugin = () => ({
	apply(compiler) {
		const { Compilation, sources } = compiler.webpack;

		compiler.hooks.compilation.tap('LynxSvelteLepusCompat', (compilation) => {
			compilation.hooks.processAssets.tap(
				{
					name: 'LynxSvelteLepusCompat',
					stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
				},
				(assets) => {
					Object.entries(assets).forEach(([name, asset]) => {
						if (!isJavaScriptAsset(name)) return;
						const source = asset.source(),
							transformed = typeof source === 'string' ? transformSource(source) : source;
						compilation.updateAsset(name, new sources.RawSource(transformed), { ...asset.info });
					});
				}
			);
		});
	}
});

export { lepusCompatPlugin, transformSource, OPERATOR_MAP };
