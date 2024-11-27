import { calculateDifferenceBetweenDates } from "../utils/data-handling-functions.js";

export const organization = "probio";

export const probioConfigs = (dateStart, dateEnd) => {
	const daysBetween = calculateDifferenceBetweenDates(dateStart, dateEnd);

	return [
		{
			type: "data",
			project: "probio_project",
			collection: "weather_data",
			params: JSON.stringify({
				attributes: [
					"timestamp",
					"air_pressure",
					"air_humidity",
					"air_temperature_avg",
					"air_temperature_max",
					"air_temperature_min",
					"precipitation",
				],
				filters: [
					{
						property_name: "timestamp",
						operator: "gte",
						property_value: dateStart,
					},
					{
						property_name: "timestamp",
						operator: "lte",
						property_value: dateEnd,
					},
				],
				order_by: {
					field: "timestamp",
					order: "asc",
				},
			}),
			plotId: "metrics",
		},
		// {
		// 	type: "stats",
		// 	project: "esappin_project",
		// 	collection: "metrics",
		// 	params: JSON.stringify({
		// 		attribute: ["precipitation_sum"],
		// 		stat: "sum",
		// 		interval: "every_1_months",
		// 		start_time: `${yearMonth}-01`,
		// 		end_time: `${yearMonth}-${lastDay}`,
		// 		// filters: [{
		// 		// 	property_name: "key",
		// 		// 	operator: "eq",
		// 		// 	property_value: product,
		// 		// }],
		// 		group_by: "key",
		// 	}),
		// 	plotId: "precipitationSum",
		// },
		// {
		// 	type: "stats",
		// 	project: "esappin_project",
		// 	collection: "metrics",
		// 	params: JSON.stringify({
		// 		attribute: ["shortwave_radiation_sum"],
		// 		stat: "sum",
		// 		interval: "every_1_months",
		// 		start_time: `${yearMonth}-01`,
		// 		end_time: `${yearMonth}-${lastDay}`,
		// 		filters: [{
		// 			property_name: "key",
		// 			operator: "eq",
		// 			property_value: product,
		// 		}],
		// 		group_by: "key",
		// 	}),
		// 	plotId: "shortwaveRadiationSum",
		// },
		// {
		// 	type: "stats",
		// 	project: "esappin_project",
		// 	collection: "metrics",
		// 	params: JSON.stringify({
		// 		attribute: ["max_temperature"],
		// 		stat: "max",
		// 		interval: "every_1_months",
		// 		start_time: `${yearMonth}-01`,
		// 		end_time: `${yearMonth}-${lastDay}`,
		// 		filters: [{
		// 			property_name: "key",
		// 			operator: "eq",
		// 			property_value: product,
		// 		}],
		// 		group_by: "key",
		// 	}),
		// 	plotId: "maxMaxTemperature",
		// },
		// {
		// 	type: "stats",
		// 	project: "esappin_project",
		// 	collection: "metrics",
		// 	params: JSON.stringify({
		// 		attribute: ["min_temperature"],
		// 		stat: "min",
		// 		interval: "every_1_months",
		// 		start_time: `${yearMonth}-01`,
		// 		end_time: `${yearMonth}-${lastDay}`,
		// 		filters: [{
		// 			property_name: "key",
		// 			operator: "eq",
		// 			property_value: product,
		// 		}],
		// 		group_by: "key",
		// 	}),
		// 	plotId: "minMinTemperature",
	// },
	];
};

