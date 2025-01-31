import { collapseClasses } from "@mui/material";

import { calculateDates } from "../utils/data-handling-functions.js";
import { products, europeanCountries } from "../utils/useful-constants.js";

export const organization = "european_data";

const FRUIT_VEGETABLES = new Set([
	"abricots", "apples", "asparagus", "avocados", "beans", "cabbages",
	"carrots", "cauliflowers", "cherries", "clementines", "courgettes",
	"cucumbers", "egg plants, aubergines", "garlic", "kiwis", "leeks",
	"lemons", "lettuces", "mandarins", "melons", "mushrooms, cultivated",
	"nectarines", "onions", "oranges", "peaches", "pears", "peppers",
	"plums", "satsumas", "strawberries", "table grapes", "tomatoes", "water melons",
]);

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
		Rice: "tonnes",
		Sugar: "tonnes",
		Cereals: "tonnes",
		Wine: "HL",
		Dairy: "1000 tonnes",
		default: "100kg",
	},
};

const getUnit = (product, type = "price") => {
	const unitMap = UNITS[type] || UNITS.price;
	return unitMap[product] || (FRUIT_VEGETABLES.has(product) ? unitMap.default : "");
};

const STATS_BASE_CONFIG = {
	type: "stats",
	collection: "__prices__",
	attribute: "avg_price",
};

export const getPriceConfigs = (country, product, startDate, endDate, differenceInDays, productType = null, productVariety = null, collection = null) => {
	if (product === "Rice") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "rice",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "type",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "variety",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "rice",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "type",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "variety",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Olive Oil") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Sugar") {
		const region = europeanCountries.find((item) => item.value === country)?.region || "EU Average";
		return [
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: region,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: region,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: region,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Wine") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "description",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "description",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "description",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Fruits & Vegetables") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "fruit_vegetables",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "fruit_vegetables",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "fruit_vegetables",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Beef") { // needs configuration in the main screen
		return [
			{
				...STATS_BASE_CONFIG,
				project: "beef",
				collection: `__${collection}__`, // Note different collection
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "beef",
				collection: `__${productType}__`, // Note different collection
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "beef",
				collection: `__${productType}__`,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Pigmeat") {
		if (collection === "carcass_prices") {
			return [
				{
					...STATS_BASE_CONFIG,
					project: "pigmeat",
					collection: `__${collection}__`, // Note different collection
					params: JSON.stringify({
						attribute: ["price"],
						stat: "avg",
						filters: [
							{
								property_name: "key",
								operator: "eq",
								property_value: country,
							},
						],
						group_by: "key",
						interval: `every_${differenceInDays}_days`,
						start_time: startDate,
						end_time: endDate,
					}),
					plotId: "periodPrices",
					unit: getUnit(product),
				},
				{
					...STATS_BASE_CONFIG,
					project: "pigmeat",
					collection: `__${collection}__`, // Note different collection
					params: JSON.stringify({
						attribute: ["price"],
						stat: "avg",
						filters: [
							{
								property_name: "key",
								operator: "eq",
								property_value: country,
							},
						],
						group_by: "key",
						interval: "every_1_days",
						start_time: startDate,
						end_time: endDate,
					}),
					plotId: "pricesTimeline",
					unit: getUnit(product),
				},
				{
					...STATS_BASE_CONFIG,
					project: "pigmeat",
					collection: `__${collection}__`,
					params: JSON.stringify({
						attribute: ["price"],
						stat: "max",
						filters: [
							{
								property_name: "key",
								operator: "eq",
								property_value: country,
							},
						],
						group_by: "key",
						interval: `every_${differenceInDays}_days`,
						start_time: startDate,
						end_time: endDate,
					}),
					plotId: "maxPrice",
					unit: getUnit(product),
				},
			];
		}

		return [
			{
				...STATS_BASE_CONFIG,
				project: "pigmeat",
				collection: `__${collection}__`, // Note different collection
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "price_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "pigmeat",
				collection: `__${collection}__`, // Note different collection
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "price_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "pigmeat",
				collection: `__${collection}__`,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "price_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Eggs") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "eggs_poultry",
				collection: "__egg_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "farming_method",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "eggs_poultry",
				collection: "__egg_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "farming_method",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "eggs_poultry",
				collection: "__egg_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "farming_method",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Poultry") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "eggs_poultry",
				collection: "__poultry_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product_name",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "price_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "periodPrices",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "eggs_poultry",
				collection: "__poultry_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product_name",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "price_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "eggs_poultry",
				collection: "__poultry_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product_name",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "price_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Cereals") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "cereals",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product_name",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product_name",
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
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product_name",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Milk") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "milk_dairy",
				collection: "__raw_milk_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "periodPrices",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "milk_dairy",
				collection: "__raw_milk_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "milk_dairy",
				collection: "__raw_milk_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Dairy") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "milk_dairy",
				collection: "__dairy_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "periodPrices",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "milk_dairy",
				collection: "__dairy_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "milk_dairy",
				collection: "__dairy_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Oilseeds") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "oilseeds_protein_crops",
				collection: "__oilseeds_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
				}),
				plotId: "periodPrices",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "oilseeds_protein_crops",
				collection: "__oilseeds_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "oilseeds_protein_crops",
				collection: "__oilseeds_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Protein Crops") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "oilseeds_protein_crops",
				collection: "__protein_crops_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
				}),
				plotId: "periodPrices",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "oilseeds_protein_crops",
				collection: "__protein_crops_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productVariety,
						}
					],
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "oilseeds_protein_crops",
				collection: "__protein_crops_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productVariety,
						},
					],
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Sheep/Goat Meat") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "sheep_goat_meat",
				collection: "__meat_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "periodPrices",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "sheep_goat_meat",
				collection: "__meat_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "sheep_goat_meat",
				collection: "__meat_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Fertiliser") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "fertiliser",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "periodPrices",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "fertiliser",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_days",
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
			{
				...STATS_BASE_CONFIG,
				project: "fertiliser",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "max",
					interval: `every_${differenceInDays}_days`,
					start_time: startDate,
					end_time: endDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	return [];
};

export const getMonthlyPriceConfigs = (country, product, customDate, productType = null, productVariety = null, collection = null) => {
	const { currentDate, formattedBeginningOfMonth } = calculateDates(customDate);

	if (product === "Rice") {
		return [
			{
				type: "stats",
				project: product,
				collection: "__prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "type",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "variety",
							operator: "eq",
							property_value: productVariety,
						},
					],
				}),
				plotId: "monthlyPrices",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Olive Oil") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
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
				unit: getUnit(product),
			},
		];
	}

	if (product === "Sugar") {
		const region = europeanCountries.find((item) => item.value === country)?.region || "EU Average";
		return [
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: region,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				plotId: "monthlyPrices",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Wine") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: product,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "description",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
				}),
				unit: getUnit(product),
			},
		];
	}

	if ((product === "Fruits & Vegetables")) {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "fruit_vegetables",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
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
				unit: getUnit(product),
			},
		];
	}

	if (product === "Beef") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "beef",
				collection: `__${productType}__`,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
							operator: "eq",
							property_value: productVariety,
						},
					],
				}),
				plotId: "monthlyPrices",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Pigmeat") {
		if (collection === "carcass_prices") {
			return [
				{
					...STATS_BASE_CONFIG,
					project: "pigmeat",
					collection: `__${collection}__`,
					params: JSON.stringify({
						attribute: ["price"],
						stat: "avg",
						interval: "every_1_months",
						start_time: formattedBeginningOfMonth,
						end_time: currentDate,
						filters: [
							{
								property_name: "key",
								operator: "eq",
								property_value: country,
							},
						],
					}),
					plotId: "monthlyPrices",
					unit: getUnit(product),
				},
			];
		}

		return [
			{
				...STATS_BASE_CONFIG,
				project: "pigmeat",
				collection: `__${collection}__`,
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					interval: "every_1_months",
					start_time: formattedBeginningOfMonth,
					end_time: currentDate,
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
				}),
				plotId: "monthlyPrices",
				unit: getUnit(product),
			},
		];
	}

	if (product === "Eggs") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "eggs_poultry",
				collection: "__egg_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "farming_method",
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

	if (product === "Poultry") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "eggs_poultry",
				collection: "__poultry_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product_name",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "price_type",
							operator: "eq",
							property_value: productVariety,
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

	if (product === "Cereals") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "cereals",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product_name",
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

	if (product === "Milk") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "milk_dairy",
				collection: "__raw_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
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

	if (product === "Dairy") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "milk_dairy",
				collection: "__dairy_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
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

	if (product === "Oilseeds") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "oilseeds_protein_crops",
				collection: "__oilseeds_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productVariety,
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

	if (product === "Protein Crops") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "oilseeds_protein_crops",
				collection: "__protein_crops_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "product_type",
							operator: "eq",
							property_value: productVariety,
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

	if (product === "Sheep/Goat Meat") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "sheep_goat_meat",
				collection: "__meat_prices__",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "category",
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

	if (product === "Fertiliser") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "fertiliser",
				params: JSON.stringify({
					attribute: ["price"],
					stat: "avg",
					filters: [
						{
							property_name: "key",
							operator: "eq",
							property_value: country,
						},
						{
							property_name: "product",
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

	return [];
};

export const getProductionConfigs = (product, productType, productVariety = null) => {
	const year = new Date().getFullYear().toString();

	if (product === "Rice") {
		return [
			{
				type: "stats",
				project: "rice",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["milled_rice_equivalent_quantity"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "type",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: getUnit(product, "production"),
				attribute: "sum_milled_rice_equivalent_quantity",
			},
			{
				type: "stats",
				project: "rice",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["milled_rice_equivalent_quantity"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: getUnit(product, "production"),
				attribute: "max_milled_rice_equivalent_quantity",
			},
			{
				type: "stats",
				project: "rice",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["rice_husk_quantity"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "type",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction2",
				unit: getUnit(product, "production"),
				attribute: "sum_rice_husk_quantity",
			},
			{
				type: "stats",
				project: "rice",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["rice_husk_quantity"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction2",
				unit: getUnit(product, "production"),
				attribute: "max_rice_husk_quantity",
			},
		];
	}

	if (product === "Olive Oil") {
		return [
			{
				type: "stats",
				project: "olive_oil",
				collection: "__annual_production__",
				params: JSON.stringify({
					attribute: ["year_production_quantity"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: getUnit(product, "production"),
				attribute: "sum_year_production_quantity",
			},
			{
				type: "stats",
				project: "olive_oil",
				collection: "__annual_production__",
				params: JSON.stringify({
					attribute: ["year_production_quantity"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: getUnit(product, "production"),
				attribute: "max_year_production_quantity",
			},
		];
	}

	if (product === "Sugar") {
		return [
			{
				type: "stats",
				project: "sugar",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["gross_production"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: getUnit(product, "production"),
				attribute: "sum_gross_production",
			},
			{
				type: "stats",
				project: "sugar",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["yield"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "productProduction2",
				unit: "t/ha",
				attribute: "sum_yield",
			},
			{
				type: "stats",
				project: "sugar",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["gross_production"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: "t/ha",
				attribute: "max_gross_production",
			},
			{
				type: "stats",
				project: "sugar",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["yield"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction2",
				unit: "t/ha",
				attribute: "max_yield",
			},
		];
	}

	if (product === "Beef") {
		return [
			{
				type: "stats",
				project: "beef",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["tonnes"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: "t",
				attribute: "sum_tonnes",
			},
			{
				type: "stats",
				project: "beef",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["tonnes"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: getUnit(product, "production"),
				attribute: "max_tonnes",
			},
			{
				type: "stats",
				project: "beef",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["heads"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction2",
				unit: "t",
				attribute: "sum_heads",
			},
			{
				type: "stats",
				project: "beef",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["heads"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "maxProduction2",
				unit: "heads",
				attribute: "max_heads",
			},
			{
				type: "stats",
				project: "beef",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["kg_per_head"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction3",
				unit: "kg/head",
				attribute: "sum_kg_per_head",
			},
			{
				type: "stats",
				project: "beef",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["kg_per_head"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "maxProduction3",
				unit: "kg/head",
				attribute: "max_kg_per_head",
			},
		];
	}

	if (product === "Pigmeat") {
		return [
			{
				type: "stats",
				project: "pigmeat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["tonnes"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: "t",
				attribute: "sum_tonnes",
			},
			{
				type: "stats",
				project: "pigmeat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["tonnes"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: getUnit(product, "production"),
				attribute: "max_tonnes",
			},
			{
				type: "stats",
				project: "pigmeat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["heads"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "productProduction2",
				unit: "t",
				attribute: "sum_heads",
			},
			{
				type: "stats",
				project: "pigmeat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["heads"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction2",
				unit: "heads",
				attribute: "max_heads",
			},
			{
				type: "stats",
				project: "pigmeat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["kg_per_head"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "productProduction3",
				unit: "kg/head",
				attribute: "sum_kg_per_head",
			},
			{
				type: "stats",
				project: "pigmeat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["kg_per_head"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction3",
				unit: "kg/head",
				attribute: "max_kg_per_head",
			},
		];
	}

	if (product === "Poultry") {
		return [
			{
				type: "stats",
				project: "eggs_poultry",
				collection: "__poultry_production__",
				params: JSON.stringify({
					attribute: ["tonnes"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "animal",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: getUnit(product, "production"),
				attribute: "sum_tonnes",
			},
			{
				type: "stats",
				project: "eggs_poultry",
				collection: "__poultry_production__",
				params: JSON.stringify({
					attribute: ["tonnes"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "animal",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: getUnit(product, "production"),
				attribute: "max_tonnes",
			},
			{
				type: "stats",
				project: "eggs_poultry",
				collection: "__poultry_production__",
				params: JSON.stringify({
					attribute: ["heads"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "animal",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction2",
				unit: "heads",
				attribute: "sum_heads",
			},
			{
				type: "stats",
				project: "eggs_poultry",
				collection: "__poultry_production__",
				params: JSON.stringify({
					attribute: ["heads"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "animal",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "maxProduction2",
				unit: "heads",
				attribute: "max_heads",
			},
			{
				type: "stats",
				project: "eggs_poultry",
				collection: "__poultry_production__",
				params: JSON.stringify({
					attribute: ["kg_per_head"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "animal",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction3",
				unit: "kg/head",
				attribute: "sum_kg_per_head",
			},
			{
				type: "stats",
				project: "eggs_poultry",
				collection: "__poultry_production__",
				params: JSON.stringify({
					attribute: ["kg_per_head"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "animal",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: "kg/head",
				attribute: "max_kg_per_head",
			},
		];
	}

	if (product === "Cereals") {
		return [
			{
				type: "stats",
				project: "cereals",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["gross_production"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "crop",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: "t",
				attribute: "sum_gross_production",
			},
			{
				type: "stats",
				project: "cereals",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["gross_production"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "crop",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: "t",
				attribute: "max_tonnes",
			},
			{
				type: "stats",
				project: "cereals",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["yield"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "product_name",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction2",
				unit: "t/ha",
				attribute: "sum_yield",
			},
			{
				type: "stats",
				project: "cereals",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["yield"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction2",
				unit: "t/ha",
				attribute: "max_yield",
			},
		];
	}

	if (product === "Dairy") {
		return [
			{
				type: "stats",
				project: "milk_dairy",
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
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: getUnit(product, "production"),
				attribute: "sum_production",
			},
			{
				type: "stats",
				project: "milk_dairy",
				collection: "__dairy_production__",
				params: JSON.stringify({
					attribute: ["production"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "category",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: getUnit(product, "production"),
				attribute: "max_tonnes",
			},
		];
	}

	if (product === "Oilseeds") {
		return [
			{
				type: "stats",
				project: "oilseeds_protein_crops",
				collection: "__protein_crops_production__",
				params: JSON.stringify({
					attribute: ["gross_production"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "crop",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: "t",
				attribute: "sum_gross_production",
			},
			{
				type: "stats",
				project: "oilseeds_protein_crops",
				collection: "__protein_crops_production__",
				params: JSON.stringify({
					attribute: ["gross_production"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "crop",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: "t",
				attribute: "max_tonnes",
			},
			{
				type: "stats",
				project: "oilseeds_protein_crops",
				collection: "__protein_crops_production__",
				params: JSON.stringify({
					attribute: ["yield"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "crop",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction2",
				unit: "t/ha",
				attribute: "sum_yield",
			},
			{
				type: "stats",
				project: "oilseeds_protein_crops",
				collection: "__protein_crops_production__",
				params: JSON.stringify({
					attribute: ["yield"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "crop",
							operator: "eq",
							property_value: productType,
						},
					],
					group_by: "key",
				}),
				plotId: "maxProduction2",
				unit: "t/ha",
				attribute: "max_yield",
			},
		];
	}

	if (product === "Sheep/Goat Meat") {
		return [
			{
				type: "stats",
				project: "sheep_goat_meat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["tonnes"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "meat",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "item",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: "t",
				attribute: "sum_tonnes",
			},
			{
				type: "stats",
				project: "sheep_goat_meat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["tonnes"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction1",
				unit: getUnit(product, "production"),
				attribute: "max_tonnes",
			},
			{
				type: "stats",
				project: "sheep_goat_meat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["heads"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "meat",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "item",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction2",
				unit: "t",
				attribute: "sum_heads",
			},
			{
				type: "stats",
				project: "sheep_goat_meat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["heads"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction2",
				unit: "heads",
				attribute: "max_heads",
			},
			{
				type: "stats",
				project: "sheep_goat_meat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["kg_per_head"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "meat",
							operator: "eq",
							property_value: productType,
						},
						{
							property_name: "item",
							operator: "eq",
							property_value: productVariety,
						},
					],
					group_by: "key",
				}),
				plotId: "productProduction3",
				unit: "kg/head",
				attribute: "sum_kg_per_head",
			},
			{
				type: "stats",
				project: "sheep_goat_meat",
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["kg_per_head"],
					stat: "max",
					interval: "every_36500_days",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "maxProduction3",
				unit: "kg/head",
				attribute: "max_kg_per_head",
			},
		];
	}

	return [];
};
