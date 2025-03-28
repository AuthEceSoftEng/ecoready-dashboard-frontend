export const organization = "esappin";

// Factory functions for creating config objects
const createStatsConfig = (baseConfig, statsParams, attribute, stat, plotId, includeProductFilter = true) => ({
	...baseConfig,
	type: "stats",
	params: JSON.stringify({
		...statsParams,
		attribute: [attribute],
		stat,
		filters: includeProductFilter ? [baseConfig.productFilter] : [],
		group_by: includeProductFilter ? "key" : undefined,
	}),
	plotId,
});

const esappinConfigs = (product, startDate, endDate) => {
	// Base configuration
	const baseConfig = {
		project: "esappin_project",
		collection: "metrics",
		productFilter: {
			property_name: "key",
			operator: "eq",
			property_value: product,
		},
	};

	const dateFilter = [
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

	const statsBaseParams = {
		interval: "every_1_months",
		start_time: startDate,
		end_time: endDate,
	};

	return [
		// Metrics data config
		{
			...baseConfig,
			type: "data",
			params: JSON.stringify({
				attributes: [
					"key", "timestamp", "max_temperature", "min_temperature",
					"precipitation_sum", "shortwave_radiation_sum",
				],
				filters: [baseConfig.productFilter, ...dateFilter],
				order_by: { field: "timestamp", order: "asc" },
			}),
			plotId: "metrics",
		},
		// Stats configs generated by factory function
		createStatsConfig(baseConfig, statsBaseParams, "precipitation_sum", "sum", "precipitationSum", false),
		createStatsConfig(baseConfig, statsBaseParams, "shortwave_radiation_sum", "sum", "shortwaveRadiationSum"),
		createStatsConfig(baseConfig, statsBaseParams, "max_temperature", "max", "maxMaxTemperature"),
		createStatsConfig(baseConfig, statsBaseParams, "min_temperature", "min", "minMinTemperature"),
	];
};

export default esappinConfigs;
