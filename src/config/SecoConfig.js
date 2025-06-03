export const organization = "seco_collab";

const secoConfigs = (currentDate, formattedBeginningOfMonth, formattedBeginningOfDay) => {
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

	// Date ranges
	const dateRanges = {
		today: {
			start_time: formattedBeginningOfDay,
			end_time: currentDate,
		},
		month: {
			start_time: formattedBeginningOfMonth,
			end_time: currentDate,
		},
	};

	// Factory functions to create config objects
	const createDataConfig = () => ({
		...baseConfig,
		type: "data",
		params: JSON.stringify({
			attributes: ["timestamp", ...metrics.map((m) => m.attribute)],
			order_by: {
				field: "timestamp",
				order: "asc",
			},
		}),
		plotId: "overview",
	});

	const createStatsConfig = (metric, stat, timeframe, plotIdPrefix) => ({
		...baseConfig,
		type: "stats",
		params: JSON.stringify({
			attribute: [metric.attribute],
			stat,
			interval: "every_1_days",
			...dateRanges[timeframe],
		}),
		plotId: `${plotIdPrefix}${metric.name}`,
	});

	// Create configs array
	const configs = [
		// Overview data
		createDataConfig(),

		// Today's averages
		...metrics.map((metric) => createStatsConfig(metric, "avg", "today", "today")),

		// Monthly maximums
		...metrics.map((metric) => createStatsConfig(metric, "max", "month", "monthMax")),

		// Monthly minimums
		...metrics.map((metric) => createStatsConfig(metric, "min", "month", "monthMin")),
	];

	return configs;
};

export default secoConfigs;
