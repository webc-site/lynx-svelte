import { createRenderer } from 'svelte/renderer';
import { pageIdGet, pageIdSet } from './pageState.js';
import {
	fragmentCreateNode,
	createElement,
	createTextNode,
	createComment,
	nodeTypeGet,
	nodeValueGet,
	setTextNode,
	firstChildGetNode,
	lastChildGetNode,
	nextSiblingGet,
	insertNode,
	removeNode,
	parentGetNode
} from './elementOp.js';
import { attributeGet, setAttribute, removeAttribute, attributeHas } from './attrOp.js';
import { addEventListener, removeEventListener } from './eventOp.js';

const renderer = createRenderer({
	createFragment: fragmentCreateNode,
	createElement,
	createTextNode,
	createComment,
	nodeType: nodeTypeGet,
	getNodeValue: nodeValueGet,
	getAttribute: attributeGet,
	setAttribute,
	removeAttribute,
	hasAttribute: attributeHas,
	setText: setTextNode,
	getFirstChild: firstChildGetNode,
	getLastChild: lastChildGetNode,
	getNextSibling: nextSiblingGet,
	insert: insertNode,
	remove: removeNode,
	getParent: parentGetNode,
	addEventListener,
	removeEventListener
});

const setPageId = (id) => pageIdSet(id);

export default renderer;
export { renderer as lynxRenderer, setPageId, pageIdGet };
