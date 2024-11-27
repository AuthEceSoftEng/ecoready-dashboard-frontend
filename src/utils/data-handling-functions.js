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
				dataSets: state.dataSets,
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

export const calculateDates = (now, offsetHours = 3) => {
	now = now || new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const day = now.getDate();
	const offsetTime = now.getTime() + offsetHours * 60 * 60 * 1000;

	const currentDate = new Date(offsetTime).toISOString().slice(0, 19);
	const formattedBeginningOfMonth = new Date(year, month, 1, offsetHours).toISOString().slice(0, 19);
	const beginningOfHour = new Date(now).setMinutes(180, 0, 0);
	const formattedBeginningOfHour = new Date(beginningOfHour).toISOString().slice(0, 19);
	const formattedBeginningOfDay = new Date(year, month, day, offsetHours).toISOString().slice(0, 19);

	return { year, month, currentDate, formattedBeginningOfMonth, formattedBeginningOfDay, formattedBeginningOfHour };
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
	const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)); // Convert milliseconds to days
	const differenceInHours = Math.ceil(differenceInTime / (1000 * 3600)); // Convert milliseconds to hours

	return { differenceInDays, differenceInHours };
};

