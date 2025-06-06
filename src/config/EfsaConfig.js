export const organization = "efsa";
const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

const efsaConfigs = (country, product = null, contaminant = null, year = null) => [
	{
		type: "data",
		project: "efsaproject",
		collection: "efsadata",
		params: JSON.stringify({
			attributes: [
				"timestamp", "key", "param",
				"resval", "resunit", "resloq",
				"origcountry",
			],
			filters: [
				// Conditionally include country filter
				...(country ? [{
					property_name: "origcountry",
					operator: "eq",
					property_value: country,
				}] : []),
				// Conditionally include year filters
				...(year ? [
					{
						property_name: "timestamp",
						operator: "gte",
						property_value: `${year}-01-01`,
					},
					{
						property_name: "timestamp",
						operator: "lte",
						property_value: `${year}-12-31`,
					},
				] : []),
			],
			order_by: {
				field: "timestamp",
				order: "asc",
			},
		}),
		plotId: "metrics",
	},
	{
		type: "stats",
		project: "efsaproject",
		collection: "efsadata",
		params: JSON.stringify({
			attribute: ["resval"],
			stat: "max",
			interval: "every_1_days",
			start_time: "2011-01-01",
			end_time: currentDate,
			filters: [
				// Conditionally include country filter
				...(country ? [{
					property_name: "origcountry",
					operator: "eq",
					property_value: country,
				}] : []),
				// Conditionally include year filters
				...(contaminant ? [
					{
						property_name: "param",
						operator: "eq",
						property_value: contaminant,
					},
				] : []),
			],
			order_by: {
				field: "timestamp",
				order: "asc",
			},
			group_by: ["key"],
		}),
		plotId: "contaminantTimeline",
	},
	{
		type: "stats",
		project: "efsaproject",
		collection: "efsadata",
		params: JSON.stringify({
			attribute: ["resval"],
			stat: "max",
			interval: "every_1_days",
			start_time: "2011-01-01",
			end_time: currentDate,
			filters: [
				// Conditionally include country filter
				...(country ? [{
					property_name: "origcountry",
					operator: "eq",
					property_value: country,
				}] : []),
				// Conditionally include product filter
				...(product ? [{
					property_name: "key",
					operator: "eq",
					property_value: product,
				}] : []),
			],
			order_by: {
				field: "timestamp",
				order: "asc",
			},
			group_by: ["param"],
		}),
		plotId: "productTimeline",
	},
];
export default efsaConfigs;
