/* eslint-disable max-len */
import { calculateDates, findKeyByText } from "../utils/data-handling-functions.js";
import { products } from "../utils/useful-constants.js";

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
			filters: [{ property_name: "product", operator: "eq", property_value: product.toUpperCase() }],
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

export const getMapInfoConfigs = (globalProduct, year) => {
	const productConfigs = {
		Rice:
			[
				{
					collection: "__prices__",
					params: createMapParams(["price"], "avg", year),
					attributename: "avg_price",
					metric: "Average Price",
					unit: getUnit(globalProduct),
					plotId: "productPrices",
				},
				{
					collection: "__production__",
					params: createMapParams(["milled_rice_equivalent_quantity"], "sum", year),
					attributename: "sum_milled_rice_equivalent_quantity",
					metric: "Milled Rice Quantity",
					unit: getUnit(globalProduct, "production"),
					plotId: "productProduction1",
				},
				{
					collection: "__production__",
					params: createMapParams(["rice_husk_quantity"], "sum", year),
					attributename: "sum_rice_husk_quantity",
					metric: "Rice Husk Quantity",
					unit: getUnit(globalProduct, "production"),
					plotId: "productProduction2",
				},
			],

		Beef:
			[
				{
					collection: "__carcass_prices__",
					params: createMapParams(["price"], "avg", year),
					attributename: "avg_price",
					metric: "Average Carcass Price",
					unit: "€/100kg",
					plotId: "productPrices",
				},
				{
					collection: "__production__",
					params: createMapParams(["tonnes"], "sum", year),
					attributename: "sum_tonnes",
					metric: "Production",
					unit: "t",
					plotId: "productProduction1",
				},
			],

		Cereals: (year, product) => {
			const productnames = products.find((item) => item.value === product)?.priceProductType || [];
			const cropnames = products.find((item) => item.value === product)?.productionProductType || [];

			const priceConfigs = productnames.map((productname, index) => ({
				collection: "__prices__",
				params: createMapParams(["price"], "avg", year, [
					{ property_name: "product_name", operator: "eq", property_value: productname },
				]),
				attributename: "avg_price",
				metric: `Average Price (${productname})`,
				unit: "€/t",
				plotId: `productPrices${index + 1}`,
			}));

			const productionConfigs = cropnames.map((cropname, index) => ({
				collection: "__production__",
				params: createMapParams(["gross_production"], "sum", year, [
					{ property_name: "crop", operator: "eq", property_value: cropname },
				]),
				attributename: "sum_gross_production",
				metric: `Gross Production (${cropname})`,
				unit: "t",
				plotId: `productProduction${index + 1}`,
			}));

			return [...priceConfigs, ...productionConfigs];
		},
	};
	const config = productConfigs[globalProduct];
	if (!config) return [{ type: "error" }];

	const baseConfigs = config(year, globalProduct);
	return baseConfigs.map((cfg) => createMapConfig(
		globalProduct === "cereals" ? "cereals" : globalProduct,
		cfg.collection,
		cfg.params,
		cfg.attributename,
		cfg.metric,
		cfg.unit,
		cfg.plotId,
		cfg.perRegion,
	));
};
