import { timeUtils } from "./timer-manager.js";

export const initialState = {
	dataSets: {},
	minutesAgo: 0,
	pageRefreshTime: new Date(),
	isLoading: false,
	warning: null,
	error: null,
};

export const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_START": {
			return {
				...state,
				isLoading: true,
				warning: null,
				error: null,
			};
		}

		case "FETCH_SUCCESS": {
			const { plotId, response } = action.payload;
			const now = new Date();
			return {
				...state,
				isLoading: false,
				error: null,
				dataSets: {
					...state.dataSets,
					[plotId]: response,
				},
				pageRefreshTime: now,
				minutesAgo: 0,
			};
		}

		case "FETCH_WARNING": {
			const { plotId, response } = action.payload;
			return {
				...state,
				isLoading: false,
				warning: action.payload?.warning || "Some values may be missing",
				dataSets: {
					...state.dataSets,
					[plotId]: response,
				},
				pageRefreshTime: new Date(),
				minutesAgo: 0,
			};
		}

		case "FETCH_ERROR": {
			return {
				...state,
				isLoading: false,
				error: action.payload?.error || "An error occurred",
			};
		}

		case "UPDATE_MINUTES_AGO": {
			if (!state.pageRefreshTime) return state;

			const minutesAgo = Math.floor((Date.now() - state.pageRefreshTime) / 60_000);
			const shouldFetch = timeUtils.shouldFetch(state.lastFetchTime);

			return {
				...state,
				minutesAgo,
				shouldRefetch: shouldFetch,
			};
		}

		default: {
			return state;
		}
	}
};

export const debounce = (func, wait) => {
	let timeoutId;

	const debounced = (...args) => {
		// Clear any existing timeout
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		// Set new timeout
		timeoutId = setTimeout(() => {
			func(...args);
		}, wait);
	};

	// Add cancel method to clear timeout
	debounced.cancel = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	};

	return debounced;
};

export const sumByKey = (array, key, valueKey) => {
	const sums = {};

	for (const item of array) {
		if (!sums[item[key]]) {
			sums[item[key]] = 0;
		}

		sums[item[key]] += item[valueKey];
	}

	return sums;
};

export const groupByKey = (data, key) => data.reduce((result, item) => {
	const groupKey = item[key];
	if (!result[groupKey]) {
		result[groupKey] = [];
	}

	result[groupKey].push(item);
	return result;
}, {});

export const getMaxValuesByProperty = (groupedObject, property) => {
	const maxValues = {};

	for (const key of Object.keys(groupedObject)) {
		const maxValue = groupedObject[key].reduce(
			(max, item) => (Math.max(item[property], max)),
			Number.NEGATIVE_INFINITY,
		);
		maxValues[key] = maxValue;
	}

	return maxValues;
};

export const getSumValuesByProperty = (groupedObject, property) => {
	const sumValues = {};

	for (const key of Object.keys(groupedObject)) {
		const sumValue = groupedObject[key].reduce(
			(sum, item) => sum + (item[property] || 0),
			0,
		);
		sumValues[key] = sumValue;
	}

	return sumValues;
};

export const calculateDates = (now = new Date(), offsetHours = null) => {
	// Use provided offset or timezone offset (negative because getTimezoneOffset returns opposite sign)
	const offset = offsetHours ?? -(now.getTimezoneOffset() / 60);
	const offsetMs = offset * 3_600_000; // Convert hours to milliseconds (60 * 60 * 1000)

	const year = now.getFullYear();
	const month = now.getMonth();
	const day = now.getDate();

	// Create dates with offset
	const currentDateTime = new Date(now.getTime() + offsetMs);
	const monthStart = new Date(year, month, 1);
	monthStart.setTime(monthStart.getTime() + offsetMs);

	const hourStart = new Date(now);
	hourStart.setMinutes(180, 0, 0);

	const dayStart = new Date(year, month, day);
	dayStart.setTime(dayStart.getTime() + offsetMs);

	return {
		year,
		month,
		currentDate: currentDateTime.toISOString().slice(0, 19),
		formattedBeginningOfMonth: monthStart.toISOString().slice(0, 19),
		formattedBeginningOfDay: dayStart.toISOString().slice(0, 19),
		formattedBeginningOfHour: hourStart.toISOString().slice(0, 19),
	};
};

export const getCustomDateTime = (year, month) => {
	// Create a new Date object with the specified year and month
	const date = new Date(year, month - 1); // month is 0-indexed in JavaScript Date

	// Get the current date and time components
	const currentDate = new Date();
	date.setDate(currentDate.getDate());
	date.setHours(currentDate.getHours());
	date.setMinutes(currentDate.getMinutes());
	date.setSeconds(currentDate.getSeconds());
	date.setMilliseconds(currentDate.getMilliseconds());

	return date;
};

export const calculateDifferenceBetweenDates = (startDate, endDate) => {
	const start = new Date(startDate);
	const end = new Date(endDate);

	// Calculate the difference in days
	const differenceInTime = end - start; // Difference in milliseconds
	const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24) + 1); // Convert ms to days, add 1 to include end date
	const differenceInHours = Math.ceil(differenceInTime / (1000 * 3600)); // Convert milliseconds to hours

	return { differenceInDays, differenceInHours };
};

