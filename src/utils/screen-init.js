/* eslint-disable consistent-return */
import { useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import fetchAllData from "../api/fetch-data.js";

import { initialState, reducer } from "./data-handling-functions.js";
import { TimerManager } from "./timer-manager.js";

import { useSnackbar } from "./index.js";

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
		// ensure that there are no 500 errors or empty responses
		const hasIssues = promiseStatus.some(
			(item) => item?.response?.success === false
            || (Array.isArray(item?.response) && item.response.length === 0),
		);

		// Map through each response and dispatch individually
		for (const [index, item] of promiseStatus.entries()) {
			const plotId = fetchConfigs[index].plotId;
			if (hasIssues) {
				dispatch({
					type: "FETCH_WARNING",
					payload: {
						plotId,
						response: item.response,
					},
					warning: "Some plots may be empty due to no matching data",
				});
			} else {
				dispatch({
					type: "FETCH_SUCCESS",
					payload: {
						plotId,
						response: item.response,
					},
				});
			}
		}

		// Show appropriate snackbar message
		if (hasIssues) {
			refs.current.warning("Some plots may be empty due to no matching data");
		} else {
			refs.current.success("All data fetched successfully");
		}
	}, [fetchConfigs]);

	const updateData = useCallback(async () => {
		try {
			dispatch({ type: "FETCH_START" });
			const promiseStatus = await fetchAllData(dispatch, organization, fetchConfigs);
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
		if (!fetchConfigs) {
			dispatch({
				type: "FETCH_START",
			});
			return;
		}

		const timerManager = new TimerManager(updateData, () => {
			dispatch({ type: "UPDATE_MINUTES_AGO" });
		});

		timerManager.start();

		return () => {
			timerManager.stop();
		};
	}, [updateData, fetchConfigs]);

	return { state, dispatch };
};

export default useInit;
