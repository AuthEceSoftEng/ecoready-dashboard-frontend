/* eslint-disable consistent-return */
import { useEffect, useReducer, useRef, useCallback } from "react";

import fetchAllData from "../api/fetch-data.js";

import { initialState, reducer } from "./data-handling-functions.js";

import { useSnackbar } from "./index.js";

const useInit = (organization, fetchConfigs) => {
	const { success, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);
	// Use refs for stable references
	const successRef = useRef(success);
	const errorRef = useRef(error);

	useEffect(() => {
		successRef.current = success;
		errorRef.current = error;
	}, [success, error]);

	// Function to fetch and update data
	const updateData = useCallback(async () => {
		try {
			dispatch({ type: "FETCH_START" });
			const data = await fetchAllData(dispatch, organization, fetchConfigs);

			if (!data) {
				dispatch({ type: "FETCH_ERROR" });
				errorRef.current("No data received");
				return;
			}

			if (Array.isArray(data) && (data.every((item) => item === undefined))) {
				dispatch({ type: "FETCH_ERROR" });
				errorRef.current("Fetched data is empty");
				return;
			}

			dispatch({ type: "FETCH_SUCCESS", payload: data });
			successRef.current("All data fetched successfully");
		} catch (error_) {
			dispatch({ type: "FETCH_ERROR" });
			errorRef.current(`Error fetching data: ${error_.message}`);
		}
	}, [organization, fetchConfigs]);

	useEffect(() => {
		if (!fetchConfigs) {
			return;
		}

		const minutesAgoInterval = setInterval(() => {
			dispatch({ type: "UPDATE_MINUTES_AGO" });
		}, 60 * 1000);

		// Fetch data immediately and set fetch interval
		updateData();
		const fetchInterval = setInterval(updateData, 30 * 60 * 1000);

		return () => {
			clearInterval(minutesAgoInterval);
			clearInterval(fetchInterval);
		};
	}, [updateData, fetchConfigs]);

	return { state };
};

export default useInit;
