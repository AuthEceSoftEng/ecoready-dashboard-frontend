export const organization = "Hivelab";

const hiveConfigs = (formattedBeginningOfMonth, currentDate) => [
	{
		type: "data",
		project: "honey",
		collection: "yield",
		params: JSON.stringify({
			attributes: ["key", "honey_yield"],
		}),
		plotId: "honeyYield",
	},
	{
		type: "stats",
		project: "honey",
		collection: "count",
		params: JSON.stringify({
			attribute: ["bee_count"],
			stat: "avg",
			interval: "every_1_months",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "beeCount",
	},
	{
		type: "stats",
		project: "honey",
		collection: "yield",
		params: JSON.stringify({
			attribute: ["honey_yield"],
			stat: "sum",
			interval: "every_1_months",
			start_time: "2024-01-01",
			end_time: `${currentDate}`,
		}),
		plotId: "yieldDistribution",
	},
	{
		type: "stats",
		project: "honey",
		collection: "coverage",
		params: JSON.stringify({
			attribute: ["area_coverage"],
			stat: "sum",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
			group_by: "timestamp",
		}),
		plotId: "coverage",
	},
	{
		type: "stats",
		project: "honey",
		collection: "temperature_activity",
		params: JSON.stringify({
			attribute: ["activity_level"],
			stat: "avg",
			interval: "every_1_days",
		}),
		plotId: "activity",
	},
	// Additional configurations as needed
];

export default hiveConfigs;
