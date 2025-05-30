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

const updateLoadingStates = (state, dataType) => {
	const newProductionLoading = dataType === "general" ? false : (dataType === "production" ? false : state.isProductionLoading);
	const newPriceLoading = dataType === "general" ? false : (dataType === "price" ? false : state.isPriceLoading);

	return {
		...state,
		isProductionLoading: newProductionLoading,
		isPriceLoading: newPriceLoading,
		isLoading: newProductionLoading && newPriceLoading,
	};
};

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
				isProductionLoading: false,
				isLoading: false,
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
				isPriceLoading: false,
				isLoading: false,
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
				...state,
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
			const { plotId, response, dataType, warning } = action.payload;
			return {
				...state,
				...updateLoadingStates(state, dataType),
				warning,
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

		case "CACHE_RESTORE": {
			return {
				...state,
				isLoading: false,
				isPriceLoading: false,
				isProductionLoading: false,
				dataSets: action.payload.dataSets,
				minutesAgo: action.payload.minutesAgo,
				isCached: true, // Optional flag to indicate data is from cache
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

export const findKeyByText = (array, text, details = false) => {
	const found = array.find((item) => item.text === text);
	return details ? found : (found?.value || text);
};

export const isValidArray = (arr) => Array.isArray(arr) && arr.length > 0;

// Utility function to round numbers to the next magnitude
const roundToNextTen = (n) => {
	const magnitude = 10 ** Math.floor(Math.log10(n));
	return Math.ceil(n / magnitude) * magnitude;
};

// Helper function to format numbers with appropriate suffixes
const formatWithSuffix = (n) => {
	const divisions = [
		{ value: 1e9, symbol: "B" },
		{ value: 1e6, symbol: "M" },
		{ value: 1e3, symbol: "K" },
	];

	const division = divisions.find((d) => n >= d.value);

	if (division) return (n / division.value).toFixed(2) + division.symbol;

	// Use more precise formatting for smaller numbers
	if (n < 10) return n.toFixed(2);

	if (n < 100) return n.toFixed(1);

	if (n < 1000) return Math.round(n).toString();

	return roundToNextTen(n).toString();
};

export const formatNumber = (num, suffix = "") => ({ [`formattedNumber${suffix}`]: formatWithSuffix(num) });

export const generateYearsArray = (startYear, endYear) => Array.from(
	{ length: endYear - startYear + 1 },
	(_, index) => startYear + index,
);

export const extractFields = (productObject, fieldName) => {
	if (!productObject) return { fields: [], collections: [] };

	const fields = Object.keys(productObject)
		.filter((key) => key.toLowerCase().includes(fieldName))
		.map((field) => ({
			productName: productObject.text,
			original: field,
			text: field
				.split("_")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" "),
			products: productObject[field]?.products || [],
			productTypes: productObject[field]?.productTypes || [],
			productionMetrics: productObject[field]?.productionMetrics || [],
		}));

	const collections = Array.isArray(productObject.collections)
		? productObject.collections.filter((collection) => (typeof collection === "string"
			? collection.toLowerCase().includes(fieldName)
			: collection.value.toLowerCase().includes(fieldName)))
		: Object.values(productObject.collections || {}).filter((collection) => collection.value.toLowerCase().includes(fieldName));

	return { fields, collections, hasData: fields.length > 0, needsDropdown: collections.length > 1 };
};
