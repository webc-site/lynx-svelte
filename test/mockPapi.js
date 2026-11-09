const state = {
	next_id: 1,
	flush_count: 0,
	create_li: []
};

const nodeCreate = (tag, extra = {}) => {
	const node = {
		id: state.next_id++,
		tag,
		children: [],
		attrs: {},
		styles: '',
		classes: '',
		element_id: null,
		dataset: {},
		events: [],
		parent: null,
		text: '',
		...extra
	};
	state.create_li.push(node);
	return node;
};

const childIndexOf = (parent, node) => parent.children.indexOf(node);

const insertBefore = (parent, node, marker) => {
	if (node.parent != null) removeFromParent(node.parent, node);
	node.parent = parent;
	const index = marker == null ? -1 : childIndexOf(parent, node === marker ? null : marker);
	if (index === -1) parent.children.push(node);
	else parent.children.splice(index, 0, node);
	return node;
};

const removeFromParent = (parent, node) => {
	const index = childIndexOf(parent, node);
	if (index !== -1) parent.children.splice(index, 1);
	node.parent = null;
	return node;
};

const installPapi = () => {
	state.next_id = 1;
	state.flush_count = 0;
	state.create_li = [];

	const page_li = [];

	globalThis.__CreatePage = (component_id, css_id) => {
		const node = nodeCreate('page', { component_id, css_id });
		page_li.push(node);
		return node;
	};
	globalThis.__CreateView = () => nodeCreate('view');
	globalThis.__CreateScrollView = () => nodeCreate('scroll-view');
	globalThis.__CreateText = () => nodeCreate('text');
	globalThis.__CreateImage = () => nodeCreate('image');
	globalThis.__CreateList = (parent_id, component_at_index, enqueue_component) =>
		nodeCreate('list', { list_callbacks: [component_at_index, enqueue_component] });
	globalThis.__CreateElement = (tag) => nodeCreate(tag);
	globalThis.__CreateRawText = (text) => nodeCreate('raw-text', { text });
	globalThis.__CreateNonElement = () => nodeCreate('non-element');
	globalThis.__GetElementUniqueID = (node) => node.id;
	globalThis.__GetAttributeByName = (node, name) => node.attrs[name] ?? null;
	globalThis.__GetAttributeNames = (node) => Object.keys(node.attrs);
	globalThis.__InsertElementBefore = (parent, node, marker) => insertBefore(parent, node, marker);
	globalThis.__RemoveElement = (parent, node) => removeFromParent(parent, node);
	globalThis.__FirstElement = (node) => node.children[0] ?? null;
	globalThis.__LastElement = (node) => node.children[node.children.length - 1] ?? null;
	globalThis.__NextElement = (node) => {
		if (node.parent == null) return null;
		const index = childIndexOf(node.parent, node);
		return node.parent.children[index + 1] ?? null;
	};
	globalThis.__GetParent = (node) => node.parent;
	globalThis.__SetAttribute = (node, name, value) => {
		if (node.tag === 'raw-text' && name === 'text') node.text = value;
		node.attrs[name] = value;
	};
	globalThis.__SetInlineStyles = (node, value) => {
		node.styles = value;
	};
	globalThis.__SetClasses = (node, value) => {
		node.classes = value;
	};
	globalThis.__SetID = (node, value) => {
		node.element_id = value;
	};
	globalThis.__AddDataset = (node, key, value) => {
		node.dataset[key] = value;
	};
	globalThis.__SetDataset = (node, value) => {
		node.dataset = value ?? {};
	};
	globalThis.__AddEvent = (node, event_type, name, handler) => {
		node.events.push({ event_type, name, handler });
	};
	globalThis.__AddEventListener = (node, name, handler, options) => {
		node.events.push({ event_type: 'listener', name, handler, options });
	};
	globalThis.__RemoveEventListener = (node, name, handler) => {
		node.events = node.events.filter(
			(item) => !(item.name === name && (item.handler === handler || item.handler?.value === handler))
		);
	};
	globalThis.__FlushElementTree = () => {
		state.flush_count += 1;
	};

	return { state, page_li };
};

const uninstallPapi = () => {
	const name_li = [
		'__CreatePage',
		'__CreateView',
		'__CreateScrollView',
		'__CreateText',
		'__CreateImage',
		'__CreateList',
		'__CreateElement',
		'__CreateRawText',
		'__CreateNonElement',
		'__GetElementUniqueID',
		'__GetAttributeByName',
		'__GetAttributeNames',
		'__InsertElementBefore',
		'__RemoveElement',
		'__FirstElement',
		'__LastElement',
		'__NextElement',
		'__GetParent',
		'__SetAttribute',
		'__SetInlineStyles',
		'__SetClasses',
		'__SetID',
		'__AddDataset',
		'__SetDataset',
		'__AddEvent',
		'__AddEventListener',
		'__RemoveEventListener',
		'__FlushElementTree'
	];
	name_li.forEach((name) => {
		delete globalThis[name];
	});
};

const findNode = (root, predicate) => {
	if (root == null) return null;
	if (predicate(root)) return root;
	for (let i = 0; i < root.children.length; ++i) {
		const found = findNode(root.children[i], predicate);
		if (found != null) return found;
	}
	return null;
};

const findText = (root, text) => findNode(root, (node) => node.tag === 'raw-text' && node.text === text);

const treeText = (root) => {
	if (root == null) return '';
	if (root.tag === 'raw-text') return root.text;
	return root.children.map(treeText).join('');
};

const dispatchEvent = (node, name, event = {}) => {
	const hits = node.events.filter((item) => item.name === name);
	hits.forEach((item) => {
		if (item.handler != null && typeof item.handler.value === 'function') item.handler.value(event);
		else if (typeof item.handler === 'function') item.handler(event);
	});
	return hits.length;
};

export {
	installPapi,
	uninstallPapi,
	nodeCreate,
	findNode,
	findText,
	treeText,
	dispatchEvent,
	state
};
