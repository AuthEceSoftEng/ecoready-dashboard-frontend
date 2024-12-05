export	const organization = "livorganic";

export const livOrganicConfigs = (region, startDate, endDate, differenceInDays) => [
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
				{
					property_name: "key",
					operator: "eq",
					property_value: region,
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
		plotId: "metrics",
	},
	{
		type: "stats",
		project: "livorganic_project",
		collection: "weather_data",
		params: JSON.stringify({
			attribute: ["mean_temperature"],
			stat: "avg",
			interval: `every_${differenceInDays}_days`,
			start_time: startDate,
			end_time: endDate,
			filters: [{
				property_name: "key",
				operator: "eq",
				property_value: region,
			}],
			group_by: "key",
		}),
		plotId: "meanMeanTemperature",
	},
	{
		type: "stats",
		project: "livorganic_project",
		collection: "weather_data",
		params: JSON.stringify({
			attribute: ["max_temperature"],
			stat: "max",
			interval: `every_${differenceInDays}_days`,
			start_time: startDate,
			end_time: endDate,
			filters: [{
				property_name: "key",
				operator: "eq",
				property_value: region,
			}],
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
			interval: `every_${differenceInDays}_days`,
			start_time: startDate,
			end_time: endDate,
			filters: [{
				property_name: "key",
				operator: "eq",
				property_value: region,
			}],
			group_by: "key",
		}),
		plotId: "minMinTemperature",
	},
	{
		type: "stats",
		project: "livorganic_project",
		collection: "weather_data",
		params: JSON.stringify({
			attribute: ["rain"],
			stat: "sum",
			interval: `every_${differenceInDays}_days`,
			start_time: startDate,
			end_time: endDate,
			filters: [{
				property_name: "key",
				operator: "eq",
				property_value: region,
			}],
			group_by: "key",
		}),
		plotId: "rainSum",
	},
	{
		type: "stats",
		project: "livorganic_project",
		collection: "weather_data",
		params: JSON.stringify({
			attribute: ["wind_speed"],
			stat: "avg",
			interval: `every_${differenceInDays}_days`,
			start_time: startDate,
			end_time: endDate,
			filters: [{
				property_name: "key",
				operator: "eq",
				property_value: region,
			}],
			group_by: "key",
		}),
		plotId: "meanWindSpeed",
	},
];

