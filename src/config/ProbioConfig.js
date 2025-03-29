export const organization = "probio";

export const probioConfigs = (dateStart, dateEnd) => [
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
];

