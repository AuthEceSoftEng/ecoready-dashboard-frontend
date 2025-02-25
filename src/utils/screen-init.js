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
		// Check if we have any responses
		if (promiseStatus.length === 0) {
			dispatch({
				type: "FETCH_ERROR",
				payload: { error: "No data received" },
			});
			return;
		}

		// Process each response individually
		for (const [index, item] of promiseStatus.entries()) {
			const plotId = fetchConfigs[index].plotId;
			const dataType = plotId.toLowerCase().includes("price") ? "price"
				: plotId.toLowerCase().includes("production") ? "production"
					: "general";

			// Check if response is empty or has issues
			const isEmpty = !item?.response || (Array.isArray(item?.response) && item.response.length === 0);

			dispatch({
				type: isEmpty ? "FETCH_WARNING" : "FETCH_SUCCESS",
				payload: {
					plotId,
					response: isEmpty ? [] : item.response,
					dataType,
					warning: isEmpty ? `No data available for ${plotId}` : null,
				},
			});
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
