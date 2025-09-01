export const organization = "efsa";

const efsaConfigs = (country, year = null) => {
	// Always include the main data config
	const configs = [
		{
			type: "data",
			project: "efsaproject",
			collection: "efsa_data",
			params: JSON.stringify({
				attributes: ["key", "param", "resval", "resunit", "resloq"],
				filters: [
					{
						property_name: "resval",
						operator: "gt",
						property_value: 0,
					},
					// Conditionally include country filter
					...(country ? [{
						property_name: "sampcountry",
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
				// order_by: {
				// 	field: "timestamp",
				// 	order: "asc",
				// },
			}),
			plotId: "metrics",
		},
		// {
		// 	type: "data",
		// 	project: "efsaproject",
		// 	collection: "efsa_data",
		// 	params: JSON.stringify({
		// 		attributes: ["key", "resval", "resunit", "resloq"],
		// 		filters: [
		// 			{
		// 				property_name: "resval",
		// 				operator: "gt",
		// 				property_value: 0,
		// 			},
		// 			// Conditionally include contaminant filter
		// 			...(contaminant ? [{
		// 				property_name: "param",
		// 				operator: "eq",
		// 				property_value: contaminant,
		// 			}] : []),
		// 			// Conditionally include country filter
		// 			...(country ? [{
		// 				property_name: "sampcountry",
		// 				operator: "eq",
		// 				property_value: country,
		// 			}] : []),
		// 			// Conditionally include year filters
		// 			...(year ? [
		// 				{
		// 					property_name: "timestamp",
		// 					operator: "gte",
		// 					property_value: `${year}-01-01`,
		// 				},
		// 				{
		// 					property_name: "timestamp",
		// 					operator: "lte",
		// 					property_value: `${year}-12-31`,
		// 				},
		// 			] : []),
		// 		],
		// 		// order_by: {
		// 		// 	field: "timestamp",
		// 		// 	order: "asc",
		// 		// },
		// 	}),
		// 	plotId: "metrics_contaminant",
		// },
		// {
		// 	type: "data",
		// 	project: "efsaproject",
		// 	collection: "efsa_data",
		// 	params: JSON.stringify({
		// 		attributes: ["param", "resval", "resunit", "resloq"],
		// 		filters: [
		// 			{
		// 				property_name: "resval",
		// 				operator: "gt",
		// 				property_value: 0,
		// 			},
		// 			...product ? [{
		// 				property_name: "key",
		// 				operator: "eq",
		// 				property_value: product,
		// 			}] : [],
		// 			// Conditionally include country filter
		// 			...(country ? [{
		// 				property_name: "sampcountry",
		// 				operator: "eq",
		// 				property_value: country,
		// 			}] : []),
		// 			// Conditionally include year filters
		// 			...(year ? [
		// 				{
		// 					property_name: "timestamp",
		// 					operator: "gte",
		// 					property_value: `${year}-01-01`,
		// 				},
		// 				{
		// 					property_name: "timestamp",
		// 					operator: "lte",
		// 					property_value: `${year}-12-31`,
		// 				},
		// 			] : []),
		// 		],
		// 		// order_by: {
		// 		// 	field: "timestamp",
		// 		// 	order: "asc",
		// 		// },
		// 	}),
		// 	plotId: "metrics_product",
		// },
		{
			type: "data",
			project: "efsaproject",
			collection: "efsa_data",
			params: JSON.stringify({
				attributes: [
					"timestamp", "key", "param",
					"resval", "resunit", "resloq",
				],
				filters: [
					// Conditionally include country filter
					...(country ? [{
						property_name: "sampcountry",
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
