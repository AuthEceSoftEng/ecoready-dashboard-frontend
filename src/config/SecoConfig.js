export	const organization = "seco_collab";

const secoConfigs = (formattedBeginningOfDay, currentDate) => [
	{
		type: "data",
		project: "seco_collab_project",
		collection: "environmental_data",
		params: JSON.stringify({
			attributes: ["timestamp", "m_temp01", "m_hum01", "a_co2"],
			order_by: {
				field: "timestamp",
				order: "asc",
			},
		}),
		plotId: "overview",
	},
	{
		type: "stats",
		project: "seco_collab_project",
		collection: "environmental_data",
		params: JSON.stringify({
			attribute: ["m_temp01"],
			stat: "avg",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfDay}`,
			end_time: `${currentDate}`,
		}),
		plotId: "todayTemperature",
	},
	{
		type: "stats",
		project: "seco_collab_project",
		collection: "environmental_data",
		params: JSON.stringify({
			attribute: ["m_hum01"],
			stat: "avg",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfDay}`,
			end_time: `${currentDate}`,
		}),
		plotId: "todayHumidity",
	},
	{
		type: "stats",
		project: "seco_collab_project",
		collection: "environmental_data",
		params: JSON.stringify({
			attribute: ["a_co2"],
			stat: "avg",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfDay}`,
			end_time: `${currentDate}`,
		}),
		plotId: "todayCo2",
	},
// 	{
// 		type: "data",
// 		project: "seco_collab_project",
// 		collection: "environmental_data",
// 		params: JSON.stringify({
// 			attributes: ["timestamp", "temperature"],
// 			filters: [
// 				{
// 					property_name: "timestamp",
// 					operator: "gte",
// 					property_value: "2024-06-01",
// 				},
// 				{
// 					property_name: "timestamp",
// 					operator: "lt",
// 					property_value: "2024-07-01",
// 				},
// 			],
// 			order_by: {
// 				field: "timestamp",
// 				order: "asc",
// 			},
// 		}),
// 		plotId: "temperature_june",
// 	},
// 	{
// 		type: "data",
// 		project: "seco_collab_project",
// 		collection: "environmental_data",
// 		params: JSON.stringify({
// 			attributes: ["timestamp", "temperature"],
// 			filters: [
// 				{
// 					property_name: "timestamp",
// 					operator: "gte",
// 					property_value: "2024-07-01",
// 				},
// 				{
// 					property_name: "timestamp",
// 					operator: "lt",
// 					property_value: "2024-08-01",
// 				},
// 			],
// 		}),
// 		plotId: "temperature_july",
// 	},
// 	{
// 		type: "data",
// 		project: "seco_collab_project",
// 		collection: "environmental_data",
// 		params: JSON.stringify({
// 			attributes: ["timestamp", "temperature"],
// 			filters: [
// 				{
// 					property_name: "timestamp",
// 					operator: "gte",
// 					property_value: "2024-08-01",
// 				},
// 				{
// 					property_name: "timestamp",
// 					operator: "lt",
// 					property_value: "2024-09-01",
// 				},
// 			],
// 		}),
// 		plotId: "temperature_august",
// 	},
// 	{
// 		type: "stats",
// 		project: "seco_collab_project",
// 		collection: "environmental_data",
// 		params: JSON.stringify({
// 			attribute: ["soil_moisture"],
// 			stat: "max",
// 			interval: "every_1_days",
// 			start_time: `${formattedBeginningOfMonth}`,
// 			end_time: `${currentDate}`,
// 		}),
// 		plotId: "soilMoisture",
// 	},
// 	{
// 		type: "stats",
// 		project: "seco_collab_project",
// 		collection: "environmental_data",
// 		params: JSON.stringify({
// 			attribute: ["humidity"],
// 			stat: "max",
// 			interval: "every_1_days",
// 			start_time: `${formattedBeginningOfMonth}`,
// 			end_time: `${currentDate}`,
// 		}),
// 		plotId: "humidity",
// 	},
// 	{
// 		type: "stats",
// 		project: "seco_collab_project",
// 		collection: "environmental_data",
// 		params: JSON.stringify({
// 			attribute: ["precipitation"],
// 			stat: "avg",
// 			interval: "every_7_days",
// 			start_time: `${formattedBeginningOfMonth}`,
// 			end_time: `${currentDate}`,
// 		}),
// 		plotId: "precipitation",
// 	},
// 	{
// 		type: "stats",
// 		project: "seco_collab_project",
// 		collection: "environmental_data",
// 		params: JSON.stringify({
// 			attribute: ["soil_quality"],
// 			stat: "avg",
// 			interval: "every_1_months",
// 		}),
// 		plotId: "soilQuality",
// 	},
// 	// Additional configurations as needed
];

export default secoConfigs;
