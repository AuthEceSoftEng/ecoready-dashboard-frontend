/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
import { useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import fetchAllData from "../api/fetch-data.js";

import { initialState, reducer } from "./data-handling-functions.js";

import { useSnackbar } from "./index.js";

const FETCH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const MINUTES_UPDATE_INTERVAL = 60 * 1000; // 1 minute

const useInit = (organization, fetchConfigs) => {
	const { success, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);

	// Memoize snackbar callbacks
	const snackbarCallbacks = useMemo(() => ({
		success,
		error,
	}), [success, error]);

	// Single ref object instead of multiple refs
	const refs = useRef({
		success: snackbarCallbacks.success,
		error: snackbarCallbacks.error,
	});

	// Update refs when callbacks change
	useEffect(() => {
		refs.current = snackbarCallbacks;
	}, [snackbarCallbacks]);

	const updateData = useCallback(async () => {
		try {
			dispatch({ type: "FETCH_START" });
			const data = await fetchAllData(dispatch, organization, fetchConfigs);

			if (!data || (Array.isArray(data) && data.some((item) => item !== undefined))) {
				dispatch({ type: "FETCH_ERROR" });
				refs.current.error("Invalid or empty data received");
				return;
			}

			dispatch({ type: "FETCH_SUCCESS", payload: data });
			refs.current.success("All data fetched successfully");
		} catch (error_) {
			dispatch({ type: "FETCH_ERROR" });
			refs.current.error(`Error fetching data: ${error_.message}`);
		}
	}, [organization, fetchConfigs]);

	useEffect(() => {
		if (!fetchConfigs) return;

		const timeouts = {
			minutes: null,
			fetch: null,
		};

		const cleanup = () => {
			for (const timeout of Object.values(timeouts)) timeout && clearInterval(timeout);
		};

		// Set up intervals
		timeouts.minutes = setInterval(() => {
			dispatch({ type: "UPDATE_MINUTES_AGO" });
		}, MINUTES_UPDATE_INTERVAL);

		updateData();
		timeouts.fetch = setInterval(updateData, FETCH_INTERVAL);

		return cleanup;
	}, [updateData, fetchConfigs]);

	return { state };
};

export default useInit;
