export const NODE_TYPE_FRAGMENT = 'fragment',
	NODE_TYPE_ELEMENT = 'element',
	NODE_TYPE_TEXT = 'text',
	NODE_TYPE_COMMENT = 'comment';

export const ATTR_STYLE = 'style',
	ATTR_CLASS = 'class',
	ATTR_ID = 'id',
	ATTR_TEXT = 'text',
	ATTR_DATA_PREFIX = 'data-';

export const EVENT_BIND = 'bind',
	EVENT_CATCH = 'catch',
	EVENT_CAPTURE_BIND = 'capture-bind',
	EVENT_CAPTURE_CATCH = 'capture-catch',
	EVENT_GLOBAL_BIND = 'global-bind';

export const EVENT_TYPE_BIND = 'bindEvent',
	EVENT_TYPE_CATCH = 'catchEvent',
	EVENT_TYPE_CAPTURE_BIND = 'capture-bind',
	EVENT_TYPE_CAPTURE_CATCH = 'capture-catch',
	EVENT_TYPE_GLOBAL_BIND = 'global-bindEvent';

export const EVENT_TYPE_MAP = {
	[EVENT_BIND]: EVENT_TYPE_BIND,
	[EVENT_CATCH]: EVENT_TYPE_CATCH,
	[EVENT_CAPTURE_BIND]: EVENT_TYPE_CAPTURE_BIND,
	[EVENT_CAPTURE_CATCH]: EVENT_TYPE_CAPTURE_CATCH,
	[EVENT_GLOBAL_BIND]: EVENT_TYPE_GLOBAL_BIND
};

export const EVENT_NAME_REGEX = /^(bind|catch|capture-bind|capture-catch|global-bind)([A-Za-z0-9_]+)$/;

export const WORKLET_TYPE = 'worklet';

export const ERR_NO_PAPI = 1,
	ERR_UNKNOWN_NODE = 2,
	ERR_INVALID_EVENT = 3;

export const TAG_VIEW = 'view',
	TAG_SCROLL_VIEW = 'scroll-view',
	TAG_TEXT = 'text',
	TAG_IMAGE = 'image',
	TAG_LIST = 'list';

export const PAGE_COMPONENT_ID = '0',
	PAGE_CSS_ID = 0;
