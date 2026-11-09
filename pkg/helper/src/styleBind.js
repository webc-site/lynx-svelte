const UNITLESS_PROPERTY_LI = [
	'opacity',
	'z-index',
	'zIndex',
	'font-weight',
	'fontWeight',
	'line-height',
	'lineHeight',
	'flex',
	'flex-grow',
	'flexGrow',
	'flex-shrink',
	'flexShrink',
	'order',
	'zoom'
];

const UNITLESS_SET = new Set(UNITLESS_PROPERTY_LI);

const kebabCase = (name) => name.replaceAll(/[A-Z]/g, (char) => '-' + char.toLowerCase());

const isPlainObject = (value) => value != null && typeof value === 'object' && !Array.isArray(value);

const styleValue = (name, value) => {
	if (value == null || value === false) return null;
	if (typeof value === 'number') {
		if (value === 0 || UNITLESS_SET.has(name)) return String(value);
		return value + 'px';
	}
	return String(value);
};

const styleObject = (style) => {
	const prop_li = [];
	Object.entries(style).forEach(([name, value]) => {
		const prop_name = kebabCase(name),
			prop_value = styleValue(prop_name, value);
		if (prop_value != null) prop_li.push(prop_name + ':' + prop_value);
	});
	return prop_li;
};

const styleBind = (style_li) => {
	const prop_li = [];
	const collect = (value) => {
		if (value == null || value === false || value === '') return;
		if (typeof value === 'string') {
			const text = value.trim().replaceAll(/;+$/g, '');
			if (text !== '') prop_li.push(text);
			return;
		}
		if (Array.isArray(value)) {
			value.forEach(collect);
			return;
		}
		if (isPlainObject(value)) {
			const entries = styleObject(value);
			if (entries.length > 0) prop_li.push(entries.join(';'));
		}
	};
	collect(style_li);
	if (prop_li.length === 0) return '';
	return prop_li.join(';') + ';';
};

export { styleBind, kebabCase, styleValue, UNITLESS_SET };
