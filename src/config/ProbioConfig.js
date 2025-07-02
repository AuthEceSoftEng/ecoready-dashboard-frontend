export const organization = "probio";

// Helper function to create common query structure
const createBaseParams = (attributes, dateStart, dateEnd) => ({
	attributes,
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
});

export const probioConfigs = (dateStart, dateEnd, product = "Overview") => {
	const configMap = {
		Overview: {
			type: "data",
			project: "probio_project",
			collection: "weather_data",
			params: JSON.stringify(
				createBaseParams(
					[
						"timestamp",
						"air_pressure",
						"air_humidity",
						"air_temperature_avg",
						"air_temperature_max",
						"air_temperature_min",
						"precipitation",
					],
					dateStart,
					dateEnd,
				),
			),
			plotId: "metrics",
		},
		Oats: {
			type: "data",
			project: "probio_project",
			collection: "mockup_oats",
			params: JSON.stringify(
				createBaseParams(
					[
						"timestamp",
						"average_temperature",
						"precipitation",
						"precipitation_sum",
						"water_demand",
						"sum_water_demand",
					],
					dateStart,
					dateEnd,
				),
			),
			plotId: "oatMetrics",
		},
	};

	// Return specific config or all configs
	return product in configMap ? [configMap[product]] : Object.values(configMap);
};

