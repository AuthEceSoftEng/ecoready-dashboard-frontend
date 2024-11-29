
/* eslint-disable consistent-return */
import { useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import fetchAllData from "../api/fetch-data.js";

import { initialState, reducer } from "./data-handling-functions.js";

import { useSnackbar } from "./index.js";

const FETCH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const MINUTES_UPDATE_INTERVAL = 60 * 1000; // 1 minute

const useInit = (organization, fetchConfigs) => {
	const { success, warning, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);

	// Memoize snackbar callbacks
	const snackbarCallbacks = useMemo(() => ({
		success,
		warning,
		error,
	}), [success, warning, error]);

	// Single ref object instead of multiple refs
	const refs = useRef({
		success: snackbarCallbacks.success,
		warning: snackbarCallbacks.warning,
		error: snackbarCallbacks.error,
	});

	// Update refs when callbacks change
	useEffect(() => {
		refs.current = snackbarCallbacks;
	}, [snackbarCallbacks]);

	const handleFetchResponse = useCallback((promiseStatus) => {
		const hasIssues = promiseStatus.some(
			(item) => item?.response?.success === false
            || (Array.isArray(item?.response) && item.response.length === 0),
		);

		if (hasIssues) {
			dispatch({ type: "FETCH_WARNING", payload: promiseStatus });
			refs.current.warning("Some plots may be empty due to no matching data");
		} else {
			dispatch({ type: "FETCH_SUCCESS", payload: promiseStatus });
			refs.current.success("All data fetched successfully");
		}
	}, []);

	const updateData = useCallback(async () => {
		try {
			dispatch({ type: "FETCH_START" });
			const promiseStatus = await fetchAllData(dispatch, organization, fetchConfigs);
			console.log("Promise status:", promiseStatus);
			handleFetchResponse(promiseStatus);
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
	}, [organization, fetchConfigs, handleFetchResponse]);

	useEffect(() => {
		if (!fetchConfigs) return;

		const minutesInterval = setInterval(() => {
			dispatch({ type: "UPDATE_MINUTES_AGO" });
		}, MINUTES_UPDATE_INTERVAL);

		const fetchInterval = setInterval(updateData, FETCH_INTERVAL);
		updateData();

		return () => {
			clearInterval(minutesInterval);
			clearInterval(fetchInterval);
		};
	}, [updateData, fetchConfigs]);

	return { state };
};

export default useInit;
