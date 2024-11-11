export	const organization = "ecovitall";

export const ecoVitallConfigs = (formattedBeginningOfMonth, currentDate, 
	formattedBeginningOfHour, oneHourLater) => [
	{
		type: "stats",
		project: "ecovitall_project",
		collection: "enviromental_data",
		params: JSON.stringify({
			attribute: ["envtemp"],
			stat: "avg",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "tankLevel",
	},
	{
		type: "stats",
		project: "ecovitall_project",
		collection: "enviromental_data",
		params: JSON.stringify({
			attribute: ["humidity"],
			stat: "max",
			interval: "every_1_days",
			start_time: `${formattedBeginningOfMonth}`,
			end_time: `${currentDate}`,
		}),
		plotId: "ec",
	},
];
const randomDataGauge = {
	nutrientPH: {
		min: 0,
		max: 14,
		symbol: "pH",
		title: "Nutrient pH",
	},
	nutrientEC: {
		min: 0,
		max: 5,
		symbol: "mS",
		title: "Nutrient EC",
	},
	phTarget: {
		min: 0,
		max: 14,
		value: 5.9,
		symbol: "",
		title: "pH Target",
	},
	ecTarget: {
		min: 0,
		max: 5,
		value: 2.25,
		symbol: "",
		title: "EC Target",
	},
	nutrientTank: {
		min: 0,
		max: 100,
		symbol: "%",
		title: "Nutrient Tank",
	},
	nutrientTemperature: {
		min: 0,
		max: 40,
		symbol: "°C",
		title: "Nutrient Temperature",
	},
	roomTemperature1: {
		min: 0,
		max: 40,
		symbol: "°C",
		title: "Room Temperature 1",
	},
	roomTemperature2: {
		min: 0,
		max: 40,
		symbol: "°C",
		title: "Room Temperature 2",
	},
};

export const randomDataRadial = {
	"Romain Lettuce": {
		Color: Math.random(),
		"Leaf Shape": Math.random(),
		Crunchiness: Math.random(),
		Tenderness: Math.random(),
		Bitterness: Math.random(),
		Sweetness: Math.random(),
		Umami: Math.random(),
		Freshness: Math.random(),
		Aftertaste: Math.random(),
	},
	"Butterhead Lettuce": {
		Color: Math.random(),
		"Leaf Shape": Math.random(),
		Crunchiness: Math.random(),
		Tenderness: Math.random(),
		Bitterness: Math.random(),
		Sweetness: Math.random(),
		Umami: Math.random(),
		Freshness: Math.random(),
		Aftertaste: Math.random(),
	},
	"Oak Leaf Lettuce": {
		Color: Math.random(),
		"Leaf Shape": Math.random(),
		Crunchiness: Math.random(),
		Tenderness: Math.random(),
		Bitterness: Math.random(),
		Sweetness: Math.random(),
		Umami: Math.random(),
		Freshness: Math.random(),
		Aftertaste: Math.random(),
	},
};

export default randomDataGauge;
