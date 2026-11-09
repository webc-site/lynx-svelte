let page_id = 0;

const pageIdGet = () => page_id;

const pageIdSet = (value) => {
	page_id = value;
};

export { pageIdGet, pageIdSet };
