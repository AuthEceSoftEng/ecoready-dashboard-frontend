export const organization = "european_data";

export const mapInfoConfigs = (country, product, year) => {
	if (product === "rice") {
		return [
			{
				type: "stats",
				project: "rice",
				collection: "__rice_prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: `every_12_days`, start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				plotId: "periodPrices",
			},
			{
				type: "stats",
				project: "rice",
				collection: "__rice_production__",
				params: JSON.stringify({ attribute: ["milled_rice_equivalent_quantity"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				plotId: "riceProd1",
			},
			{
				type: "stats",
				project: "rice",
				collection: "__rice_production__",
				params: JSON.stringify({ attribute: ["rice_husk_quantity"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				plotId: "riceProd2",
			},
		];
	}
	else if (product === "sugar") {
		return [
			{
				type: "stats",
				project: "sugar",
				collection: "__prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: `every_12_days`, start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				plotId: "periodPrices",
			},
			{
				type: "stats",
				project: "sugar",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["gross_production"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				plotId: "riceProd1",
			},
		];
	}
	else {
		// TODO: Perform error handling
		return [{type: "error"}, {type: "error"}, {type: "error"}];
	}
};

export default mapInfoConfigs;

