import { useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import fetchAllData from "../api/fetch-data.js";

import { initialState, reducer } from "./data-handling-functions.js";
import { TimerManager } from "./timer-manager.js";

import { useSnackbar } from "./index.js";

// Cache storage with memory estimate
const responseCache = {};
const cacheSizes = {}; // Track size of each cache entry in bytes (estimated)
const MAX_CACHE_SIZE_BYTES = 500 * 1024 * 1024; // 50MB max cache size
let currentCacheSize = 0;
const CACHE_LIFETIME = 25 * 60 * 1000;

// Roughly estimate object size in bytes
const estimateObjectSize = (obj) => JSON.stringify(obj).length * 2;

// Helper to enforce cache size limits
const enforceMemoryLimit = (newEntrySize, newKey) => {
	// If adding this entry wouldn't exceed the limit, we're fine
	if (currentCacheSize + newEntrySize <= MAX_CACHE_SIZE_BYTES) {
		return true;
	}

	// Need to clear space - sort keys by last access time
	const sortedKeys = Object.keys(responseCache)
		.filter((key) => key !== newKey)
		.sort((a, b) => responseCache[a].timestamp - responseCache[b].timestamp);

	// Remove oldest entries until we have enough space
	let removedSize = 0;

	for (const key of sortedKeys) {
		if (currentCacheSize + newEntrySize - removedSize <= MAX_CACHE_SIZE_BYTES) {
			break; // We've cleared enough space
		}

		removedSize += cacheSizes[key] || 0;
		console.log(`Removing cache entry ${key} to free up ${cacheSizes[key] || 0} bytes`);

		delete responseCache[key];
		delete cacheSizes[key];
	}

	currentCacheSize -= removedSize;
	return true;
};

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
				// console.log("Using cached data for:", cacheKey);
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
			refs.current.error("No data received");
			return;
		}

		let successCount = 0;

		// Process each response individually
		for (const [index, item] of promiseStatus.entries()) {
			const plotId = fetchConfigs[index].plotId;
			const dataType = plotId.toLowerCase().includes("price") ? "price"
				: plotId.toLowerCase().includes("production") ? "production"
					: "general";

			// Check if response is empty or has issues
			const isEmpty = !item?.response || (Array.isArray(item?.response) && item.response.length === 0);

			if (isEmpty) {
				const warningMessage = `No data available for ${plotId}`;
				refs.current.warning(warningMessage);
			} else {
				successCount++;
			}

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

		// Show success message for successful data fetches
		if (successCount > 0) {
			refs.current.success("Data loaded successfully");
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
			// Estimate size of this data
			const dataSize = estimateObjectSize(state.dataSets);

			// Enforce memory limit before adding
			enforceMemoryLimit(dataSize, cacheKey);

			responseCache[cacheKey] = {
				timestamp: Date.now(),
				dataSets: state.dataSets,
			};

			// Track size and update total
			cacheSizes[cacheKey] = dataSize;
			currentCacheSize += dataSize;
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
