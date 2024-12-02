
/* eslint-disable consistent-return */
import { useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import fetchAllData from "../api/fetch-data.js";

import { initialState, reducer } from "./data-handling-functions.js";
import { TimerManager, timeUtils } from "./timer-manager.js";

import { useSnackbar } from "./index.js";

const useInit = (organization, fetchConfigs) => {
	const { success, warning, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);
	const timerManagerRef = useRef(null);

	const snackbarCallbacks = useMemo(() => ({
		success, warning, error,
	}), [success, warning, error]);

	const refs = useRef(snackbarCallbacks);

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
		if (!timeUtils.shouldFetch(state.lastFetchTime)) {
			return;
		}

		try {
			dispatch({ type: "FETCH_START" });
			const promiseStatus = await fetchAllData(dispatch, organization, fetchConfigs);
			console.log("Promise status:", promiseStatus);
			handleFetchResponse(promiseStatus);
		} catch (error_) {
			dispatch({
				type: "FETCH_ERROR",
				payload: { error: error_.message, type: "error" },
			});
			console.error("Error fetching data:", error_);
			refs.current.error(`Error fetching data: ${error_.message}`);
		}
	}, [organization, fetchConfigs, handleFetchResponse, state.lastFetchTime]);

	const updateMinutes = useCallback(() => {
		dispatch({ type: "UPDATE_MINUTES_AGO" });
	}, []);

	useEffect(() => {
		if (!fetchConfigs) return;

		timerManagerRef.current = new TimerManager(
			updateData,
			updateMinutes,
		);

		timerManagerRef.current.start();

		return () => {
			if (timerManagerRef.current) {
				timerManagerRef.current.stop();
			}
		};
	}, [updateData, updateMinutes, fetchConfigs]);

	useEffect(() => {
		if (!fetchConfigs) return;

		timerManagerRef.current = new TimerManager(
			updateData,
			updateMinutes,
		);

		timerManagerRef.current.start();

		return () => {
			if (timerManagerRef.current) {
				timerManagerRef.current.stop();
			}
		};
	}, [updateData, updateMinutes, fetchConfigs]);

	return {
		state,
		forceUpdate: () => {
			if (timerManagerRef.current) {
				timerManagerRef.current.reset();
			}
		},
	};
};

export default useInit;
