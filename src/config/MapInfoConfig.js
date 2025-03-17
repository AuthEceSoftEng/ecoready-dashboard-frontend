import { products } from "../utils/useful-constants.js";

export const organization = "european_data";

export const mapInfoConfigs = (product, year) => {
	if (product === "rice") {
		return [
			{
				type: "stats",
				project: "rice",
				collection: "__prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/t",
				plotId: "productPrices",
			},
			{
				type: "stats",
				project: "rice",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["milled_rice_equivalent_quantity"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_milled_rice_equivalent_quantity",
				metric: "Milled Rice Quantity",
				unit: "t",
				plotId: "productProduction1",
			},
			{
				type: "stats",
				project: "rice",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["rice_husk_quantity"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_rice_husk_quantity",
				metric: "Rice Husk Quantity",
				unit: "t",
				plotId: "productProduction2",
			},
		];
	}

	if (product === "beef") {
		return [
			{
				type: "stats",
				project: "beef",
				collection: "__carcass_prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "avg_price",
				metric: "Average Carcass Price",
				unit: "€/100kg",
				plotId: "productPrices",
			},
			{
				type: "stats",
				project: "beef",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["tonnes"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_tonnes",
				metric: "Production",
				unit: "t",
				plotId: "productProduction1",
			},
		];
	}

	if (product === "pigmeat") {
		return [
			{
				type: "stats",
				project: "pigmeat",
				collection: "__carcass_prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "avg_price",
				metric: "Average Carcass Price",
				unit: "€/100kg",
				plotId: "productPrices",
			},
			{
				type: "stats",
				project: "pigmeat",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["tonnes"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_tonnes",
				metric: "Production (tonnes)",
				unit: "t",
				plotId: "productProduction1",
			},
			{
				type: "stats",
				project: "pigmeat",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["heads"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_heads",
				metric: "Production (heads)",
				unit: "heads",
				plotId: "productProduction2",
			},
			{
				type: "stats",
				project: "pigmeat",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["kg_per_head"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_kg_per_head",
				metric: "Production (kg/head)",
				unit: "kg/head",
				plotId: "productProduction3",
			},
		];
	}

	if (product === "wine") {
		return [
			{
				type: "stats",
				project: "wine",
				collection: "__prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/HL.",
				plotId: "productPrices",
			},
		];
	}

	if (product === "olive_oil") {
		return [
			{
				type: "stats",
				project: "olive_oil",
				collection: "__prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/100kg",
				plotId: "productPrices",
			},
			{
				type: "stats",
				project: "olive_oil",
				collection: "__annual_production__",
				params: JSON.stringify({ attribute: ["year_production_quantity"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_year_production_quantity",
				metric: "Production",
				unit: "t",
				plotId: "productProduction1",
			},
		];
	}

	if (product === "sugar") {
		return [
			{
				type: "stats",
				project: "sugar",
				collection: "__prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/t",
				plotId: "productPrices",
				perRegion: true,
			},
			{
				type: "stats",
				project: "sugar",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["gross_production"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_gross_production",
				metric: "Gross Production",
				unit: "t",
				plotId: "productProduction1",
				perRegion: true,
			},
		];
	}

	if (product === "abricots" || product === "apples" || product === "asparagus" || product === "avocados" || product === "beans" || product === "cabbages"
		|| product === "carrots" || product === "cauliflowers" || product === "cherries" || product === "clementines" || product === "courgettes"
		|| product === "cucumbers" || product === "egg plants, aubergines" || product === "garlic" || product === "kiwis" || product === "leeks"
		|| product === "lemons" || product === "lettuces" || product === "mandarins" || product === "melons" || product === "mushrooms, cultivated"
		|| product === "nectarines" || product === "onions" || product === "oranges" || product === "peaches" || product === "pears" || product === "peppers"
		|| product === "plums" || product === "satsumas" || product === "strawberries" || product === "table grapes" || product === "tomatoes" || product === "water melons") {
		return [
			{
				type: "stats",
				project: "fruit_vegetables",
				collection: "__prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key", filters: [{ property_name: "product", operator: "eq", property_value: product }] }),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/100kg",
				plotId: "productPrices",
			},
		];
	}

	if (product === "barley" || product === "wheat" || product === "maize" || product === "oats" || product === "rye" || product === "sorghum" || product === "triticale") {
		const productnames = products.find((item) => item.value === product)?.priceProductType || [];
		const cropnames = products.find((item) => item.value === product)?.productionProductType || [];

		const productData = productnames.map((productname, index) => ({
			type: "stats",
			project: "cereals",
			collection: "__prices__",
			params: JSON.stringify({
				attribute: ["price"],
				stat: "avg",
				interval: "every_12_months",
				start_time: `${year}-01-01`,
				end_time: `${year}-12-31`,
				group_by: "key",
				filters: [{ property_name: "product_name", operator: "eq", property_value: productname }],
			}),
			attributename: "avg_price",
			metric: `Average Price (${productname})`, // Include productname in the metric
			unit: "€/t",
			plotId: `productPrices${index + 1}`, // Add an index to the plotId
		}));

		const cropData = cropnames.map((cropname, index) => ({
			type: "stats",
			project: "cereals",
			collection: "__production__",
			params: JSON.stringify({
				attribute: ["gross_production"],
				stat: "sum",
				interval: "every_12_months",
				start_time: `${year}-01-01`,
				end_time: `${year}-12-31`,
				group_by: "key",
				filters: [{ property_name: "crop", operator: "eq", property_value: cropname }],
			}),
			attributename: "sum_gross_production",
			metric: `Gross Production (${cropname})`, // Include cropname in the metric
			unit: "t",
			plotId: `productProduction${index + 1}`, // Add an index to the plotId
			perRegion: false,
		}));

		return [...productData, ...cropData];
	}

	// TODO: Perform error handling
	return [{ type: "error" }, { type: "error" }, { type: "error" }];
};

export default mapInfoConfigs;

