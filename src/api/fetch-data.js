import { getCollectionData, getCollectionDataStatistics, getCollections } from "./index.js";

export const fetchCollections = async (dispatch, organization, project) => {
	try {
		const response = await getCollections(organization, project);

		if (response.success === false) {
			dispatch({
				type: "FETCH_ERROR",
				payload: { response },
				error: "No collections found",
			});
			console.warn("Warning: Collections fetched are empty.");
		} else {
			dispatch({
				type: "FETCH_SUCCESS",
				payload: { response },
			});
			console.log("Collections fetched:", response);
		}

		return { response };
	} catch (error) {
		dispatch({
			type: "FETCH_ERROR",
			payload: { error },
		});
		throw error;
	}
};

export const fetchData = async (dispatch, organization, project, collection, params, plotId, type = "data") => {
	try {
		const response = await (type === "stats"
			? getCollectionDataStatistics(organization, project, collection, params)
			: getCollectionData(organization, project, collection, params));

		if ((Array.isArray(response) && response.length === 0) || response.success === false) {
			dispatch({
				type: "FETCH_WARNING",
				payload: { plotId, response },
				warning: "Some values may be missing",
			});
			console.warn(`Warning: Data fetched for plot ${plotId} is empty.`);
		} else {
			dispatch({
				type: "FETCH_SUCCESS",
				payload: { plotId, response },
			});
		}

		return { response };
	} catch (error) {
		dispatch({
			type: "FETCH_ERROR",
			payload: { plotId, error },
		});
		throw error;
	}
};

const fetchAllData = (dispatch, organization, fetchConfigs) => {
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
			params,
			plotId,
			type,
		),
	);

	return Promise.all(promises);
};

export default fetchAllData;
