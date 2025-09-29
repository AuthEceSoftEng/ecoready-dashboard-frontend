export const organization = "concat_ll";
export const sites = ["Artesa", "Girona", "Girona Interior", "La Tallada", "Lleida", "Solsona", "Tarragona", "Taradell", "Vic"];

const collections = {
	wheat: "wheat__data",
	weather: "weather_data",
};

// Factory functions for creating config objects
const createStatsConfig = (baseConfig, statsParams, attribute, stat, plotId, grouping = null) => ({
	...baseConfig,
	collection: collections.wheat,
	type: "stats",
	params: JSON.stringify({
		...statsParams,
		attribute: [attribute],
		stat,
		filters: baseConfig.filters,
		group_by: grouping,
	}),
	plotId,
});

// Data grouped by location configuration
const createLocationProductionConfigs = (location) => {
	const statsIntervalOnlyParams = {
		interval: "every_12_months",
	};

	const baseStatsConfig = {
		project: "wheat_data",
		filters: [
			{
				property_name: "location",
				operator: "eq",
				property_value: location,
			},
		],
	};

	return [
		createStatsConfig(baseStatsConfig, statsIntervalOnlyParams, "yield_value", "sum", `yield_value_${location}`),
		createStatsConfig(baseStatsConfig, statsIntervalOnlyParams, "height", "avg", `height_${location}`),
		createStatsConfig(baseStatsConfig, statsIntervalOnlyParams, "hlw", "sum", `hlw_${location}`),
		createStatsConfig(baseStatsConfig, statsIntervalOnlyParams, "tkw", "avg", `tkw_${location}`),
		createStatsConfig(baseStatsConfig, statsIntervalOnlyParams, "ng", "avg", `ng_${location}`),
	];
};

// Timeline data configuration (weather metrics over time)
const createTimelineConfigs = (location, startDate, endDate) => [{
	project: "wheat_data",
	type: "data",
	collection: collections.weather,
	params: JSON.stringify({
		attributes: ["timestamp", "key", "t_avg", "t_min", "t_max", "p", "sr"],
		filters: [
			{
				property_name: "key",
				operator: "eq",
				property_value: location,
			},
			{
				property_name: "timestamp",
				operator: "gte",
				property_value: startDate,
			},
			{
				property_name: "timestamp",
				operator: "lt",
				property_value: endDate,
			},
		],
		order_by: { field: "timestamp", order: "asc" },
	}),
	plotId: "metrics",
}];

// Data grouped by var_code configuration
const createVarCodeGroupedConfigs = (location, year) => {
	const statsFullParams = {
		interval: "every_12_months",
		start_time: `${year}-01-01`,
		end_time: `${year + 1}-01-01`,
	};

	const baseStatsConfig = {
		project: "wheat_data",
		filters: {
			property_name: "location",
			operator: "eq",
			property_value: location,
		},
	};

	return [
		createStatsConfig(baseStatsConfig, statsFullParams, "yield_value", "sum", `yield_per_product_${location}`, "var_code"),
		createStatsConfig(baseStatsConfig, statsFullParams, "height", "avg", `height_per_product_${location}`, "var_code"),
		createStatsConfig(baseStatsConfig, statsFullParams, "hlw", "sum", `hlw_per_product_${location}`, "var_code"),
		createStatsConfig(baseStatsConfig, statsFullParams, "tkw", "avg", `tkw_per_product_${location}`, "var_code"),
		createStatsConfig(baseStatsConfig, statsFullParams, "ng", "avg", `grain_number_per_product_${location}`, "var_code"),
	];
};

// Export individual configuration functions
export const getTimelineConfigs = createTimelineConfigs;
export const getLocationProductionConfigs = createLocationProductionConfigs;
export const getVarCodeGroupedConfigs = createVarCodeGroupedConfigs;
