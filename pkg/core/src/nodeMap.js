import { NODE_TYPE_FRAGMENT, NODE_TYPE_TEXT, NODE_TYPE_COMMENT, NODE_TYPE_ELEMENT } from './constant.js';

const child_map = new WeakMap(),
	parent_map = new WeakMap(),
	attr_map = new WeakMap(),
	text_map = new WeakMap(),
	kind_map = new WeakMap(),
	listener_map = new WeakMap();

const isFragment = (node) => node != null && node.__lynx_kind === NODE_TYPE_FRAGMENT;

const isComment = (node) => node != null && node.__lynx_kind === NODE_TYPE_COMMENT;

const rawNode = (node) => (isComment(node) ? node.node : node);

const nodeKind = (node) => {
	if (node == null) return undefined;
	const kind = kind_map.get(node);
	if (kind != null) return kind;
	if (text_map.has(node)) return NODE_TYPE_TEXT;
	if (isFragment(node)) return NODE_TYPE_FRAGMENT;
	if (isComment(node)) return NODE_TYPE_COMMENT;
	return NODE_TYPE_ELEMENT;
};

const fragmentCreate = () => {
	const fragment = { __lynx_kind: NODE_TYPE_FRAGMENT };
	child_map.set(fragment, []);
	kind_map.set(fragment, NODE_TYPE_FRAGMENT);
	return fragment;
};

const commentCreate = (node, value) => {
	const comment = { __lynx_kind: NODE_TYPE_COMMENT, node, value };
	kind_map.set(comment, NODE_TYPE_COMMENT);
	return comment;
};

const textCreate = (node, value) => {
	text_map.set(node, value);
	kind_map.set(node, NODE_TYPE_TEXT);
	return node;
};

const childrenGet = (node) => child_map.get(node) ?? [];

const childrenEnsure = (node) => {
	let children = child_map.get(node);
	if (children == null) {
		children = [];
		child_map.set(node, children);
	}
	return children;
};

const childAdd = (parent, node) => {
	const children = childrenEnsure(parent);
	children.push(node);
	parent_map.set(node, parent);
};

const childInsert = (parent, node, anchor) => {
	const children = childrenEnsure(parent);
	const index = anchor == null ? -1 : children.indexOf(anchor);
	if (index === -1) {
		children.push(node);
	} else {
		children.splice(index, 0, node);
	}
	parent_map.set(node, parent);
};

const childRemove = (parent, node) => {
	const children = childrenGet(parent);
	const index = children.indexOf(node);
	if (index !== -1) children.splice(index, 1);
	parent_map.delete(node);
};

const childIndexOf = (node) => {
	const parent = parent_map.get(node);
	if (parent == null) return -1;
	return childrenGet(parent).indexOf(node);
};

const parentGet = (node) => parent_map.get(node) ?? null;

const siblingGet = (node) => {
	const parent = parent_map.get(node);
	if (parent == null) return null;
	const children = childrenGet(parent);
	const index = children.indexOf(node);
	return index === -1 ? null : children[index + 1] ?? null;
};

const firstChildGet = (node) => childrenGet(node)[0] ?? null;

const lastChildGet = (node) => {
	const children = childrenGet(node);
	return children[children.length - 1] ?? null;
};

const attrGet = (node, name) => {
	const attrs = attr_map.get(node);
	if (attrs == null || !attrs.has(name)) return null;
	return attrs.get(name);
};

const attrSet = (node, name, value) => {
	let attrs = attr_map.get(node);
	if (attrs == null) {
		attrs = new Map();
		attr_map.set(node, attrs);
	}
	attrs.set(name, value);
};

const attrDelete = (node, name) => {
	const attrs = attr_map.get(node);
	if (attrs != null) attrs.delete(name);
};

const attrHas = (node, name) => {
	const attrs = attr_map.get(node);
	return attrs != null && attrs.has(name);
};

const attrAll = (node) => attr_map.get(node) ?? new Map();

const textGet = (node) => text_map.get(node) ?? null;

const textSet = (node, value) => {
	text_map.set(node, value);
	kind_map.set(node, NODE_TYPE_TEXT);
};

const listenersGet = (node) => listener_map.get(node) ?? [];

const listenersEnsure = (node) => {
	let listeners = listener_map.get(node);
	if (listeners == null) {
		listeners = [];
		listener_map.set(node, listeners);
	}
	return listeners;
};

export {
	isFragment,
	isComment,
	rawNode,
	nodeKind,
	fragmentCreate,
	commentCreate,
	textCreate,
	childrenGet,
	childrenEnsure,
	childAdd,
	childInsert,
	childRemove,
	childIndexOf,
	parentGet,
	siblingGet,
	firstChildGet,
	lastChildGet,
	attrGet,
	attrSet,
	attrDelete,
	attrHas,
	attrAll,
	textGet,
	textSet,
	listenersGet,
	listenersEnsure
};
