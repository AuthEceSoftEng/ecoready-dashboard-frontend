import { useEffect, useReducer, useRef, useCallback } from "react";

import fetchAllData from "../api/fetch-data.js";

import { initialState, reducer } from "./data-handling-functions.js";
import { TimerManager } from "./timer-manager.js";

import { useSnackbar } from "./index.js";

const useInit = (organization, fetchConfigs) => {
	const { success, warning, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);

	const refs = useRef({ success, warning, error });

	useEffect(() => {
		refs.current = { success, warning, error };
	}, [success, warning, error]);

	const handleFetchResponse = useCallback((promiseStatus) => {
		// ensure that there are no 500 errors or empty responses
		const hasIssues = promiseStatus.some(
			(item) => item?.response?.success === false
				|| (Array.isArray(item?.response) && item.response.length === 0),
		);

		// Map through each response and dispatch individually
		for (const [index, item] of promiseStatus.entries()) {
			const plotId = fetchConfigs[index].plotId;
			// Determine if this is a price or production request based on plotId
			const dataType = plotId.toLowerCase().includes("price") ? "price"
				: plotId.toLowerCase().includes("production") ? "production"
					: "general";

			dispatch({
				type: hasIssues ? "FETCH_WARNING" : "FETCH_SUCCESS",
				payload: {
					plotId,
					response: item.response,
					dataType, // Add dataType to payload
				},
				...(hasIssues && { warning: "Some plots may be empty due to no matching data" }),
			});
		}

		// Show appropriate snackbar message
		if (hasIssues) {
			refs.current.warning("Some plots may be empty due to no matching data");
		} else {
			refs.current.success("All data fetched successfully");
		}
	}, [fetchConfigs]);

	const updateData = useCallback(async (configs = fetchConfigs) => {
		if (!configs?.length) return;

		try {
			// Determine if we're fetching specific data types
			const isPriceOnly = configs.every((config) => config.plotId.toLowerCase().includes("price"));
			const isProductionOnly = configs.every((config) => config.plotId.toLowerCase().includes("production"));

			// Dispatch appropriate start action
			dispatch({
				type: isPriceOnly ? "FETCH_PRICE_START"
					: isProductionOnly ? "FETCH_PRODUCTION_START"
						: "FETCH_START",
			});

			const promiseStatus = await fetchAllData(dispatch, organization, configs);
			handleFetchResponse(promiseStatus, configs);
		} catch (error_) {
			dispatch({
				type: "FETCH_ERROR",
				payload: {
					error: error_.message,
					type: "error",
				},
			});
			console.error("Error fetching data:", error_);
			refs.current.error(`Error fetching data: ${error_.message}`);
		}
	}, [organization, handleFetchResponse, fetchConfigs]);

	useEffect(() => {
		const timerManager = new TimerManager(
			() => updateData(fetchConfigs),
			() => dispatch({ type: "UPDATE_MINUTES_AGO" }),
		);

		timerManager.start();

		return () => { timerManager.stop(); };
	}, [updateData, fetchConfigs]);

	return { state, dispatch, updateData };
};

export default useInit;
