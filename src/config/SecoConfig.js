import { calculateDifferenceBetweenDates } from "../utils/data-handling-functions.js";

export const organization = "seco_collab";

const secoConfigs = (startDate, endDate) => {
	const { differenceInDays } = calculateDifferenceBetweenDates(startDate, endDate);

	// Common configuration for all requests
	const baseConfig = {
		project: "seco_collab_project",
		collection: "environmental_data",
	};

	// Metrics to monitor
	const metrics = [
		{ attribute: "m_temp01", name: "Temperature" },
		{ attribute: "m_hum01", name: "Humidity" },
		{ attribute: "a_co2", name: "Co2" },
	];

	// Common date range object
	const dateRange = {
		start_time: startDate,
		end_time: endDate,
	};

	// Unified factory function for creating configs
	const createConfig = (type, params, plotId) => ({
		...baseConfig,
		type,
		params: JSON.stringify(params),
		plotId,
	});

	// Factory for data config
	const createDataConfig = () => createConfig(
		"data",
		{
			attributes: ["timestamp", ...metrics.map((m) => m.attribute)],
			filters: [
				{ property_name: "timestamp", operator: "gte", property_value: startDate },
				{ property_name: "timestamp", operator: "lte", property_value: endDate },
			],
			order_by: { field: "timestamp", order: "asc" },
		},
		"overview",
	);

	// Unified factory for stats configs
	const createStatsConfig = (metric, stat = "avg", plotIdPrefix, customInterval = null) => createConfig(
		"stats",
		{
			attribute: [metric.attribute],
			stat,
			interval: customInterval || (differenceInDays ? `every_${Math.max(differenceInDays, 1)}_days` : "every_1_days"),
			...dateRange,
		},
		`${plotIdPrefix}${metric.name}`,
	);

	// Create configs array
	const configs = [
		// Overview data
		createDataConfig(),

		// Monthly averages (with dynamic interval)
		...metrics.map((metric) => createStatsConfig(metric, "avg", "avg")),

		// Monthly maximums (with fixed daily interval)
		...metrics.map((metric) => createStatsConfig(metric, "max", "max", "every_1_days")),

		// Monthly minimums (with fixed daily interval)
		...metrics.map((metric) => createStatsConfig(metric, "min", "min", "every_1_days")),
	];

	return configs;
};

export default secoConfigs;
