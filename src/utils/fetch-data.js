import { getCollectionData, getCollectionDataStatistics } from "../api/index.js";

export const fetchData = async (organization, project, collection, accessKey, params, plotId, setDataSets, setPageRefreshTime, type = "data") => {
	try {
		const response = await (type === "stats" ? getCollectionDataStatistics(organization, project, collection, accessKey, params) : getCollectionData(organization, project, collection, accessKey, params));

		setDataSets((prevDataSets) => ({
			...prevDataSets,
			[plotId]: response,
		}));
		setPageRefreshTime(new Date());
		console.log(`Data fetched for plot ${plotId}:`, response);
	} catch (error) {
		console.error("Error fetching data:", error);
		throw error;
	}
};

const fetchAllData = async (fetchConfigs, accessKey, setDataSets, setPageRefreshTime, success, error) => {
	// Create an array of promises for each fetch operation
	const fetchPromises = fetchConfigs.map(({ organization, project, collection, params, plotId, type }) => {
		try {
			return fetchData(
				organization,
				project,
				collection,
				accessKey,
				params,
				plotId,
				setDataSets,
				setPageRefreshTime,
				type,
			);
		} catch (error_) {
			console.error("Error fetching data:", error_);
			throw error_; // Re-throw the error to be caught by Promise.all
		}
	});

	// Wait for all fetch operations to complete
	try {
		await Promise.all(fetchPromises);
		success("All data fetched successfully");
	} catch (error_) {
		error(`Error fetching some data: ${error_.message}`);
	}
};

export default fetchAllData;
