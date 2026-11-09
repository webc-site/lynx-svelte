const propMerge = (...prop_li) => {
	const result = {};
	prop_li.forEach((props) => {
		if (props == null) return;
		Object.entries(props).forEach(([key, value]) => {
			if (!(key in result)) {
				result[key] = value;
				return;
			}
			const previous = result[key];
			if (typeof previous === 'function' && typeof value === 'function') {
				result[key] = (...args) => {
					previous(...args);
					value(...args);
				};
				return;
			}
			result[key] = value;
		});
	});
	return result;
};

const listMerge = (value_li) => {
	const result_li = [];
	const collect = (value) => {
		if (value == null || value === false || value === '') return;
		if (Array.isArray(value)) {
			value.forEach(collect);
			return;
		}
		result_li.push(value);
	};
	value_li.forEach(collect);
	return result_li;
};

const styleMerge = (...style_li) => listMerge(style_li);

const classMerge = (...cls_li) => listMerge(cls_li);

export { propMerge, styleMerge, classMerge, listMerge };
