import { calculateDates } from "../utils/data-handling-functions.js";

export const organization = "european_data";

export const productsConfigs = (country, product, startDate, endDate, customDate, differenceInDays) => {
	const { currentDate, formattedBeginningOfMonth } = calculateDates(customDate);
	return [
		{
			type: "data",
			project: product,
			collection: "prices",
			params: JSON.stringify({
				attributes: ["key", "price", "unit", "timestamp"],
				filters: [
					{
						property_name: "key",
						operator: "eq",
						property_value: country,
					},
					{
						property_name: "timestamp",
						operator: "gte",
						property_value: startDate,
					},
					{
						property_name: "timestamp",
						operator: "lte",
						property_value: endDate,
					},
				],
				order_by: {
					field: "timestamp",
					order: "asc",
				},
			}),
			plotId: "metrics_rice_price",
		},
		{
			type: "data",
			project: product,
			collection: "production",
			params: JSON.stringify({
				attributes: ["key", "milled_rice_equivalent_quantity", "rice_husk_quantity", "timestamp"],
				filters: [
					{
						property_name: "key",
						operator: "eq",
						property_value: country,
					},
					{
						property_name: "timestamp",
						operator: "gte",
						property_value: startDate,
					},
					{
						property_name: "timestamp",
						operator: "lte",
						property_value: endDate,
					},
				],
				order_by: {
					field: "timestamp",
					order: "asc",
				},
			}),
			plotId: "metrics_rice_production",
		},
		{
			type: "stats",
			project: product,
			collection: "prices",
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
			}),
			plotId: "stats_prices_historical",
		},
		{
			type: "stats",
			project: product,
			collection: "prices",
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
			plotId: "stats_prices_current",
		},
	];
};

export default productsConfigs;

