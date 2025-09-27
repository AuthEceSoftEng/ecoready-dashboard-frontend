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
		filters: [baseConfig.filter],
		group_by: grouping,
	}),
	plotId,
});

const concatConfigs = (site, startDate, endDate, year = null) => {
	// Base configuratio
	const baseDataConfig = {
		project: "wheat_data",
		filter: [{
			property_name: "key",
			operator: "eq",
			property_value: site,
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
		}],
	};

	const baseStatsConfig = {
		project: "wheat_data",
		filter: {
			property_name: "loacation",
			operator: "eq",
			property_value: site,
		},
	};

	// Create two different params objects
	const statsIntervalOnlyParams = {
		interval: "every_12_months",
	};

	const statsFullParams = {
		interval: "every_12_months",
		start_time: year ?? `${year}-01-01`,
		end_time: year ?? `${year + 1}-01-01`,
	};

	return [
		// Metrics data config
		{
			...baseDataConfig,
			type: "data",
			collection: collections.weather,
			params: JSON.stringify({
				attributes: ["timestamp", "key", "t_avg", "t_min", "t_max", "p", "sr"],
				filters: baseDataConfig.filter,
				order_by: { field: "timestamp", order: "asc" },
			}),
			plotId: "metrics",
		},
		// Stats configs with interval only (first 4)
		createStatsConfig(baseStatsConfig, statsIntervalOnlyParams, "yield_value", "sum", "yield", "location"),
		createStatsConfig(baseStatsConfig, statsIntervalOnlyParams, "height", "avg", "height", "location"),
		createStatsConfig(baseStatsConfig, statsIntervalOnlyParams, "hlw", "sum", "hlw", "location"),
		createStatsConfig(baseStatsConfig, statsIntervalOnlyParams, "tkw", "avg", "tkw", "location"),
		createStatsConfig(baseStatsConfig, statsIntervalOnlyParams, "ng", "avg", "grain_number", "location"),
		// Stats configs with full params and grouping (last 5)
		createStatsConfig(baseStatsConfig, statsFullParams, "yield_value", "sum", "yield_per_product", "var_code"),
		createStatsConfig(baseStatsConfig, statsFullParams, "height", "avg", "height_per_product", "var_code"),
		createStatsConfig(baseStatsConfig, statsFullParams, "hlw", "sum", "hlw_per_product", "var_code"),
		createStatsConfig(baseStatsConfig, statsFullParams, "tkw", "avg", "tkw_per_product", "var_code"),
		createStatsConfig(baseStatsConfig, statsFullParams, "ng", "avg", "grain_number_per_product", "var_code"),
	];
};

export default concatConfigs;
