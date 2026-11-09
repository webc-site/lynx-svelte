import { ATTR_STYLE, ATTR_CLASS, ATTR_ID, ATTR_DATA_PREFIX } from './constant.js';
import { rawNode, attrGet, attrSet, attrDelete, attrHas, attrAll } from './nodeMap.js';
import { flushTree } from './elementOp.js';

const papi = (name) => globalThis[name];

const datasetCollect = (element) => {
	const dataset = {},
		attrs = attrAll(element);
	attrs.forEach((value, key) => {
		if (key.startsWith(ATTR_DATA_PREFIX)) dataset[key.slice(ATTR_DATA_PREFIX.length)] = value;
	});
	return dataset;
};

const datasetSync = (element) => {
	const sync = papi('__SetDataset');
	if (sync != null) sync(rawNode(element), datasetCollect(element));
};

const setAttribute = (element, key, value) => {
	if (element == null) return;
	attrSet(element, key, value);
	const raw = rawNode(element),
		set_inline = papi('__SetInlineStyles'),
		set_classes = papi('__SetClasses'),
		set_id = papi('__SetID'),
		add_dataset = papi('__AddDataset'),
		set_attr = papi('__SetAttribute');

	if (key === ATTR_STYLE && set_inline != null) {
		set_inline(raw, value);
	} else if (key === ATTR_CLASS && set_classes != null) {
		set_classes(raw, value);
	} else if (key === ATTR_ID && set_id != null) {
		set_id(raw, value);
	} else if (key.startsWith(ATTR_DATA_PREFIX) && add_dataset != null) {
		add_dataset(raw, key.slice(ATTR_DATA_PREFIX.length), value);
	} else if (set_attr != null) {
		set_attr(raw, key, value);
	}
	flushTree(element);
};

const removeAttribute = (element, name) => {
	if (element == null) return;
	attrDelete(element, name);
	const raw = rawNode(element),
		set_inline = papi('__SetInlineStyles'),
		set_classes = papi('__SetClasses'),
		set_id = papi('__SetID'),
		set_attr = papi('__SetAttribute');

	if (name === ATTR_STYLE && set_inline != null) {
		set_inline(raw, '');
	} else if (name === ATTR_CLASS && set_classes != null) {
		set_classes(raw, '');
	} else if (name === ATTR_ID && set_id != null) {
		set_id(raw, null);
	} else if (name.startsWith(ATTR_DATA_PREFIX)) {
		datasetSync(element);
	} else if (set_attr != null) {
		set_attr(raw, name, null);
	}
	flushTree(element);
};

const attributeGet = (element, name) => attrGet(element, name);

const attributeHas = (element, name) => attrHas(element, name);

export { setAttribute, removeAttribute, attributeGet, attributeHas, datasetCollect };
