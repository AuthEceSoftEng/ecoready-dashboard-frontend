export const organization = "efsa";

const efsaConfigs = (country, year = null) => {
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
				],
				order_by: {
					field: "timestamp",
					order: "asc",
				},
			}),
			plotId: "timeline",
		},
	];

	return configs;
};

export default efsaConfigs;
