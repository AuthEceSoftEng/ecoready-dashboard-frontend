import { calculateDifferenceBetweenDates } from "../utils/data-handling-functions.js";

export	const organization = "ecovitall";

export const ecoVitallConfigs = (formattedBeginningOfMonth, currentDate, formattedBeginningOfHour) => {
	const daysBetween = calculateDifferenceBetweenDates(formattedBeginningOfMonth, formattedBeginningOfHour);
	console.log("Days between", daysBetween);
	return [
		{
			type: "stats",
			project: "ecovitall_project",
			collection: "environmental_data",
			params: JSON.stringify({
				attribute: ["envtemp"],
				stat: "avg",
				interval: "every_1_days",
				start_time: `${formattedBeginningOfMonth}`,
				end_time: `${formattedBeginningOfHour}`,
			}),
			plotId: "temperature",
		},
		{
			type: "stats",
			project: "ecovitall_project",
			collection: "environmental_data",
			params: JSON.stringify({
				attribute: ["humidity"],
				stat: "max",
				interval: "every_1_days",
				start_time: `${formattedBeginningOfMonth}`,
				end_time: `${formattedBeginningOfHour}`,
			}),
			plotId: "humidity_max",
		},
		{
			type: "stats",
			project: "ecovitall_project",
			collection: "environmental_data",
			params: JSON.stringify({
				attribute: ["humidity"],
				stat: "min",
				interval: "every_1_days",
				start_time: `${formattedBeginningOfMonth}`,
				end_time: `${formattedBeginningOfHour}`,
			}),
			plotId: "humidity_min",
		},
		{
			type: "stats",
			project: "ecovitall_project",
			collection: "environmental_data",
			params: JSON.stringify({
				attribute: ["ph"],
				stat: "avg",
				interval: `every_${Math.max(daysBetween, 1)}_days`,
				start_time: `${formattedBeginningOfMonth}`,
				end_time: `${formattedBeginningOfHour}`,
			}),
			plotId: "ph_avg",
		},
		{
			type: "stats",
			project: "ecovitall_project",
			collection: "environmental_data",
			params: JSON.stringify({
				attribute: ["ec"],
				stat: "avg",
				interval: `every_${Math.max(daysBetween, 1)}_days`,
				start_time: `${formattedBeginningOfMonth}`,
				end_time: `${formattedBeginningOfHour}`,
			}),
			plotId: "ec_avg",
		},
	];
};

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
