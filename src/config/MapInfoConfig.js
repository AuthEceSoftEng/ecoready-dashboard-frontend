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
				collection: "__annual_production__",
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
				perRegion: true
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
				perRegion: true
			},
		];
	}
	else if (product === "abricots" || product === "apples" || product === "asparagus" || product === "avocados" || product === "beans" || product === "cabbages" || 
			product === "carrots" || product === "cauliflowers" || product === "cherries" || product === "clementines" || product === "courgettes" || 
			product === "cucumbers" || product === "egg plants, aubergines" || product === "garlic" || product === "kiwis" || product === "leeks" || 
			product === "lemons" || product === "lettuces" || product === "mandarins" || product === "melons" || product === "mushrooms, cultivated" || 
			product === "nectarines" || product === "onions" || product === "oranges" || product === "peaches" || product === "pears" || product === "peppers" || 
			product === "plums" || product === "satsumas" || product === "strawberries" || product === "table grapes" || product === "tomatoes" || product === "water melons") {
		return [
			{
				type: "stats",
				project: "fruit_vegetables",
				collection: "__prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: `every_12_days`, start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", filters: [{property_name: "product", operator: "eq", property_value: product}]}),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/100kg",
				plotId: "productPrices"
			}
		];
	}
	else {
		// TODO: Perform error handling
		return [{type: "error"}, {type: "error"}, {type: "error"}];
	}
};

export default mapInfoConfigs;

