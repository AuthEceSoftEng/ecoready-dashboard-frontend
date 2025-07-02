export const organization = "livorganic";

export const livOrganicConfigs = (startDate, endDate, differenceInDays) => {
	// Common configuration
	const baseConfig = {
		project: "livorganic_project",
		collection: "weather_data",
	};

	// Calculate interval once
	const interval = differenceInDays ? `every_${Math.max(differenceInDays, 1)}_days` : "every_1_days";

	// Time filters for data queries
	const timeFilters = [
		{
			property_name: "timestamp",
			operator: "gte",
			property_value: startDate,
		},
		{
			property_name: "timestamp",
			operator: "lte",
			property_value: endDate,
		},
	];

	// Base stats params
	const baseStatsParams = {
		interval,
		start_time: startDate,
		end_time: endDate,
		group_by: "key",
	};

	// Function to create stats config objects
	const createStatsConfig = (attribute, stat, plotId) => ({
		...baseConfig,
		type: "stats",
		params: JSON.stringify({
			attribute: [attribute],
			stat,
			...baseStatsParams,
		}),
		plotId,
	});

	return [
		// Data config
		{
			...baseConfig,
			type: "data",
			params: JSON.stringify({
				attributes: [
					"timestamp", "max_temperature",
					"min_temperature", "precipitation", "solar_radiation",
				],
				filters: timeFilters,
				order_by: {
					field: "timestamp",
					order: "asc",
				},
			}),
			plotId: "metrics",
		},
		// Stats configs
		createStatsConfig("max_temperature", "max", "maxMaxTemperature"),
		createStatsConfig("min_temperature", "min", "minMinTemperature"),
		createStatsConfig("precipitation", "avg", "meanPrecipitation"),
		createStatsConfig("solar_radiation", "avg", "meanSolarRadiation"),
	];
};

