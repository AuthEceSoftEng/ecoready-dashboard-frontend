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
	custom: `every_${days}_days`,
});

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

const createPriceParams = (startDate, endDate, interval, filters = []) => ({
	attribute: ["price"],
	stat: "avg",
	group_by: "key",
	start_time: startDate,
	end_time: endDate,
	...(filters.length > 0 && { filters }),
});

const createPriceConfigs = (globalProduct, baseConfig, startDate, endDate, differenceInDays, filters = []) => {
	const unit = getUnit(globalProduct);
	const interval = getInterval(differenceInDays);
	const baseParams = createPriceParams(startDate, endDate, interval, filters);

	return [
		// Period prices config
		createPriceConfig(
			baseConfig,
			{
				...baseParams,
				interval: interval.custom,
			},
			"periodPrices",
			unit,
		),
		// Timeline config
		createPriceConfig(
			baseConfig,
			{
				...baseParams,
				interval: interval.daily,
			},
			"pricesTimeline",
			unit,
		),
		// Max price config
		createPriceConfig(
			baseConfig,
			{
				...baseParams,
				stat: "max",
				interval: interval.custom,
				filters: [],
			},
			"maxPrice",
			unit,
		),
	];
};

const createMonthlyPriceConfigs = (globalProduct, dates, filters = [], collection = null, plotId = "monthlyPrices") => {
	const baseConfig = {
		...getPriceBaseConfig(globalProduct),
		...(collection && { collection }),
		params: JSON.stringify({
			attribute: ["price"],
			stat: "avg",
			interval: "every_1_months",
			start_time: dates.formattedBeginningOfMonth,
			end_time: dates.currentDate,
			group_by: "key",
			...(filters.length > 0 && { filters }),
		}),
		plotId,
	};
	return [baseConfig];
};

const getProductionBaseConfig = (globalProduct) => ({
	type: "stats",
	collection: "__production__",
	project: findKeyByText(products, globalProduct),
	plotId: "productProduction",
	unit: getUnit(globalProduct, "production"),
});

export const getPriceConfigs = (globalProduct, startDate, endDate, differenceInDays, product = null, productType = null, collection = null) => {
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

	// Add collection to base config if specified
	const finalBaseConfig = {
		...baseConfig,
		...(productConfig.collection && { collection: productConfig.collection }),
	};

	return createPriceConfigs(globalProduct, finalBaseConfig, startDate, endDate, differenceInDays, productConfig.filters);
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
			plotId: "periodPrices",
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

export const getProductionConfigs = (globalProduct, startDate, endDate, differenceInDays, product = null, productionMetric = null, productionType = null) => {
	const year = new Date().getFullYear().toString();
	if (globalProduct === "Beef") {
		return [
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
				}),
				unit: getUnit(productionMetric, "production"),
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
				}),
				unit: getUnit(productionMetric, "production"),
				plotId: "periodProduction",
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction",
				attribute: "max_tonnes",
			},
		];
	}

	if (globalProduct === "Dairy") {
		return [
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__dairy_production__",
				params: JSON.stringify({
					attribute: ["production"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
				}),
				attribute: "sum_production",
			},
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__dairy_production__",
				params: JSON.stringify({
					attribute: ["production"],
					stat: "sum",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
				}),
				plotId: "periodProduction",
				attribute: "sum_production",
			},
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__dairy_production__",
				params: JSON.stringify({
					attribute: ["production"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction",
				attribute: "max_tonnes",
			},
		];
	}

	if (globalProduct === "Pigmeat") {
		return [
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				unit: getUnit(productionMetric, "production"),
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					group_by: "key",
				}),
				unit: getUnit(productionMetric, "production"),
				plotId: "periodProduction",
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction",
				attribute: `max_${productionMetric}`,
			},
		];
	}

	if (globalProduct === "Poultry") {
		return [
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__poultry_production__",
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "animal",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
				}),
				unit: getUnit(productionMetric, "production"),
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__poultry_production__",
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "animal",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
				}),
				unit: getUnit(productionMetric, "production"),
				plotId: "periodProduction",
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__poultry_production__",
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction",
				attribute: `max_${productionMetric}`,
			},
		];
	}

	if (globalProduct === "Sheep/Goat Meat") {
		return [
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "meat",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "item",
							operator: "eq",
							property_value: productionType,
						},
					],
					group_by: "key",
				}),
				unit: getUnit(productionMetric, "production"),
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "meat",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "item",
							operator: "eq",
							property_value: productionType,
						},
					],
					group_by: "key",
				}),
				unit: getUnit(productionMetric, "production"),
				plotId: "periodProduction",
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction",
				attribute: `max_${productionMetric}`,
			},
		];
	}

	if (globalProduct === "Cereals") {
		return [
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "crop",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
				}),
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "crop",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
				}),
				plotId: "periodProduction",
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction",
				attribute: `max_${productionMetric}`,
			},
		];
	}

	if (globalProduct === "Oilseeds" || product === "Protein Crops") {
		return [
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__oilseeds_production__",
				params: JSON.stringify({
					attribute: ["gross_production"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				attribute: "sum_gross_production",
			},
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__oilseeds_production__",
				params: JSON.stringify({
					attribute: ["gross_production"],
					stat: "sum",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					group_by: "key",
				}),
				plotId: "periodProduction",
				attribute: "sum_gross_production",
			},
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__oilseeds_production__",
				params: JSON.stringify({
					attribute: ["gross_production"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction",
				attribute: "max_gross_production",
			},
		];
	}

	if (globalProduct === "Olive Oil") {
		return [
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__annual_production__",
				params: JSON.stringify({
					attribute: ["year_production_quantity"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				attribute: "sum_year_production_quantity",
			},
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__annual_production__",
				params: JSON.stringify({
					attribute: ["year_production_quantity"],
					stat: "sum",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					group_by: "key",
				}),
				plotId: "periodProduction",
				attribute: "sum_year_production_quantity",
			},
			{
				...getProductionBaseConfig(globalProduct),
				collection: "__annual_production__",
				params: JSON.stringify({
					attribute: ["year_production_quantity"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction",
				attribute: "max_year_production_quantity",
			},
		];
	}

	if (globalProduct === "Rice") {
		return [
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
				}),
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
				}),
				plotId: "periodProduction",
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction",
				attribute: `max_${productionMetric}`,
			},
		];
	}

	if (globalProduct === "Sugar") {
		return [
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "sum",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					group_by: "key",
				}),
				plotId: "periodProduction",
				attribute: `sum_${productionMetric}`,
			},
			{
				...getProductionBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: [productionMetric],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction",
				attribute: `max_${productionMetric}`,
			},
		];
	}

	return [];
};
