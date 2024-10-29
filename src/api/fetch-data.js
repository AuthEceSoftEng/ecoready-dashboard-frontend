import { getCollectionData, getCollectionDataStatistics } from "./index.js";

const FETCH_SUCCESS = "FETCH_SUCCESS";
const FETCH_ERROR = "FETCH_ERROR";

export const fetchData = async (dispatch, organization, project, collection, accessKey, params, plotId, type = "data") => {
	try {
		const response = await (type === "stats" ? getCollectionDataStatistics(organization, project, collection, accessKey, params) : getCollectionData(organization, project, collection, accessKey, params));

		dispatch({
			type: FETCH_SUCCESS,
			payload: { plotId, response },
		});
		console.log(`Data fetched for plot ${plotId}:`, response);
	} catch (error) {
		console.error("Error fetching data:", error);
		dispatch({
			type: FETCH_ERROR,
			payload: { plotId, error },
		});
		throw error;
	}
};

const fetchAllData = (dispatch, organization, accessKey, fetchConfigs) => {
	// console.log("fetchConfigs:", fetchConfigs);
	if (!Array.isArray(fetchConfigs)) {
		throw new TypeError("fetchConfigs should be an array");
	}

	// Create an array of promises for each fetch operation
	const promises = fetchConfigs.map(
		({ project, collection, params, plotId, type }) => fetchData(
			dispatch,
			organization,
			project,
			collection,
			accessKey,
			params,
			plotId,
			type,
		),
	);

	return Promise.all(promises);
};

export default fetchAllData;
