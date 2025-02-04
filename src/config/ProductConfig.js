/* eslint-disable max-len */
import { calculateDates, findKeyByText } from "../utils/data-handling-functions.js";
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

const getPriceBaseConfig = (product) => ({
	type: "stats",
	collection: "__prices__",
	project: findKeyByText(products, product),
	attribute: "avg_price",
});

// Modify getProductionBaseConfig(product), to be a function
const getProductionBaseConfig = (product) => ({
	type: "stats",
	collection: "__production__",
	project: findKeyByText(products, product),
});

export const getPriceConfigs = (country, product, startDate, endDate, differenceInDays, productType = null, productVariety = null, collection = null) => {
	if (product === "Rice") {
		return [
			{
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
					...getPriceBaseConfig(product),
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
					...getPriceBaseConfig(product),
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
					...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
						},
					],
				}),
				plotId: "pricesTimeline",
				unit: getUnit(product),
			},
			{
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
					...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getPriceBaseConfig(product),
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
				...getProductionBaseConfig(product),
				params: JSON.stringify({
					attribute: ["milled_rice_equivalent_quantity"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "product",
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
				params: JSON.stringify({
					attribute: ["rice_husk_quantity"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					filters: [
						{
							property_name: "product",
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
				...getProductionBaseConfig(product),
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
