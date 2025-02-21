import { timeUtils } from "./timer-manager.js";

export const initialState = {
	dataSets: {},
	minutesAgo: 0,
	pageRefreshTime: new Date(),
	isLoading: false,
	isPriceLoading: false,
	isProductionLoading: false,
	warning: null,
	error: null,
};

const updateLoadingStates = (state, dataType) => ({
	...state,
	isLoading: dataType === "general" ? false : state.isLoading,
	isPriceLoading: dataType === "price" ? false : state.isPriceLoading,
	isProductionLoading: dataType === "production" ? false : state.isProductionLoading,
});

export const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_START": {
			return {
				...state,
				isLoading: true,
				isPriceLoading: true,
				isProductionLoading: true,
				warning: null,
				error: null,
				dataSets: {},
			};
		}

		case "FETCH_PRICE_START": {
			return {
				...state,
				isPriceLoading: true,
				warning: null,
				error: null,
				dataSets: {
					...state.dataSets,
					pricesTimeline: undefined,
					periodPrices: undefined,
					monthlyPrices: undefined,
					maxPrice: undefined,
				},
			};
		}

		case "FETCH_PRODUCTION_START": {
			return {
				...state,
				isProductionLoading: true,
				warning: null,
				error: null,
				dataSets: {
					...state.dataSets,
					productProduction: undefined,
					maxProduction: undefined,
				},
			};
		}

		case "FETCH_SUCCESS": {
			const { plotId, response, dataType } = action.payload;
			return {
				...updateLoadingStates(state, dataType),
				error: null,
				dataSets: {
					...state.dataSets,
					[plotId]: response,
				},
				pageRefreshTime: new Date(),
				minutesAgo: 0,
			};
		}

		case "FETCH_WARNING": {
			const { plotId, response, dataType } = action.payload;
			return {
				...updateLoadingStates(state, dataType),
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

const formatDate = (date) => date.toISOString().slice(0, 19);

export const calculateDates = (now = new Date(), offsetHours = null) => {
	const offset = offsetHours ?? -(now.getTimezoneOffset() / 60);
	const offsetMs = offset * 3_600_000;

	const applyOffset = (date) => {
		const newDate = new Date(date);
		newDate.setTime(newDate.getTime() + offsetMs);
		return newDate;
	};

	const year = now.getFullYear();
	const month = now.getMonth();
	const day = now.getDate();

	const currentDateTime = applyOffset(now);
	const monthStart = applyOffset(new Date(year, month, 1));
	const dayStart = applyOffset(new Date(year, month, day));
	const hourStart = new Date(now);
	hourStart.setMinutes(180, 0, 0);

	return {
		year,
		month,
		currentDate: formatDate(currentDateTime),
		formattedBeginningOfMonth: formatDate(monthStart),
		formattedBeginningOfDay: formatDate(dayStart),
		formattedBeginningOfHour: formatDate(hourStart),
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

export const getProductCollections = (products, productValue) => {
	const product = products.find((p) => p.value === productValue);
	return product?.collections || [];
};

export const findKeyByText = (array, text) => {
	const found = array.find((item) => item.text === text);
	return found?.value || text;
};

export const isValidArray = (arr) => Array.isArray(arr) && arr.length > 0;

export const formatNumber = (num, suffix = "") => {
	const roundToNextTen = (n) => {
		const magnitude = 10 ** Math.floor(Math.log10(n));
		return Math.ceil(n / magnitude) * magnitude;
	};

	const formatWithSuffix = (n) => {
		const divisions = [
			{ value: 1e9, symbol: "B" },
			{ value: 1e6, symbol: "M" },
			{ value: 1e3, symbol: "K" },
		];

		const division = divisions.find((d) => n >= d.value);
		return division
			? (n / division.value).toFixed(2) + division.symbol
			: roundToNextTen(n).toString();
	};

	const rounded = roundToNextTen(Math.ceil(num / 10) * 10);

	return {
		[`roundUpToNextProduct${suffix}`]: rounded,
		[`formattedNumber${suffix}`]: formatWithSuffix(num),
	};
};

export const generateYearsArray = (startYear, endYear) => Array.from(
	{ length: endYear - startYear + 1 },
	(_, index) => startYear + index,
);
