/* eslint-disable no-unused-expressions */
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

	const updateData = useCallback(async () => {
		try {
			dispatch({ type: "FETCH_START" });

			const promiseStatus = await fetchAllData(dispatch, organization, fetchConfigs);
			console.log("Promise status:", promiseStatus);
			const hasFailedSuccessResponse = promiseStatus.some((item) => item?.response?.success === false);
			const hasEmptyArray = promiseStatus.some((item) => Array.isArray(item?.response) && item.response.length === 0);

			if (hasFailedSuccessResponse || hasEmptyArray) {
				dispatch({ type: "FETCH_WARNING", payload: promiseStatus });
				refs.current.warning("Some plots may be empty due to no matching data");
			} else {
				dispatch({ type: "FETCH_SUCCESS", payload: promiseStatus });
				refs.current.success("All data fetched successfully");
			}

			// if (hasEmptyArray) {
			// 	dispatch({
			// 		type: "FETCH_WARNING",
			// 		payload: {
			// 			promiseStatus,
			// 			error: "Some data sets returned empty results",
			// 		},
			// 	});
			// 	refs.current.warning("Some plots may be empty due to no matching data");
			// } else {
			// }
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
