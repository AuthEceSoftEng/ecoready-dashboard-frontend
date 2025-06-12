export const organization = "efsa";
const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

const efsaConfigs = (country, product = null, contaminant = null, year = null) => {
	// Always include the main data config
	const configs = [
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
					{
						property_name: "resval",
						operator: "gt",
						property_value: 0,
					},
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
	];

	// Only add contaminant timeline if contaminant is selected
	if (contaminant) {
		configs.push({
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
					{
						property_name: "param",
						operator: "eq",
						property_value: contaminant,
					},
				],
				order_by: {
					field: "timestamp",
					order: "asc",
				},
				group_by: ["key"],
			}),
			plotId: "contaminantTimeline",
		});
	}

	// Only add product timeline if product is selected
	if (product) {
		configs.push({
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
					{
						property_name: "key",
						operator: "eq",
						property_value: product,
					},
				],
				order_by: {
					field: "timestamp",
					order: "asc",
				},
				group_by: ["param"],
			}),
			plotId: "productTimeline",
		});
	}

	return configs;
};

export default efsaConfigs;
