export	const organization = "seco_collab";

const secoConfigs = (formattedBeginningOfMonth, formattedBeginningOfDay, currentDate) => [
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
	{
		type: "stats",
		project: "seco_collab_project",
		collection: "environmental_data",
		params: JSON.stringify({
			attribute: ["m_temp01"],
			stat: "max",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "monthMaxTemperature",
	},
	{
		type: "stats",
		project: "seco_collab_project",
		collection: "environmental_data",
		params: JSON.stringify({
			attribute: ["m_hum01"],
			stat: "max",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "monthMaxHumidity",
	},
	{
		type: "stats",
		project: "seco_collab_project",
		collection: "environmental_data",
		params: JSON.stringify({
			attribute: ["a_co2"],
			stat: "max",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "monthMaxCo2",
	},
	{
		type: "stats",
		project: "seco_collab_project",
		collection: "environmental_data",
		params: JSON.stringify({
			attribute: ["m_temp01"],
			stat: "min",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "monthMinTemperature",
	},
	{
		type: "stats",
		project: "seco_collab_project",
		collection: "environmental_data",
		params: JSON.stringify({
			attribute: ["m_hum01"],
			stat: "min",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "monthMinHumidity",
	},
	{
		type: "stats",
		project: "seco_collab_project",
		collection: "environmental_data",
		params: JSON.stringify({
			attribute: ["a_co2"],
			stat: "min",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "monthMinCo2",
	},
];

export default secoConfigs;
