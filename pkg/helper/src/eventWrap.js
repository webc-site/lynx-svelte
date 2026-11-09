const eventValue = (event) => {
	if (event == null) return undefined;
	if (event.detail != null && typeof event.detail === 'object' && 'value' in event.detail) return event.detail.value;
	if ('detail' in event) return event.detail;
	if ('value' in event) return event.value;
	return undefined;
};

const inputBind = (onUpdate) => (event) => onUpdate(eventValue(event));

const onceWrap = (fn) => {
	let called = false;
	return (...args) => {
		if (called) return undefined;
		called = true;
		return fn(...args);
	};
};

const tapBind = (fn) => (event) => fn(event);

const eventMerge = (fn) => {
	if (!Array.isArray(fn)) return fn;
	const fn_li = fn.filter((item) => typeof item === 'function');
	return (...args) => fn_li.forEach((item) => item(...args));
};

export { eventValue, inputBind, onceWrap, tapBind, eventMerge };
