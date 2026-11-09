const SKIP_KEY_SET = new Set(['children', 'ref', '$$slots', '$$scope', 'constructor', 'prototype']);

const propHandle = (tag, props) => {
	const result = {};
	Object.entries(props ?? {}).forEach(([key, value]) => {
		if (SKIP_KEY_SET.has(key)) return;
		if (key.startsWith('on')) return;
		if (typeof value === 'function') return;
		if (value == null || value === false) return;
		result[key] = value === true ? '' : value;
	});
	return result;
};

export { propHandle };
