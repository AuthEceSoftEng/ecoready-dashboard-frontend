export const organization = "thalla";

export const thallaConfigs = (region, startDate, endDate, differenceInDays) => {
	// Common configuration
	const baseConfig = {
		project: "thalla_project",
		collection: "weather_data",
	};

	// Time filter applied to all queries
	const timeFilter = [
		{
			property_name: "key",
			operator: "eq",
			property_value: region,
		},
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

	// Stats common parameters
	const statsBaseParams = {
		interval: `every_${differenceInDays}_days`,
		start_time: startDate,
		end_time: endDate,
		filters: [{
			property_name: "key",
			operator: "eq",
			property_value: region,
		}],
		group_by: "key",
	};

	// Function to create stats config objects
	const createStatsConfig = (attribute, stat, plotId) => ({
		...baseConfig,
		type: "stats",
		params: JSON.stringify({
			attribute: [attribute],
			stat,
			...statsBaseParams,
		}),
		plotId,
	});

	// Data metrics configuration
	const dataConfig = {
		...baseConfig,
		type: "data",
		params: JSON.stringify({
			attributes: [
				"timestamp", "key", "max_temperature",
				"min_temperature", "mean_temperature",
				"rain", "wind_speed",
			],
			filters: timeFilter,
			order_by: {
				field: "timestamp",
				order: "asc",
			},
		}),
		plotId: "metrics",
	};

	// Stats configurations
	const statsConfigs = [
		createStatsConfig("mean_temperature", "avg", "meanMeanTemperature"),
		createStatsConfig("max_temperature", "max", "maxMaxTemperature"),
		createStatsConfig("min_temperature", "min", "minMinTemperature"),
		createStatsConfig("rain", "sum", "rainSum"),
		createStatsConfig("wind_speed", "avg", "meanWindSpeed"),
	];

	// Return all configurations
	return [dataConfig, ...statsConfigs];
};

