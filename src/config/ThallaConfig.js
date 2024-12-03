import { calculateDifferenceBetweenDates } from "../utils/data-handling-functions.js";

export	const organization = "thalla";

const thallaConfigs = (region, dateStart, dateEnd) => {
	const daysBetween = calculateDifferenceBetweenDates(dateStart, dateEnd);

	return [
		{
			type: "data",
			project: "thalla_project",
			collection: "weather_data",
			params: JSON.stringify({
				attributes: [
					"timestamp", "key", "max_temperature",
					"min_temperature", "mean_temperature",
					"rain", "wind_speed",
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
};

export default thallaConfigs;
