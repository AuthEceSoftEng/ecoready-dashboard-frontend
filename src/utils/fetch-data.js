import { getCollectionData, getCollectionDataStatistics } from "../api/index.js";

const fetchData = async (type='data', organization, project, collection, accessKey, params, plotId, setDataSets, setPageRefreshTime) => {
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

export default fetchData;