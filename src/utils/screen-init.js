import { useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import fetchAllData from "../api/fetch-data.js";

import { initialState, reducer } from "./data-handling-functions.js";
import { TimerManager } from "./timer-manager.js";

import { useSnackbar } from "./index.js";

// Cache storage
const responseCache = {};
// Cache lifetime in milliseconds (5 minutes)
const CACHE_LIFETIME = 25 * 60 * 1000;

const useInit = (organization, fetchConfigs) => {
	const { success, warning, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);
	const refs = useRef({ success, warning, error });

	// Generate a cache key from the organization and fetchConfigs
	const cacheKey = useMemo(() => {
		if (!organization || !fetchConfigs?.length) return null;
		return `${organization}_${JSON.stringify(fetchConfigs)}`;
	}, [organization, fetchConfigs]);

	// Track if we're using cached data
	const isCacheUsed = useRef(false);

	useEffect(() => {
		refs.current = { success, warning, error };
	}, [success, warning, error]);

	// Check cache when configs change
	useEffect(() => {
		if (cacheKey && responseCache[cacheKey]) {
			const cachedData = responseCache[cacheKey];

			// Check if cache is still valid
			if (Date.now() - cachedData.timestamp < CACHE_LIFETIME) {
				console.log("Using cached data for:", cacheKey);
				isCacheUsed.current = true;

				// Restore state from cache
				dispatch({
					type: "CACHE_RESTORE",
					payload: {
						dataSets: cachedData.dataSets,
						minutesAgo: Math.floor((Date.now() - cachedData.timestamp) / 60_000),
					},
				});
			} else {
				console.log("Cache expired for:", cacheKey);
			}
		}
	}, [cacheKey]);

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

		// If we've already used cache for this render cycle, don't fetch again
		if (isCacheUsed.current) {
			isCacheUsed.current = false; // Reset for next time
			return;
		}

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
	}, [organization, handleFetchResponse, fetchConfigs, isCacheUsed]);

	// Cache successful results
	useEffect(() => {
		// Only cache when data is loaded and we have a valid key
		if (!state.isLoading && cacheKey && state.dataSets && Object.keys(state.dataSets).length > 0) {
			responseCache[cacheKey] = {
				timestamp: Date.now(),
				dataSets: state.dataSets,
			};
			console.log("Cached data for:", cacheKey);
		}
	}, [state.isLoading, state.dataSets, cacheKey]);

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
