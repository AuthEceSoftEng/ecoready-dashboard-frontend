// src/utils.js

export const initialState = {
	dataSets: {},
	minutesAgo: 0,
	pageRefreshTime: new Date(),
};

export const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_SUCCESS": {
			const { plotId, response } = action.payload;
			return {
				...state,
				dataSets: {
					...state.dataSets,
					[plotId]: response,
				},
				pageRefreshTime: new Date(),
				minutesAgo: 0, // Reset minutes ago to 0 on new data fetch
			};
		}

		case "UPDATE_MINUTES_AGO": {
			return {
				...state,
				minutesAgo: Math.floor((Date.now() - state.pageRefreshTime) / 60_000),
			};
		}

		default: {
			return state;
		}
	}
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
			(max, item) => (item[property] > max ? item[property] : max),
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

export const calculateDates = (now = new Date()) => {
	const year = now.getFullYear();
	const month = now.getMonth();
	const currentDate = now.toISOString().slice(0, 19);

	const beginningOfMonth = new Date(year, month, 1, 3);
	const formattedBeginningOfMonth = beginningOfMonth.toISOString().slice(0, 19);

	const beginningOfHour = new Date(now.setMinutes(0, 0, 0));
	const formattedBeginningOfHour = beginningOfHour.toISOString().slice(0, 19);

	console.log("Beginning of Month", formattedBeginningOfMonth);
	console.log("Beginning of Hour", formattedBeginningOfHour);

	return { year, month, currentDate, formattedBeginningOfMonth, formattedBeginningOfHour };
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

	// Format the date and time as an ISO string
	const formattedDateTime = date.toISOString().slice(0, 19);

	return formattedDateTime;
};
