// import { calculateDifferenceBetweenDates } from "../utils/data-handling-functions.js";

export	const organization = "ecoready_masuria";

const ecoReadyMasuriaConfigs = (stationName, year) => [
// const daysBetween = calculateDifferenceBetweenDates(formattedBeginningOfMonth, formattedBeginningOfHour);

	{
		type: "data",
		project: "ecoready_masuria_project",
		collection: "weather_data",
		params: JSON.stringify({
			attributes: [
				"timestamp", "station_name", "maximum_daily_temperature",
				"minimum_daily_temperature", "average_daily_temperature",
				"minimum_ground_temperature", "daily_precipitation_sum",
				"snow_cover_height",
			],
			filters: [
				{
					property_name: "station_name",
					operator: "eq",
					property_value: stationName,
				},
				{
					property_name: "timestamp",
					operator: "gte",
					property_value: `${year}-01-01`,
				},
				{
					property_name: "timestamp",
					operator: "lte",
					property_value: `${year}-01-31`,
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
export default ecoReadyMasuriaConfigs;
