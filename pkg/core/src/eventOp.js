import {
	EVENT_TYPE_MAP,
	EVENT_TYPE_BIND,
	EVENT_NAME_REGEX,
	WORKLET_TYPE,
	ERR_INVALID_EVENT
} from './constant.js';
import { rawNode, listenersGet, listenersEnsure } from './nodeMap.js';

const papi = (name) => globalThis[name];

const eventParse = (type) => {
	const match = EVENT_NAME_REGEX.exec(type);
	if (match != null) {
		return [EVENT_TYPE_MAP[match[1]], match[2]];
	}
	return [EVENT_TYPE_BIND, type, ERR_INVALID_EVENT];
};

const addEventListener = (target, type, handler, options) => {
	if (target == null) return;
	const raw = rawNode(target),
		[event_type, event_name] = eventParse(type),
		entry = { type, event_type, event_name, handler, options },
		listener_li = listenersEnsure(raw),
		add_event = papi('__AddEvent'),
		add_listener = papi('__AddEventListener');

	listener_li.push(entry);

	if (add_event != null) {
		add_event(raw, event_type, event_name, { type: WORKLET_TYPE, value: handler });
	} else if (add_listener != null) {
		add_listener(raw, event_name, handler, options ?? {});
	}
};

const removeEventListener = (target, type, handler, options) => {
	if (target == null) return;
	const raw = rawNode(target),
		listener_li = listenersGet(raw),
		index = listener_li.findIndex((item) => item.type === type && item.handler === handler),
		entry = index === -1 ? null : listener_li[index],
		remove_listener = papi('__RemoveEventListener'),
		add_event = papi('__AddEvent');

	if (index !== -1) listener_li.splice(index, 1);

	if (entry == null) return;
	if (remove_listener != null) {
		remove_listener(raw, entry.event_name, handler, options ?? entry.options ?? {});
	} else if (add_event != null) {
		add_event(raw, entry.event_type, entry.event_name, undefined);
	}
};

const listenerCount = (target) => listenersGet(rawNode(target)).length;

export { eventParse, addEventListener, removeEventListener, listenerCount };
