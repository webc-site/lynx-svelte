const DEG_UNIT_LI = ['rotate', 'rotateX', 'rotateY', 'rotateZ', 'skew', 'skewX', 'skewY'];
const PX_UNIT_LI = ['translate', 'translateX', 'translateY', 'translateZ', 'perspective'];
const DEG_UNIT_SET = new Set(DEG_UNIT_LI);
const PX_UNIT_SET = new Set(PX_UNIT_LI);

const transformItem = (name, value) => {
	if (value == null) return '';
	if (typeof value === 'string') return name + '(' + value + ')';
	if (typeof value === 'number') {
		if (DEG_UNIT_SET.has(name)) return name + '(' + value + 'deg)';
		if (PX_UNIT_SET.has(name)) return name + '(' + value + 'px)';
		return name + '(' + value + ')';
	}
	if (Array.isArray(value)) return name + '(' + value.join(',') + ')';
	return '';
};

const transformParse = (value) => {
	if (value == null) return '';
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) {
		return value
			.map(transformParse)
			.filter((item) => item !== '')
			.join(' ');
	}
	if (typeof value === 'object') {
		return Object.entries(value)
			.map(([name, item]) => transformItem(name, item))
			.filter((item) => item !== '')
			.join(' ');
	}
	return '';
};

const TRANSFORM_REGEX_MAP = {
	rotate: /rotate\(([-+]?[\d]*\.?[\d]+)deg\)/,
	rotateX: /rotateX\(([-+]?[\d]*\.?[\d]+)deg\)/,
	rotateY: /rotateY\(([-+]?[\d]*\.?[\d]+)deg\)/,
	rotateZ: /rotateZ\(([-+]?[\d]*\.?[\d]+)deg\)/,
	skewX: /skewX\(([-+]?[\d]*\.?[\d]+)deg\)/,
	skewY: /skewY\(([-+]?[\d]*\.?[\d]+)deg\)/,
	scale: /scale\(([-+]?[\d]*\.?[\d]+)\)/,
	scaleX: /scaleX\(([-+]?[\d]*\.?[\d]+)\)/,
	scaleY: /scaleY\(([-+]?[\d]*\.?[\d]+)\)/,
	translateX: /translateX\(([-+]?[\d]*\.?[\d]+)(px)?\)/,
	translateY: /translateY\(([-+]?[\d]*\.?[\d]+)(px)?\)/
};

const translateRegex = /translate\(([-+]?[\d]*\.?[\d]+)(px)?,\s*([-+]?[\d]*\.?[\d]+)(px)?\)/;

const numberParse = (value) => {
	const number = parseFloat(value);
	return Number.isNaN(number) ? value : number;
};

const transformParseCss = (value) => {
	if (typeof value !== 'string') return {};
	const result = {};
	Object.entries(TRANSFORM_REGEX_MAP).forEach(([name, regex]) => {
		const match = regex.exec(value);
		if (match == null) return;
		const item = numberParse(match[1]);
		result[name] = name.startsWith('rotate') || name.startsWith('skew') ? item + 'deg' : item;
	});
	const translate = translateRegex.exec(value);
	if (translate != null) {
		result.translateX = numberParse(translate[1]);
		result.translateY = numberParse(translate[3]);
	}
	return result;
};

export { transformParse, transformItem, transformParseCss };
