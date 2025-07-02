export	const organization = "agrolab";

const agroConfigs = (formattedBeginningOfMonth, currentDate) => [
	{
		type: "data",
		project: "wheat",
		collection: "crop_yield_data",
		params: JSON.stringify({
			attributes: ["key", "crop_yield"],
		}),
		plotId: "cropYield",
	},
	{
		type: "data",
		project: "wheat",
		collection: "irrigation_data",
		params: JSON.stringify({
			attributes: ["timestamp", "irrigation"],
			filters: [
				{
					property_name: "timestamp",
					operator: "gte",
					property_value: `${formattedBeginningOfMonth}`,
				},
				{
					property_name: "timestamp",
					operator: "lte",
					property_value: `${currentDate}`,
				},
			],
		}),
		plotId: "irrigation",
	},
	{
		type: "data",
		project: "wheat",
		collection: "sensor_iot_data",
		params: JSON.stringify({
			attributes: ["timestamp", "temperature"],
			filters: [
				{
					property_name: "timestamp",
					operator: "eq",
					property_value: "2024-01-01",
				},
			],
			// order_by: {
			// 	field: "timestamp",
			// 	order: "asc",
			// },
		}),
		plotId: "temperature_now",
	},
	{
		type: "stats",
		project: "wheat",
		collection: "crop_yield_data",
		params: JSON.stringify({
			attribute: ["crop_yield"],
			stat: "sum",
			interval: "every_7_days",
			start_time: "2024-09-01",
			end_time: "2024-10-01",
		}),
		plotId: "yieldDistribution",
	},
	{
		type: "data",
		project: "wheat",
		collection: "sensor_iot_data",
		params: JSON.stringify({
			attributes: ["timestamp", "temperature"],
			filters: [
				{
					property_name: "timestamp",
					operator: "gte",
					property_value: "2024-06-01",
				},
				{
					property_name: "timestamp",
					operator: "lt",
					property_value: "2024-07-01",
				},
			],
			order_by: {
				field: "timestamp",
				order: "asc",
			},
		}),
		plotId: "temperature_june",
	},
	{
		type: "data",
		project: "wheat",
		collection: "sensor_iot_data",
		params: JSON.stringify({
			attributes: ["timestamp", "temperature"],
			filters: [
				{
					property_name: "timestamp",
					operator: "gte",
					property_value: "2024-07-01",
				},
				{
					property_name: "timestamp",
					operator: "lt",
					property_value: "2024-08-01",
				},
			],
			// order_by: {
			// 	field: "timestamp",
			// 	order: "asc",
			// },
		}),
		plotId: "temperature_july",
	},
	{
		type: "data",
		project: "wheat",
		collection: "sensor_iot_data",
		params: JSON.stringify({
			attributes: ["timestamp", "temperature"],
			filters: [
				{
					property_name: "timestamp",
					operator: "gte",
					property_value: "2024-08-01",
				},
				{
					property_name: "timestamp",
					operator: "lt",
					property_value: "2024-09-01",
				},
			],
			// order_by: {
			// 	field: "timestamp",
			// 	order: "asc",
			// },
		}),
		plotId: "temperature_august",
	},
	{
		type: "stats",
		project: "wheat",
		collection: "sensor_iot_data",
		params: JSON.stringify({
			attribute: ["soil_moisture"],
			stat: "max",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "soilMoisture",
	},
	{
		type: "stats",
		project: "wheat",
		collection: "sensor_iot_data",
		params: JSON.stringify({
			attribute: ["humidity"],
			stat: "max",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
			// filters: [
			// 	{
			// 		property_name: "timestamp",
			// 		operator: "gte",
			// 		property_value: `${formattedBeginningOfMonth}`,
			// 	},
			// 	{
			// 		property_name: "timestamp",
			// 		operator: "lte",
			// 		property_value: `${currentDate}`,
			// 	},
			// ],
			// order_by: {
			// 	field: "timestamp",
			// 	order: "asc",
			// },
		}),
		plotId: "humidity",
	},
	{
		type: "stats",
		project: "wheat",
		collection: "sensor_iot_data",
		params: JSON.stringify({
			attribute: ["precipitation"],
			stat: "avg",
			interval: "every_7_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "precipitation",
	},
	{
		type: "stats",
		project: "wheat",
		collection: "sensor_iot_data",
		params: JSON.stringify({
			attribute: ["soil_quality"],
			stat: "avg",
			interval: "every_1_months",
			// filters: [
			// 	{
			// 		property_name: "soil_quality",
			// 		operator: "gte",
			// 		property_value: 0.2,
			// 	},
			// 	{
			// 		property_name: "soil_quality",
			// 		operator: "lte",
			// 		property_value: 0.8,
			// 	},
			// ],
			// order_by: {
			// 	field: "timestamp",
			// 	order: "asc",
			// },
		}),
		plotId: "soilQuality",
	},
	// Additional configurations as needed
];

export default agroConfigs;
