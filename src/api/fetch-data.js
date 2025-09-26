import { getCollectionData, getCollectionDataStatistics, getCollections } from "./index.js";

// Request deduplication map
const pendingRequests = new Map();

export const fetchCollections = async (dispatch, organization, project) => {
	const requestKey = `collections_${organization}_${project}`;

	// Check for pending request
	if (pendingRequests.has(requestKey)) {
		return pendingRequests.get(requestKey);
	}

	try {
		const requestPromise = getCollections(organization, project)
			.then((response) => {
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
			})
			.finally(() => {
				pendingRequests.delete(requestKey);
			});

		pendingRequests.set(requestKey, requestPromise);
		return await requestPromise;
	} catch (error) {
		pendingRequests.delete(requestKey);
		dispatch({
			type: "FETCH_ERROR",
			payload: { error },
		});
		throw error;
	}
};

// Optimized fetchData that returns structured results without dispatching
export const fetchData = async (organization, project, collection, params, plotId, type = "data") => {
	const requestKey = `${type}_${organization}_${project}_${collection}_${plotId}_${JSON.stringify(params)}`;

	// Check for pending request
	if (pendingRequests.has(requestKey)) {
		return pendingRequests.get(requestKey);
	}

	try {
		const requestPromise = (type === "stats"
			? getCollectionDataStatistics(organization, project, collection, params)
			: getCollectionData(organization, project, collection, params))
			.then((response) => {
				const isEmpty = (Array.isArray(response) && response.length === 0) || response.success === false;

				return {
					plotId,
					response: isEmpty ? [] : response,
					isEmpty,
					warning: isEmpty ? `No data available for ${plotId}` : null,
					type: plotId.toLowerCase().includes("price") ? "price"
						: plotId.toLowerCase().includes("production") ? "production"
							: "general",
				};
			})
			.catch((error) => ({
				plotId,
				error: error.message || "Unknown error",
				hasError: true,
				type: plotId.toLowerCase().includes("price") ? "price"
					: plotId.toLowerCase().includes("production") ? "production"
						: "general",
			}))
			.finally(() => {
				pendingRequests.delete(requestKey);
			});

		pendingRequests.set(requestKey, requestPromise);
		return await requestPromise;
	} catch (error) {
		pendingRequests.delete(requestKey);
		return {
			plotId,
			error: error.message || "Unknown error",
			hasError: true,
			type: plotId.toLowerCase().includes("price") ? "price"
				: plotId.toLowerCase().includes("production") ? "production"
					: "general",
		};
	}
};

// Optimized batch fetching with better error handling
const fetchAllData = async (dispatch, organization, fetchConfigs) => {
	if (!Array.isArray(fetchConfigs)) {
		throw new TypeError("fetchConfigs should be an array");
	}

	// Group configs by type for optimized dispatching
	const configsByType = fetchConfigs.reduce((acc, config) => {
		const type = config.plotId.toLowerCase().includes("price") ? "price"
			: config.plotId.toLowerCase().includes("production") ? "production"
				: "general";

		if (!acc[type]) acc[type] = [];
		acc[type].push(config);
		return acc;
	}, {});

	// Process each type separately for better performance
	const processTypeGroup = async (configs, dataType) => {
		const promises = configs.map(
			({ project, collection, params, plotId, type }) => fetchData(organization, project, collection, params, plotId, type),
		);

		const results = await Promise.allSettled(promises);
		return results.map((result, index) => ({
			...result.value,
			dataType,
			config: configs[index],
		}));
	};

	try {
		// Process all types in parallel
		const typeResults = await Promise.all([
			configsByType.price ? processTypeGroup(configsByType.price, "price") : [],
			configsByType.production ? processTypeGroup(configsByType.production, "production") : [],
			configsByType.general ? processTypeGroup(configsByType.general, "general") : [],
		]);

		// Flatten results
		const allResults = typeResults.flat();

		// Group results by status and type
		const successResults = allResults.filter((r) => !r.hasError && !r.isEmpty);
		const warningResults = allResults.filter((r) => !r.hasError && r.isEmpty);
		const errorResults = allResults.filter((r) => r.hasError);

		// Batch dispatch by type
		if (successResults.length > 0) {
			dispatch({
				type: "FETCH_SUCCESS_BATCH",
				payload: { results: successResults },
			});
		}

		if (warningResults.length > 0) {
			dispatch({
				type: "FETCH_WARNING_BATCH",
				payload: { results: warningResults },
			});
		}

		if (errorResults.length > 0) {
			dispatch({
				type: "FETCH_ERROR_BATCH",
				payload: { results: errorResults },
			});
		}

		return allResults;
	} catch (error) {
		dispatch({
			type: "FETCH_ERROR",
			payload: { error: error.message },
		});
		throw error;
	}
};

export default fetchAllData;
