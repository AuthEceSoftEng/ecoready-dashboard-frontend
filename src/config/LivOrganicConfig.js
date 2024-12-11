export	const organization = "livorganic";

export const livOrganicConfigs = (startDate, endDate, differenceInDays) => [
	{
		type: "data",
		project: "livorganic_project",
		collection: "weather_data",
		params: JSON.stringify({
			attributes: [
				"timestamp", "max_temperature",
				"min_temperature", "precipitation", "solar_radiation",
			],
			filters: [
				// {
				// 	property_name: "key",
				// 	operator: "eq",
				// 	property_value: region,
				// },
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
		plotId: "metrics",
	},
	{
		type: "stats",
		project: "livorganic_project",
		collection: "weather_data",
		params: JSON.stringify({
			attribute: ["max_temperature"],
			stat: "max",
			interval: differenceInDays ? `every_${Math.max(differenceInDays, 1)}_days` : "every_1_days",
			start_time: startDate,
			end_time: endDate,
			// filters: [{
			// 	property_name: "key",
			// 	operator: "eq",
			// 	property_value: region,
			// }],
			group_by: "key",
		}),
		plotId: "maxMaxTemperature",
	},
	{
		type: "stats",
		project: "livorganic_project",
		collection: "weather_data",
		params: JSON.stringify({
			attribute: ["min_temperature"],
			stat: "min",
			interval: differenceInDays ? `every_${Math.max(differenceInDays, 1)}_days` : "every_1_days",
			start_time: startDate,
			end_time: endDate,
			// filters: [{
			// 	property_name: "key",
			// 	operator: "eq",
			// 	property_value: region,
			// }],
			group_by: "key",
		}),
		plotId: "minMinTemperature",
	},
	{
		type: "stats",
		project: "livorganic_project",
		collection: "weather_data",
		params: JSON.stringify({
			attribute: ["precipitation"],
			stat: "avg",
			interval: differenceInDays ? `every_${Math.max(differenceInDays, 1)}_days` : "every_1_days",
			start_time: startDate,
			end_time: endDate,
			// filters: [{
			// 	property_name: "key",
			// 	operator: "eq",
			// 	property_value: region,
			// }],
			group_by: "key",
		}),
		plotId: "meanPrecipitation",
	},
	{
		type: "stats",
		project: "livorganic_project",
		collection: "weather_data",
		params: JSON.stringify({
			attribute: ["solar_radiation"],
			stat: "avg",
			interval: differenceInDays ? `every_${Math.max(differenceInDays, 1)}_days` : "every_1_days",
			start_time: startDate,
			end_time: endDate,
			// filters: [{
			// 	property_name: "key",
			// 	operator: "eq",
			// 	property_value: region,
			// }],
			group_by: "key",
		}),
		plotId: "meanSolarRadiation",
	},
];

