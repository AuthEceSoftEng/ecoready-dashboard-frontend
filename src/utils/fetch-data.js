import { getCollectionData, getCollectionDataStatistics } from "../api/index.js";

export const fetchData = async (type='data', organization, project, collection, accessKey, params, plotId, setDataSets, setPageRefreshTime) => {
    try {
        let response;
        if (type === 'stats') {
            response = await getCollectionDataStatistics(organization, project, collection, accessKey, params);
        } else {
            response = await getCollectionData(organization, project, collection, accessKey, params);
        }
        setDataSets(prevDataSets => ({
            ...prevDataSets,
            [plotId]: response
        }));
        setPageRefreshTime(new Date());
        console.log(`Data fetched for plot ${plotId}:`, response);
    } catch (err) {
        console.error('Error fetching data:', err);
        throw err;
    }
};

const fetchAllData = async (fetchConfigs, accessKey, setDataSets, setPageRefreshTime, success, error) => {
    // Create an array of promises for each fetch operation
    const fetchPromises = fetchConfigs.map(({ type, organization, project, collection, params, plotId }) => {
        try {
            return fetchData(
                type, 
                organization, 
                project, 
                collection, 
                accessKey, 
                params, 
                plotId, 
                setDataSets, 
                setPageRefreshTime
            );
        } catch (err) {
            console.error('Error fetching data:', err);
            throw err; // Re-throw the error to be caught by Promise.all
        }
    });

    // Wait for all fetch operations to complete
    return Promise.all(fetchPromises)
        .then(() => {
            success('All data fetched successfully');
        })
        .catch(err => {
            error('Error fetching some data: ' + err.message);
        });
};

export default fetchAllData;