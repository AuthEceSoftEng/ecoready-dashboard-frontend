export const organization = "european_data";

export const mapInfoConfigs = (country, product, year) => {
	if (product === "rice") {
		return [
			{
				type: "stats",
				project: "rice",
				collection: "__rice_prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: `every_12_days`, start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/t",
				plotId: "productPrices",
			},
			{
				type: "stats",
				project: "rice",
				collection: "__rice_production__",
				params: JSON.stringify({ attribute: ["milled_rice_equivalent_quantity"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				attributename: "sum_milled_rice_equivalent_quantity",
				metric: "Milled Rice Quantity",
				unit: "t",
				plotId: "productProduction1",
			},
			{
				type: "stats",
				project: "rice",
				collection: "__rice_production__",
				params: JSON.stringify({ attribute: ["rice_husk_quantity"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				attributename: "sum_rice_husk_quantity",
				metric: "Rice Husk Quantity",
				unit: "t",
				plotId: "productProduction2",
			},
		];
	}
	else if (product === "wine") {
		return [
			{
				type: "stats",
				project: "wine",
				collection: "__prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: `every_12_days`, start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/HL.",
				plotId: "productPrices",
			},
		];
	}
	else if (product === "olive_oil") {
		return [
			{
				type: "stats",
				project: "olive_oil",
				collection: "__prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: `every_12_days`, start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/100kg",
				plotId: "productPrices",
			},
			{
				type: "stats",
				project: "olive_oil",
				collection: "olive_oil_annual_production",
				params: JSON.stringify({ attribute: ["year_production_quantity"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				attributename: "sum_year_production_quantity",
				metric: "Production",
				unit: "t",
				plotId: "productProduction1",
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
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/t",
				plotId: "productPrices",
			},
			{
				type: "stats",
				project: "sugar",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["gross_production"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", }),
				attributename: "sum_gross_production",
				metric: "Gross Production",
				unit: "t",
				plotId: "productProduction1",
			},
		];
	}
	else {
		// TODO: Perform error handling
		return [{type: "error"}, {type: "error"}, {type: "error"}];
	}
};

export default mapInfoConfigs;

