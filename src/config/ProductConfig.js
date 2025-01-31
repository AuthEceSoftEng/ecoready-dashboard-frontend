import { calculateDates } from "../utils/data-handling-functions.js";
import { products, europeanCountries } from "../utils/useful-constants.js";

export const organization = "european_data";

const CEREALS = new Set(["barley", "wheat", "maize", "oats", "rye", "sorghum", "triticale"]);

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
		Wine: "€/HL",
		default: "€/100kg",
	},
	production: {
		Rice: "tonnes",
		Sugar: "tonnes",
		Cereals: "tonnes",
		Wine: "HL",
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

export const getPriceConfigs = (country, product, startDate, endDate, differenceInDays, productType = null, productVariety = null) => {
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

	if (product === "Beef") {
		return [
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

	if (CEREALS.has(product)) {
		const productnames = products.find((item) => item.value === product)?.priceProductType || [];

		return productnames.map((productname, index) => ({
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
						property_value: productname,
					},
				],
				group_by: "key",
				interval: `every_${differenceInDays}_days`,
				start_time: startDate,
				end_time: endDate,
			}),
			plotId: `periodPrices${index + 1}`,
			unit: "€/t",
		}));
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

	return [];
};

export const getMonthlyPriceConfigs = (country, product, customDate, productType = null, productVariety = null) => {
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

export const getProductionConfigs = (product, productType) => {
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
				project: product,
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["rice_husk_quantity"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "productProduction2",
				unit: getUnit(product, "production"),
				attribute: "sum_rice_husk_quantity",
			},
			{
				type: "stats",
				project: product,
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

	if (product === "olive_oil") {
		return [
			{
				type: "stats",
				project: product,
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
				project: product,
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

	if (product === "sugar") {
		return [
			{
				type: "stats",
				project: product,
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
				project: product,
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
				project: product,
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
				project: product,
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

	if (product === "beef") {
		return [
			{
				type: "stats",
				project: product,
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
				unit: getUnit(product, "production"),
				attribute: "sum_tonnes",
			},
			{
				type: "stats",
				project: product,
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
		];
	}

	if (CEREALS.has(product)) {
		const cropnames = products.find((item) => item.value === product)?.productionProductType || [];

		return cropnames.map((cropname, index) => ({
			type: "stats",
			project: "cereals",
			collection: "__production__",
			params: JSON.stringify({
				attribute: ["gross_production"],
				stat: "sum",
				interval: "every_12_months",
				start_time: "2010-01-01",
				end_time: `${year}-12-31`,
				group_by: "key",
				filters: [{
					property_name: "crop",
					operator: "eq",
					property_value: cropname,
				}],
			}),
			plotId: `productProduction${index + 1}`,
			unit: "t",
			attribute: "sum_gross_production",
		}));
	}

	return [];
};
