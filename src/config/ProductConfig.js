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
		heads: "heads",
		kg_per_head: "kg/head",
		default: "Tonnes",
	},
};

const getUnit = (globalProduct, type = "price") => {
	const unitMap = UNITS[type] || UNITS.price;
	return unitMap[globalProduct] ?? unitMap.default;
};

const getPriceBaseConfig = (globalProduct) => ({
	type: "stats",
	collection: "__prices__",
	project: findKeyByText(products, globalProduct),
	attribute: "avg_price",
});

// Modify getProductionBaseConfig(globalProduct), to be a function
const getProductionBaseConfig = (globalProduct) => ({
	type: "stats",
	collection: "__production__",
	project: findKeyByText(products, globalProduct),
	plotId: "productProduction",
});

export const getPriceConfigs = (globalProduct, startDate, endDate, differenceInDays, product = null, productType = null, collection = null) => {
	console.log("getPriceConfigs", globalProduct, startDate, endDate, differenceInDays, product, productType, collection);
	if (globalProduct === "Rice") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "type",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "variety",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "type",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "variety",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Olive Oil") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Sugar") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					// filters: [
					// 	{
					// 		property_name: "key",
					// 		operator: "eq",
					// 		property_value: region,
					// 	},
					// ],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Wine") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "description",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "description",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Fruits & Vegetables") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Beef") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: `__${collection}__`, // Note different collection
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: `__${collection}__`, // Note different collection
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: `__${collection}__`,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Pigmeat") {
		if (collection === "carcass_prices") {
			return [
				{
					...getPriceBaseConfig(globalProduct),
					collection: `__${collection}__`, // Note different collection
					params: JSON.stringify({
						attribute: ["price"],
						stat: "avg",
						group_by: "key",
						interval: `every_${differenceInDays}_days`,
						start_time: startDate,
						end_time: endDate,
					}),
					plotId: "periodPrices",
					unit: getUnit(globalProduct),
				},
				{
					...getPriceBaseConfig(globalProduct),
					collection: `__${collection}__`, // Note different collection
					params: JSON.stringify({
						attribute: ["price"],
						stat: "avg",
						group_by: "key",
						interval: "every_1_days",
						start_time: startDate,
						end_time: endDate,
					}),
					plotId: "pricesTimeline",
					unit: getUnit(globalProduct),
				},
				{
					...getPriceBaseConfig(globalProduct),
					collection: `__${collection}__`,
					params: JSON.stringify({
						attribute: ["price"],
						stat: "max",
						group_by: "key",
						interval: `every_${differenceInDays}_days`,
						start_time: startDate,
						end_time: endDate,
					}),
					plotId: "maxPrice",
					unit: getUnit(globalProduct),
				},
			];
		}

		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: `__${collection}__`, // Note different collection
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "price_type",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: `__${collection}__`, // Note different collection
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "price_type",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: `__${collection}__`,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Eggs") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__egg_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "farming_method",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__egg_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "farming_method",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__egg_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Poultry") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__poultry_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						// {
						// 	property_name: "product_name",
						// 	operator: "eq",
						// 	property_value: product,
						// },
						{
							property_name: "price_type",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__poultry_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						// {
						// 	property_name: "product_name",
						// 	operator: "eq",
						// 	property_value: product,
						// },
						{
							property_name: "price_type",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__poultry_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Cereals") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product_name",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product_name",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Milk") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__raw_milk_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
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
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__raw_milk_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_days",
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
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__raw_milk_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					group_by: "key",
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Dairy") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__dairy_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
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
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__dairy_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_days",
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
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__dairy_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					group_by: "key",
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Oilseeds") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__oilseeds_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__oilseeds_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__oilseeds_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					group_by: "key",
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Protein Crops") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__protein_crops_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__protein_crops_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__protein_crops_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					group_by: "key",
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Sheep/Goat Meat") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__meat_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
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
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__meat_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_days",
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
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__meat_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					group_by: "key",
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Fertiliser") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
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
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_days",
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
				plotId: "pricesTimeline",
				unit: getUnit(globalProduct),
			},
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					group_by: "key",
				}),
				plotId: "maxPrice",
				unit: getUnit(globalProduct),
			},
		];
	}

	return [];
};

export const getMonthlyPriceConfigs = (globalProduct, customDate, product = null, productType = null, collection = null) => {
	const { currentDate, formattedBeginningOfMonth } = calculateDates(customDate);

	if (globalProduct === "Rice") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
					filters: [
						{
							property_name: "type",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "variety",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "monthlyPrices",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Olive Oil") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Sugar") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Wine") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "description",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				unit: getUnit(globalProduct),
			},
		];
	}

	if ((globalProduct === "Fruits & Vegetables")) {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Beef") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: `__${collection}__`,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "monthlyPrices",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Pigmeat") {
		if (collection === "carcass_prices") {
			return [
				{
					...getPriceBaseConfig(globalProduct),
					collection: `__${collection}__`,
					params: JSON.stringify({
						attribute: ["price"],
						stat: "avg",
						interval: "every_1_months",
						start_time: formattedBeginningOfMonth,
						end_time: currentDate,
					}),
					plotId: "monthlyPrices",
					unit: getUnit(globalProduct),
				},
			];
		}

		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: `__${collection}__`,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: product,
						},
					],
				}),
				plotId: "monthlyPrices",
				unit: getUnit(globalProduct),
			},
		];
	}

	if (globalProduct === "Eggs") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__egg_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "farming_method",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	if (globalProduct === "Poultry") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__poultry_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						// {
						// 	property_name: "product_name",
						// 	operator: "eq",
						// 	property_value: product,
						// },
						{
							property_name: "price_type",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	if (globalProduct === "Cereals") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product_name",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	if (globalProduct === "Milk") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__raw_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	if (globalProduct === "Dairy") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__dairy_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	if (globalProduct === "Oilseeds") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__oilseeds_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	if (globalProduct === "Protein Crops") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__protein_crops_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	if (globalProduct === "Sheep/Goat Meat") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				collection: "__meat_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	if (globalProduct === "Fertiliser") {
		return [
			{
				...getPriceBaseConfig(globalProduct),
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	return [];
};

export const getProductionConfigs = (globalProduct, product = null, productionMetric = null, productionType = null) => {
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
				unit: "",
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
				unit: getUnit(globalProduct, "production"),
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
				unit: getUnit(globalProduct, "production"),
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
				unit: "",
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
				unit: "",
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
				unit: "",
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
				unit: getUnit(globalProduct, "production"),
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
				unit: getUnit(globalProduct, "production"),
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
					// filters: [
					// 	{
					// 		property_name: "crop",
					// 		operator: "eq",
					// 		property_value: product,
					// 	},
					// ],
					group_by: "key",
				}),
				unit: getUnit(globalProduct, "production"),
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
				unit: getUnit(globalProduct, "production"),
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
				unit: getUnit(globalProduct, "production"),
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
				unit: getUnit(globalProduct, "production"),
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
				unit: getUnit(globalProduct, "production"),
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
				unit: getUnit(globalProduct, "production"),
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
				unit: getUnit(globalProduct, "production"),
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
				unit: "t/ha",
				attribute: `max_${productionMetric}`,
			},
		];
	}

	return [];
};
