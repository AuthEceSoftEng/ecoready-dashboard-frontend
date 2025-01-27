import { calculateDates } from "../utils/data-handling-functions.js";
import { products } from "../utils/useful-constants.js";

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

const getUnit = (product) => {
	const units = {
		rice: "€/t",
		sugar: "€/t",
		wine: "€/HL",
		beef: "€/100kg",
		olive_oil: "€/100kg",
		default: "€/100kg",
	};
	return units[product] || (FRUIT_VEGETABLES.has(product) ? units.default : "");
};

const STATS_BASE_CONFIG = {
	type: "stats",
	collection: "__prices__",
	attribute: "avg_price",
};

export const getPriceConfigs = (country, product, startDate, endDate, differenceInDays) => {
	if (product === "rice") {
		return [
			{
				type: "stats",
				collection: "__prices__",
				attribute: "avg_price",
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
				type: "stats",
				collection: "__prices__",
				attribute: "avg_price",
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

	if (["wine", "olive_oil", "sugar"].includes(product)) {
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

	if (FRUIT_VEGETABLES.has(product)) {
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
							property_value: product,
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
				plotId: "maxPrice",
				unit: getUnit(product),
			},
		];
	}

	if (product === "beef") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "beef",
				collection: "__carcass_prices__", // Note different collection
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
				project: "beef",
				collection: "__carcass_prices__", // Note different collection
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
				collection: "__carcass_prices__",
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
		const productnames = products.find((item) => item.value === product)?.pricetext || [];

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

	return [];
};

export const getMonthlyPriceConfigs = (country, product, customDate) => {
	const { currentDate, formattedBeginningOfMonth } = calculateDates(customDate);

	if (product === "rice") {
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
					],
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	if (["wine", "olive_oil", "sugar"].includes(product)) {
		return [
			{
				...STATS_BASE_CONFIG,
				project: product,
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
			},
		];
	}

	if (FRUIT_VEGETABLES.has(product)) {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "fruit_vegetables",
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
							property_name: "product",
							operator: "eq",
							property_value: product,
						},
					],
				}),
				plotId: "monthlyPrices",
			},
		];
	}

	if (product === "beef") {
		return [
			{
				...STATS_BASE_CONFIG,
				project: "beef",
				collection: "__carcass_prices__",
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
			},
		];
	}

	return [];
};

export const getProductionConfigs = (product) => {
	const year = new Date().getFullYear().toString();
	if (product === "rice") {
		return [
			{
				type: "stats",
				project: product,
				collection: "__production__",
				params: JSON.stringify({
					attribute: ["milled_rice_equivalent_quantity"],
					stat: "sum",
					interval: "every_12_months",
					start_time: "2010-01-01",
					end_time: `${year}-12-31`,
					group_by: "key",
				}),
				plotId: "productProduction1",
				unit: "t",
				attribute: "sum_milled_rice_equivalent_quantity",
			},
			{
				type: "stats",
				project: product,
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
				unit: "t",
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
				unit: "t",
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
				unit: "t",
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
				unit: "t",
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
				unit: "t",
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
				unit: "t",
				attribute: "sum_gross_production",
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
				unit: "t",
				attribute: "max_gross_production",
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
				unit: "t",
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
				unit: "t",
				attribute: "max_tonnes",
			},
		];
	}

	if (CEREALS.has(product)) {
		const cropnames = products.find((item) => item.value === product)?.productiontext || [];

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
