/* eslint-disable max-len */
import { calculateDates, findKeyByText } from "../utils/data-handling-functions.js";
import { products } from "../utils/useful-constants.js";

const fruitVegetables = new Set([
	"abricots", "apples", "asparagus", "avocados", "beans", "cabbages",
	"carrots", "cauliflowers", "cherries", "clementines", "courgettes",
	"cucumbers", "egg plants, aubergines", "garlic", "kiwis", "leeks",
	"lemons", "lettuces", "mandarins", "melons", "mushrooms, cultivated",
	"nectarines", "onions", "oranges", "peaches", "pears", "peppers",
	"plums", "satsumas", "strawberries", "table grapes", "tomatoes", "water melons",
]);
const dairyProducts = new Set(["butter", "butteroil", "cheddar", "cream", "edam", "emmental", "gouda", "smp", "wheypowder", "wmp"]); // "drinking milk",

const proteinCrops = new Set(["Alfalfa", "Broad beans", "Chickpeas", "Lentils", "Lupins", "Peas"]);

const cerealProducts = new Set(["barley", "wheat", "maize", "oats", "rye", "sorghum", "triticale"]);

export const organization = "european_data";

const UNITS = {
	price: {
		Rice: "€/t",
		Sugar: "€/t",
		Cereals: "€/t",
		Oilseesds: "€/t",
		Fertilisers: "€/t",
		Wine: "€/HL",
		default: "€/100kg",
	},
	production: {
		Wine: "HL",
		Dairy: "kTonnes",
		heads: "Heads",
		kg_per_head: "kg/head",
		default: "Tonnes",
	},
};

const getUnit = (product, type = "price") => UNITS[type]?.[product] ?? UNITS[type].default;

const getInterval = (days = null) => ({
	daily: "every_1_days",
	monthly: "every_1_months",
	annually: "every_12_months",
	custom: days ? `every_${days}_days` : null,
});

const createParams = (attribute, stat, startDate, endDate, interval, filters = []) => ({
	attribute: Array.isArray(attribute) ? attribute : [attribute],
	stat,
	interval,
	start_time: startDate,
	end_time: endDate,
	group_by: "key",
	...(filters.length > 0 && { filters }),
});

const getProductionBaseConfig = (globalProduct) => ({
	type: "stats",
	collection: "__production__",
	project: findKeyByText(products, globalProduct),
	plotId: "productProduction",
	unit: getUnit(globalProduct, "production"),
});

const createProductionConfig = (baseConfig, params, plotId = null) => ({
	...baseConfig,
	...(plotId && { plotId }),
	params: JSON.stringify(params),
	attribute: plotId?.includes("max") ? `max_${params.attribute[0]}` : `sum_${params.attribute[0]}`,
});

const createProductionConfigs = (globalProduct, startDate, endDate, differenceInDays, productionMetric, map, filters = [], collection = null) => {
	const year = new Date().getFullYear().toString();
	const baseConfig = {
		...getProductionBaseConfig(globalProduct),
		...(collection && { collection }),
	};
	const interval = getInterval(differenceInDays);

	if (map) {
		const mapConfigs = [
			{
				params: createParams(productionMetric, "sum", startDate, endDate, interval.annually, filters),
				plotId: "productProduction",
			},
		];
		return mapConfigs.map((config) => createProductionConfig(baseConfig, config.params, config.plotId));
	}

	const configs = [
		{
			params: createParams(productionMetric, "sum", "2010-01-01", `${year}-12-31`, interval.annually, filters),
			plotId: "productProduction",
		},
		{
			params: createParams(productionMetric, "sum", startDate, endDate, interval.custom, filters),
			plotId: "periodProduction",
		},
		{
			params: createParams(productionMetric, "max", "2010-01-01", `${year}-12-31`, getInterval(36_500).custom),
			plotId: "maxProduction",
		},
	];

	return configs.map((config) => createProductionConfig(baseConfig, config.params, config.plotId));
};

export const getProductionConfigs = (globalProduct, startDate, endDate, differenceInDays, product = null, productionMetric = null, productionType = null, map = false) => {
	const productConfigs = {
		Beef: {
			metric: map ? "tonnes" : productionMetric,
			filters: [{ property_name: "category", operator: "eq", property_value: product }],
		},
		Milk: {
			collection: "__dairy_production__",
			metric: "production",
			filters: [{ property_name: "category", operator: "eq", property_value: product }],
		},
		Pigmeat: {
			metric: map ? "tonnes" : productionMetric,
			filters: [],
		},
		Poultry: {
			collection: "__poultry_production__",
			metric: map ? "tonnes" : productionMetric,
			filters: [{ property_name: "animal", operator: "eq", property_value: product }],
		},
		"Sheep/Goat Meat": {
			metric: map ? "tonnes" : productionMetric,
			filters: [
				{ property_name: "meat", operator: "eq", property_value: product },
				{ property_name: "item", operator: "eq", property_value: productionType },
			],
		},
		Cereals: {
			metric: map ? "gross_production" : productionMetric,
			filters: [{ property_name: "crop", operator: "eq", property_value: product }],
		},
		Oilseeds: {
			collection: "__oilseeds_production__",
			metric: "gross_production",
			attributePrefix: "gross_production",
		},
		"Olive Oil": {
			collection: "__annual_production__",
			metric: "year_production_quantity",
			attributePrefix: "year_production_quantity",
		},
		Rice: {
			metric: productionMetric,
			filters: [{ property_name: "product", operator: "eq", property_value: product }],
		},
		Sugar: {
			metric: map ? "gross_production" : productionMetric,
			filters: [],
		},
	};

	const config = productConfigs[globalProduct];
	if (!config) return [];

	return createProductionConfigs(globalProduct, startDate, endDate, differenceInDays, config.metric, map, config.filters, config.collection);
};

const getPriceBaseConfig = (globalProduct) => ({
	type: "stats",
	collection: "__prices__",
	project: findKeyByText(products, globalProduct),
	unit: getUnit(globalProduct),
	attribute: "avg_price",
});

const createPriceConfig = (baseConfig, params, plotId, unit) => ({
	...baseConfig,
	params: JSON.stringify(params),
	plotId,
	unit,
});

const createPriceConfigs = (globalProduct, baseConfig, startDate, endDate, differenceInDays, map, filters = []) => {
	const unit = getUnit(globalProduct);
	const interval = getInterval(differenceInDays);
	const baseParams = createParams("price", "avg", startDate, endDate, interval, filters);

	if (map) {
		const mapConfigs = [{ interval: interval.annually, plotId: "productPrices", filters }];
		return mapConfigs.map((config) => createPriceConfig(baseConfig, { ...baseParams, ...config }, config.plotId, unit));
	}

	const configs = [
		{ interval: interval.custom, plotId: "periodPrices", filters },
		{ interval: interval.daily, plotId: "pricesTimeline", filters },
		{ interval: interval.custom, plotId: "maxPrice", stat: "max", filters: [] },
	];

	return configs.map((config) => createPriceConfig(baseConfig, { ...baseParams, ...config }, config.plotId, unit));
};

export const getPriceConfigs = (globalProduct, startDate, endDate, differenceInDays, product = null, productType = null, collection = null, map = false) => {
	const baseConfig = getPriceBaseConfig(globalProduct);

	// Product-specific configurations
	const configs = {
		Rice: {
			filters: [
				{ property_name: "type", operator: "eq", property_value: product },
				{ property_name: "variety", operator: "eq", property_value: productType },
			],
		},
		"Olive Oil": {
			filters: [{ property_name: "product", operator: "eq", property_value: product }],
		},
		Sugar: { filters: [] },
		Wine: {
			filters: [{ property_name: "description", operator: "eq", property_value: product }],
		},
		"Fruits & Vegetables": {
			filters: [{ property_name: "product", operator: "eq", property_value: product }],
		},
		Beef: {
			collection: `__${collection}__`,
			filters: [{ property_name: "category", operator: "eq", property_value: product }],
		},

		Pigmeat: {
			collection: `__${collection}__`,
			filters: collection === "carcass_prices" ? []
				: [{ property_name: "category", operator: "eq", property_value: product }, { property_name: "price_type", operator: "eq", property_value: productType }],
		},

		Eggs: {
			collection: "__egg_prices__",
			filters: [{ property_name: "farming_method", operator: "eq", property_value: product }],
		},

		Poultry: {
			collection: "__poultry_prices__",
			filters: [{ property_name: "price_type", operator: "eq", property_value: product }],
		},

		Cereals: {
			filters: [{ property_name: "product_name", operator: "eq", property_value: product }],
		},

		Milk: {
			collection: "__raw_milk_prices__",
			filters: [{ property_name: "product", operator: "eq", property_value: product }],
		},

		Dairy: {
			collection: "__dairy_prices__",
			filters: [{ property_name: "product", operator: "eq", property_value: product?.toUpperCase() || "" }],
		},

		Oilseeds: {
			collection: "__oilseeds_prices__",
			filters: [
				{ property_name: "product", operator: "eq", property_value: product },
				{ property_name: "product_type", operator: "eq", property_value: productType },
			],
		},

		"Protein Crops": {
			collection: "__protein_crops_prices__",
			filters: [
				{ property_name: "product", operator: "eq", property_value: product },
				{ property_name: "product_type", operator: "eq", property_value: productType },
			],
		},

		"Sheep/Goat Meat": {
			collection: "__meat_prices__",
			filters: [{ property_name: "category", operator: "eq", property_value: product }],
		},

		Fertiliser: {
			filters: [{ property_name: "product", operator: "eq", property_value: product }],
		},
	};

	const productConfig = configs[globalProduct];
	if (!productConfig) return [];

	// Add collection to base config if specified
	const finalBaseConfig = {
		...baseConfig,
		...(productConfig.collection && { collection: productConfig.collection }),
	};

	return createPriceConfigs(globalProduct, finalBaseConfig, startDate, endDate, differenceInDays, map, productConfig.filters);
};

const createMonthlyPriceConfigs = (globalProduct, dates, filters = [], collection = null, plotId = "monthlyPrices") => {
	const baseConfig = {
		...getPriceBaseConfig(globalProduct),
		...(collection && { collection }),
		params: JSON.stringify(createParams(
			"price",
			"avg",
			dates.formattedBeginningOfMonth,
			dates.currentDate,
			"every_1_months",
			filters,
		)),
		plotId,
	};
	return [baseConfig];
};

export const getMonthlyPriceConfigs = (globalProduct, customDate, product = null, productType = null, collection = null) => {
	const dates = calculateDates(customDate);

	// Product-specific configurations
	const configs = {
		Rice: {
			filters: [
				{ property_name: "type", operator: "eq", property_value: product },
				{ property_name: "variety", operator: "eq", property_value: productType },
			],
		},
		"Olive Oil": {
			filters: [{ property_name: "product", operator: "eq", property_value: product }],
		},
		Sugar: {
			filters: [],
		},
		Wine: {
			filters: [{ property_name: "description", operator: "eq", property_value: product }],
		},
		"Fruits & Vegetables": {
			filters: [{ property_name: "product", operator: "eq", property_value: product }],
		},
		Beef: {
			collection: `__${collection}__`,
			filters: [{ property_name: "category", operator: "eq", property_value: productType }],
		},
		Pigmeat: {
			collection: `__${collection}__`,
			filters: collection === "carcass_prices" ? [] : [
				{ property_name: "category", operator: "eq", property_value: product },
			],
		},
		Eggs: {
			collection: "__egg_prices__",
			filters: [{ property_name: "farming_method", operator: "eq", property_value: product }],
		},
		Poultry: {
			collection: "__poultry_prices__",
			filters: [{ property_name: "price_type", operator: "eq", property_value: product }],
		},
		Cereals: {
			filters: [{ property_name: "product_name", operator: "eq", property_value: product }],
		},
		Milk: {
			collection: "__raw_milk_prices__",
			filters: [{ property_name: "product", operator: "eq", property_value: product }],
		},
		Dairy: {
			collection: "__dairy_prices__",
			filters: [{ property_name: "product", operator: "eq", property_value: product }],
		},
		Oilseeds: {
			collection: "__oilseeds_prices__",
			filters: [
				{ property_name: "product", operator: "eq", property_value: product },
				{ property_name: "product_type", operator: "eq", property_value: productType },
			],
		},
		"Protein Crops": {
			collection: "__protein_crops_prices__",
			filters: [
				{ property_name: "product", operator: "eq", property_value: product },
				{ property_name: "product_type", operator: "eq", property_value: productType },
			],
		},
		"Sheep/Goat Meat": {
			collection: "__meat_prices__",
			filters: [{ property_name: "category", operator: "eq", property_value: product }],
		},
		Fertiliser: {
			filters: [{ property_name: "product", operator: "eq", property_value: product }],
		},
	};

	const productConfig = configs[globalProduct];
	if (!productConfig) return [];

	return createMonthlyPriceConfigs(globalProduct, dates, productConfig.filters, productConfig.collection, productConfig.plotId);
};

const createMapParams = (attribute, stat, year, filters = []) => ({
	attribute: Array.isArray(attribute) ? attribute : [attribute],
	stat,
	interval: getInterval().annually,
	start_time: `${year}-01-01`,
	end_time: `${year}-12-31`,
	group_by: "key",
	...(filters.length > 0 && { filters }),
});

const createMapConfig = (project, collection, params, attributename, metric, unit, plotId, perRegion = false) => ({
	type: "stats",
	project,
	collection,
	params: JSON.stringify(params),
	attributename,
	metric,
	unit,
	plotId,
	...(perRegion && { perRegion }),
});

const createPriceMapConfig = (project, collection, metric, unit, plotId, year, filters = [], perRegion = false) => {
	const params = createMapParams("price", "avg", year, filters);
	return createMapConfig(project, collection, params, "avg_price", metric, unit, plotId, perRegion);
};

const createProductionMapConfig = (project, collection, attribute, metric, unit, plotId, year, filters = [], perRegion = false) => {
	const params = createMapParams(attribute, "sum", year, filters);
	return createMapConfig(project, collection, params, `sum_${attribute}`, metric, unit, plotId, perRegion);
};

export const mapInfoConfigs = (globalProduct, year) => {
	const product = globalProduct.toLowerCase();

	if (product === "rice") {
		return [
			createPriceMapConfig("rice", "__prices__", "Average Price", "€/t", "productPrices", year),
			createProductionMapConfig("rice", "__production__", "milled_rice_equivalent_quantity", "Milled Rice Quantity", "t", "productProduction1", year),
			createProductionMapConfig("rice", "__production__", "rice_husk_quantity", "Rice Husk Quantity", "t", "productProduction2", year),
		];
	}

	if (product === "beef") {
		return [
			createPriceMapConfig("beef", "__carcass_prices__", "Average Carcass Price", "€/100kg", "productPrices1", year),
			createPriceMapConfig("beef", "__live_animal_prices__", "Average Animal Price", "€/100kg", "productPrices2", year),
			createProductionMapConfig("beef", "__production__", "tonnes", "Production (tonnes)", "t", "productProduction1", year),
			createProductionMapConfig("beef", "__production__", "heads", "Production (heads)", "", "productProduction2", year),
			createProductionMapConfig("beef", "__production__", "kg_per_head", "Production (kg/head)", "kg/head", "productProduction3", year),
		];
	}

	if (product === "pigmeat") {
		return [
			createPriceMapConfig("pigmeat", "__carcass_prices__", "Average Carcass Price", "€/100kg", "productPrices", year),
			createProductionMapConfig("pigmeat", "__production__", "tonnes", "Production (tonnes)", "t", "productProduction1", year),
			createProductionMapConfig("pigmeat", "__production__", "heads", "Production (heads)", "", "productProduction2", year),
			createProductionMapConfig("pigmeat", "__production__", "kg_per_head", "Production (kg/head)", "kg/head", "productProduction3", year),
		];
	}

	if (product === "poultry") {
		return [
			createPriceMapConfig("eggs_poultry", "__poultry_prices__", "Average Selling Price", "€/100kg", "productPrices", year, [{ property_name: "price_type", operator: "eq", property_value: "Selling price" }]),
			createProductionMapConfig("eggs_poultry", "__poultry_production__", "tonnes", "Poultry Meat Production", "t", "productProduction", year, [{ property_name: "animal", operator: "eq", property_value: "Poultry meat" }]),
		];
	}

	if (product === "eggs") {
		return ["Barn", "Cage", "Free range", "Organic"].map((farmingMethod, index) => createPriceMapConfig("eggs_poultry", "__egg_prices__", `Average Selling Price (${farmingMethod})`, "€/100kg", `productPrices${index + 1}`, year, [{ property_name: "farming_method", operator: "eq", property_value: farmingMethod }]));
	}

	if (product === "wine") {
		return [createPriceMapConfig("wine", "__prices__", "Average Price", "€/HL.", "productPrices", year)];
	}

	if (product === "olive oil") {
		return [
			createPriceMapConfig("olive_oil", "__prices__", "Average Price", "€/100kg", "productPrices", year),
			createProductionMapConfig("olive_oil", "__annual_production__", "year_production_quantity", "Production", "t", "productProduction1", year),
		];
	}

	if (product === "sugar") {
		return [
			createPriceMapConfig("sugar", "__prices__", "Average Price", "€/t", "productPrices", year, [], true),
			createProductionMapConfig("sugar", "__production__", "gross_production", "Gross Production", "t", "productProduction1", year, [], true),
		];
	}

	if (fruitVegetables.has(globalProduct)) {
		return [createPriceMapConfig("fruit_vegetables", "__prices__", "Average Price", "€/100kg", "productPrices", year, [{ property_name: "product", operator: "eq", property_value: globalProduct }])];
	}

	if (dairyProducts.has(globalProduct)) {
		return [createPriceMapConfig("milk_dairy", "__dairy_prices__", `Average Selling Price (${product})`, "€/100kg", "productPrices", year, [{ property_name: "product", operator: "eq", property_value: globalProduct.toUpperCase() }])];
	}

	if (product === "milk") {
		return [
			createPriceMapConfig("milk_dairy", "__raw_milk_prices__", "Average Price", "€/100kg", "productPrices", year),
			createProductionMapConfig("milk_dairy", "__dairy_production__", "production", "Production", "t", "productProduction", year),
		];
	}

	if (cerealProducts.has(product)) {
		const productnames = products.find((item) => item.value === product)?.priceProductType || [];
		const cropnames = products.find((item) => item.value === product)?.productionProductType || [];

		const productData = productnames.map((productname, index) => createPriceMapConfig("cereals", "__prices__", `Average Price (${productname})`, "€/t", `productPrices${index + 1}`, year, [{ property_name: "product_name", operator: "eq", property_value: productname }]));

		const cropData = cropnames.map((cropname, index) => createProductionMapConfig("cereals", "__production__", "gross_production", `Gross Production (${cropname})`, "t", `productProduction${index + 1}`, year, [{ property_name: "crop", operator: "eq", property_value: cropname }]));

		return [...productData, ...cropData];
	}

	const formattedProd = globalProduct.charAt(0).toUpperCase() + globalProduct.slice(1).toLowerCase();
	if (proteinCrops.has(formattedProd)) {
		return [createPriceMapConfig("oilseeds_protein_crops", "__protein_crops_prices__", "Average Price", "€/t", "productPrices", year, [{ property_name: "product", operator: "eq", property_value: formattedProd }])];
	}

	return [{ type: "error", message: `Unknown product: ${globalProduct}` }];
};
