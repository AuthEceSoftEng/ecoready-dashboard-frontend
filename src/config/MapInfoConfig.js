export const organization = "european_data";

export const mapInfoConfigs = (country, product, year) => {
	return [
		{
			type: "stats",
			project: product,
			collection: "__rice_prices__",
			params: JSON.stringify({
				attribute: ["price"],
				stat: "avg",
				interval: `every_12_days`,
				start_time: `${year}-01-01`,
				end_time: `${year}-12-31`,
				group_by: "key",
			}),
			plotId: "periodPrices",
		},
		// {
		// 	type: "stats",
		// 	project: product,
		// 	collection: "__rice_prices__",
		// 	params: JSON.stringify({
		// 		attribute: ["price"],
		// 		stat: "avg",
		// 		interval: "every_1_months",
		// 		start_time: formattedBeginningOfMonth,
		// 		end_time: currentDate,
		// 		filters: [
		// 			{
		// 				property_name: "key",
		// 				operator: "eq",
		// 				property_value: country,
		// 			},
		// 		],
		// 	}),
		// 	plotId: "monthlyPrices",
		// },
		{
			type: "stats",
			project: product,
			collection: "__rice_production__",
			params: JSON.stringify({
				attribute: ["milled_rice_equivalent_quantity"],
				stat: "sum",
				interval: "every_12_months",
				start_time: `${year}-01-01`,
				end_time: `${year}-12-31`,
				group_by: "key",
			}),
			plotId: "riceProd1",
		},
		{
			type: "stats",
			project: product,
			collection: "__rice_production__",
			params: JSON.stringify({
				attribute: ["rice_husk_quantity"],
				stat: "sum",
				interval: "every_12_months",
				start_time: `${year}-01-01`,
				end_time: `${year}-12-31`,
				group_by: "key",
			}),
			plotId: "riceProd2",
		},
	];
};

export default mapInfoConfigs;

