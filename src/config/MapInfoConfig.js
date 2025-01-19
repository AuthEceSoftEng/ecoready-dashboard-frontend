import { calculateDates } from "../utils/data-handling-functions.js";

export const organization = "european_data";

export const mapInfoConfigs = (country, product, startDate, endDate, customDate, differenceInDays) => {
	const { year, currentDate, formattedBeginningOfMonth } = calculateDates(customDate);
	console.log(year, currentDate, formattedBeginningOfMonth);
	return [
		{
			type: "stats",
			project: product,
			collection: "__rice_prices__",
			params: JSON.stringify({
				attribute: ["price"],
				stat: "avg",
				interval: `every_${differenceInDays}_days`,
				start_time: startDate,
				end_time: endDate,
				group_by: "key",
			}),
			plotId: "periodPrices",
		},
		// {
		// 	type: "stats",
		// 	project: product,
		// 	collection: "__rice_prices__",
		// 	params: JSON.stringify({
		// 		attribute: ["price"],
		// 		stat: "avg",
		// 		interval: "every_1_months",
		// 		start_time: formattedBeginningOfMonth,
		// 		end_time: currentDate,
		// 		filters: [
		// 			{
		// 				property_name: "key",
		// 				operator: "eq",
		// 				property_value: country,
		// 			},
		// 		],
		// 	}),
		// 	plotId: "monthlyPrices",
		// },
		{
			type: "stats",
			project: product,
			collection: "__rice_production__",
			params: JSON.stringify({
				attribute: ["milled_rice_equivalent_quantity"],
				stat: "sum",
				interval: "every_12_months",
				start_time: `${year}-01-01`,
				end_time: currentDate,
				group_by: "key",
			}),
			plotId: "riceProd1",
		},
		{
			type: "stats",
			project: product,
			collection: "__rice_production__",
			params: JSON.stringify({
				attribute: ["rice_husk_quantity"],
				stat: "sum",
				interval: "every_12_months",
				start_time: `${year}-01-01`,
				end_time: currentDate,
				group_by: "key",
			}),
			plotId: "riceProd2",
		},
	];
};

export default mapInfoConfigs;

