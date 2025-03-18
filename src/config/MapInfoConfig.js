import { products } from "../utils/useful-constants.js";

export const organization = "european_data";

export const mapInfoConfigs = (prod, year) => {
	const product = prod.toLowerCase();
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
				plotId: "productPrices1",
			},
			{
				type: "stats",
				project: "beef",
				collection: "__live_animal_prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "avg_price",
				metric: "Average Animal Price",
				unit: "€/100kg",
				plotId: "productPrices2",
			},
			{
				type: "stats",
				project: "beef",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["tonnes"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_tonnes",
				metric: "Production (tonnes)",
				unit: "t",
				plotId: "productProduction1",
			},
			{
				type: "stats",
				project: "beef",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["heads"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_heads",
				metric: "Production (heads)",
				unit: "",
				plotId: "productProduction2",
			},
			{
				type: "stats",
				project: "beef",
				collection: "__production__",
				params: JSON.stringify({ attribute: ["kg_per_head"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_kg_per_head",
				metric: "Production (kg/head)",
				unit: "kg/head",
				plotId: "productProduction3",
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
				unit: "",
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

	if (product === "poultry") {
		return [
			{
				type: "stats",
				project: "eggs_poultry",
				collection: "__poultry_prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, filters: [{ property_name: "price_type", operator: "eq", property_value: "Selling price" }], group_by: "key" }),
				attributename: "avg_price",
				metric: "Average Selling Price",
				unit: "€/100kg",
				plotId: "productPrices",
			},
			{
				type: "stats",
				project: "eggs_poultry",
				collection: "__poultry_production__",
				params: JSON.stringify({ attribute: ["tonnes"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, filters: [{ property_name: "animal", operator: "eq", property_value: "Poultry meat" }], group_by: "key" }),
				attributename: "sum_tonnes",
				metric: "Poultry Meat Production",
				unit: "t",
				plotId: "productProduction",
			},
		];
	}

	if (product === "eggs") {
		return ["Barn", "Cage", "Free range", "Organic"].map((farmingMethod, index) => ({
			type: "stats",
			project: "eggs_poultry",
			collection: "__egg_prices__",
			params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, filters: [{ property_name: "farming_method", operator: "eq", property_value: farmingMethod }], group_by: "key" }),
			attributename: "avg_price",
			metric: `Average Selling Price (${farmingMethod})`,
			unit: "€/100kg",
			plotId: `productPrices${index + 1}`,
		}));
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

	if (product === "olive oil") {
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

	const fruitVegetables = new Set([
		"abricots", "apples", "asparagus", "avocados", "beans", "cabbages",
		"carrots", "cauliflowers", "cherries", "clementines", "courgettes",
		"cucumbers", "egg plants, aubergines", "garlic", "kiwis", "leeks",
		"lemons", "lettuces", "mandarins", "melons", "mushrooms, cultivated",
		"nectarines", "onions", "oranges", "peaches", "pears", "peppers",
		"plums", "satsumas", "strawberries", "table grapes", "tomatoes", "water melons",
	]);

	if (fruitVegetables.has(prod)) {
		return [{
			type: "stats",
			project: "fruit_vegetables",
			collection: "__prices__",
			params: JSON.stringify({
				attribute: ["price"],
				stat: "avg",
				interval: "every_12_months",
				start_time: `${year}-01-01`,
				end_time: `${year}-12-31`,
				group_by: "key",
				filters: [{ property_name: "product", operator: "eq", property_value: prod }],
			}),
			attributename: "avg_price",
			metric: "Average Price",
			unit: "€/100kg",
			plotId: "productPrices",
		}];
	}

	const dairyProducts = new Set(["butter", "butteroil", "cheddar", "cream", "edam", "emmental", "gouda", "smp", "wheypowder", "wmp"]); // "drinking milk",

	if (dairyProducts.has(prod)) {
		const dairyType = prod.toUpperCase();
		return [{
			type: "stats",
			project: "milk_dairy",
			collection: "__dairy_prices__",
			params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, filters: [{ property_name: "product", operator: "eq", property_value: dairyType }], group_by: "key" }),
			attributename: "avg_price",
			metric: `Average Selling Price (${product})`,
			unit: "€/100kg",
			plotId: "productPrices",
		}];
	}

	if (product === "milk") {
		return [
			{
				type: "stats",
				project: "milk_dairy",
				collection: "__raw_milk_prices__",
				params: JSON.stringify({ attribute: ["price"], stat: "avg", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/100kg",
				plotId: "productPrices",
			},
			{
				type: "stats",
				project: "milk_dairy",
				collection: "__dairy_production__",
				params: JSON.stringify({ attribute: ["production"], stat: "sum", interval: "every_12_months", start_time: `${year}-01-01`, end_time: `${year}-12-31`, group_by: "key" }),
				attributename: "sum_production",
				metric: "Production",
				unit: "t",
				plotId: "productProduction",
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

	const proteinCrops = new Set(["Alfalfa", "Broad beans", "Chickpeas", "Lentils", "Lupins", "Peas"]);
	const formattedProd = prod.charAt(0).toUpperCase() + prod.slice(1).toLowerCase();
	if (proteinCrops.has(formattedProd)) {
		return [
			{
				type: "stats",
				project: "oilseeds_protein_crops",
				collection: "__protein_crops_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_12_months",
					start_time: `${year}-01-01`,
					end_time: `${year}-12-31`,
					filters: [{ property_name: "product", operator: "eq", property_value: formattedProd }],
					group_by: "key",
				}),
				attributename: "avg_price",
				metric: "Average Price",
				unit: "€/t",
				plotId: "productPrices",
			},
		];
	}

	// TODO: Perform error handling
	return [{ type: "error" }, { type: "error" }, { type: "error" }];
};

export default mapInfoConfigs;

