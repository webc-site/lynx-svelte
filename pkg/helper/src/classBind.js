const classCollect = (value, result_li) => {
	if (value == null || value === false || value === '') return;
	if (typeof value === 'string') {
		const text = value.trim();
		if (text !== '') result_li.push(text);
		return;
	}
	if (typeof value === 'number') {
		result_li.push(String(value));
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((item) => classCollect(item, result_li));
		return;
	}
	if (typeof value === 'object') {
		Object.entries(value).forEach(([name, enabled]) => {
			if (enabled) classCollect(name, result_li);
		});
	}
};

const classBind = (cls_li) => {
	const result_li = [];
	classCollect(cls_li, result_li);
	return result_li.join(' ');
};

export { classBind };
