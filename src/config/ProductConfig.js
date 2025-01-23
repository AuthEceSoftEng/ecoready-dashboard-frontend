import { calculateDates } from "../utils/data-handling-functions.js";

export const organization = "european_data";

export const getPriceConfigs = (country, product, startDate, endDate, differenceInDays) => [
	{
		type: "stats",
		project: product,
		collection: "__prices__",
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
			],
			group_by: "key",
		}),
		plotId: "periodPrices",
	},
	{
		type: "stats",
		project: product,
		collection: "__prices__",
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
			],
			group_by: "key",
		}),
		plotId: "pricesTimeline",
	},
];

export const getMonthlyPriceConfigs = (country, product, customDate) => {
	const { currentDate, formattedBeginningOfMonth } = calculateDates(customDate);
	return [{
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
	}];
};

export const getProductionConfigs = (product) => [
	{
		type: "stats",
		project: product,
		collection: "__production__",
		params: JSON.stringify({
			attribute: ["milled_rice_equivalent_quantity"],
			stat: "sum",
			interval: "every_12_months",
			start_time: "2010-01-01",
			end_time: "2025-12-31",
			group_by: "key",
		}),
		plotId: "riceProd1",
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
			end_time: "2025-12-31",
			group_by: "key",
		}),
		plotId: "riceProd2",
	},
];

