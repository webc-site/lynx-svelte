import {
	NODE_TYPE_FRAGMENT,
	NODE_TYPE_TEXT,
	NODE_TYPE_COMMENT,
	TAG_VIEW,
	TAG_SCROLL_VIEW,
	TAG_TEXT,
	TAG_IMAGE,
	TAG_LIST
} from './constant.js';
import { pageIdGet } from './pageState.js';
import {
	fragmentCreate,
	commentCreate,
	textCreate,
	rawNode,
	isFragment,
	nodeKind,
	childrenGet,
	childInsert,
	childRemove,
	parentGet,
	siblingGet,
	firstChildGet,
	lastChildGet,
	textGet,
	textSet
} from './nodeMap.js';

const papi = (name) => globalThis[name];

const flushTree = (node) => {
	const flush = papi('__FlushElementTree'),
		value = rawNode(node);
	if (flush != null && value != null) flush(value);
};

const fallbackNode = (tag) => ({ __lynx_fallback_tag: tag });

const fallbackText = (text) => {
	const node = { __lynx_fallback_tag: 'raw-text', text };
	return node;
};

const createTextNode = (data) => {
	const create = papi('__CreateRawText');
	if (create == null) return textCreate(fallbackText(data), data);
	return textCreate(create(data), data);
};

const createComment = (data) => {
	const create = papi('__CreateNonElement'),
		create_dom = globalThis.document?.createComment?.bind(globalThis.document);

	if (create != null) return commentCreate(create(pageIdGet()), data);
	if (create_dom != null) return commentCreate(create_dom(data), data);
	return commentCreate(fallbackNode('non-element'), data);
};

const createElement = (name) => {
	const page_id = pageIdGet(),
		create_view = papi('__CreateView'),
		create_scroll = papi('__CreateScrollView'),
		create_text = papi('__CreateText'),
		create_image = papi('__CreateImage'),
		create_list = papi('__CreateList'),
		create_element = papi('__CreateElement');

	if (name === TAG_VIEW && create_view != null) return create_view(page_id);
	if (name === TAG_SCROLL_VIEW && create_scroll != null) return create_scroll(page_id);
	if (name === TAG_TEXT && create_text != null) return create_text(page_id);
	if (name === TAG_IMAGE && create_image != null) return create_image(page_id);
	if (name === TAG_LIST && create_list != null) {
		const component_at_index = () => undefined,
			enqueue_component = () => undefined;
		return create_list(page_id, component_at_index, enqueue_component);
	}
	if (create_element != null) return create_element(name, page_id);
	return fallbackNode(name);
};

const insertRaw = (parent, node, anchor) => {
	if (isFragment(parent)) return;
	const insert = papi('__InsertElementBefore'),
		parent_raw = rawNode(parent),
		node_raw = rawNode(node),
		anchor_raw = anchor == null ? undefined : rawNode(anchor);
	if (insert != null && parent_raw != null && node_raw != null) insert(parent_raw, node_raw, anchor_raw);
	flushTree(parent);
};

const detachRaw = (parent, node) => {
	if (isFragment(parent)) return;
	const remove = papi('__RemoveElement'),
		parent_raw = rawNode(parent),
		node_raw = rawNode(node);
	if (remove != null && parent_raw != null && node_raw != null) remove(parent_raw, node_raw);
	flushTree(parent);
};

const insertNode = (parent, node, anchor = null) => {
	if (parent == null || node == null || anchor === node) return;

	if (isFragment(node)) {
		const child_li = [...childrenGet(node)];
		child_li.forEach((child) => insertNode(parent, child, anchor));
		return;
	}

	const old_parent = parentGet(node);
	if (old_parent != null) {
		childRemove(old_parent, node);
		detachRaw(old_parent, node);
	}

	childInsert(parent, node, anchor);
	insertRaw(parent, node, anchor);
};

const removeNode = (node) => {
	if (node == null) return;
	if (isFragment(node)) {
		[...childrenGet(node)].forEach(removeNode);
		return;
	}
	const parent = parentGet(node);
	if (parent == null) return;
	childRemove(parent, node);
	detachRaw(parent, node);
};

const nodeTypeGet = (node) => {
	const kind = nodeKind(node);
	if (kind != null) return kind;
	return NODE_TYPE_ELEMENT;
};

const nodeValueGet = (node) => {
	const kind = nodeKind(node);
	if (kind === NODE_TYPE_TEXT) return textGet(node);
	if (kind === NODE_TYPE_COMMENT) return node.value ?? '';
	return null;
};

const setTextNode = (node, text) => {
	if (node == null) return;
	const kind = nodeKind(node);
	if (kind === NODE_TYPE_TEXT) {
		textSet(node, text);
		const set = papi('__SetAttribute');
		if (set != null) set(rawNode(node), 'text', text);
		flushTree(node);
		return;
	}
	if (kind === NODE_TYPE_COMMENT) {
		node.value = text;
		return;
	}
	const set = papi('__SetAttribute');
	if (set != null) set(rawNode(node), 'text', text);
	flushTree(node);
};

const firstChildGetNode = (node) => firstChildGet(node);

const lastChildGetNode = (node) => lastChildGet(node);

const nextSiblingGet = (node) => siblingGet(node);

const parentGetNode = (node) => parentGet(node);

const fragmentCreateNode = () => fragmentCreate();

export {
	flushTree,
	createElement,
	createTextNode,
	createComment,
	insertNode,
	removeNode,
	nodeTypeGet,
	nodeValueGet,
	setTextNode,
	firstChildGetNode,
	lastChildGetNode,
	nextSiblingGet,
	parentGetNode,
	fragmentCreateNode,
	NODE_TYPE_FRAGMENT
};
