export const organization = "esappin";

const esappinConfigs = (product, startDate, endDate) => [{
	type: "data",
	project: "esappin_project",
	collection: "metrics",
	params: JSON.stringify({
		attributes: [
			"key",
			"timestamp",
			"max_temperature",
			"min_temperature",
			"precipitation_sum",
			"shortwave_radiation_sum",
		],
		filters: [
			{
				property_name: "key",
				operator: "eq",
				property_value: product,
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
	project: "esappin_project",
	collection: "metrics",
	params: JSON.stringify({
		attribute: ["precipitation_sum"],
		stat: "sum",
		interval: "every_1_months",
		start_time: startDate,
		end_time: endDate,
		// filters: [{
		// 	property_name: "key",
		// 	operator: "eq",
		// 	property_value: product,
		// }],
		// group_by: "key",
	}),
	plotId: "precipitationSum",
},
{
	type: "stats",
	project: "esappin_project",
	collection: "metrics",
	params: JSON.stringify({
		attribute: ["shortwave_radiation_sum"],
		stat: "sum",
		interval: "every_1_months",
		start_time: startDate,
		end_time: endDate,
		filters: [{
			property_name: "key",
			operator: "eq",
			property_value: product,
		}],
		group_by: "key",
	}),
	plotId: "shortwaveRadiationSum",
},
{
	type: "stats",
	project: "esappin_project",
	collection: "metrics",
	params: JSON.stringify({
		attribute: ["max_temperature"],
		stat: "max",
		interval: "every_1_months",
		start_time: startDate,
		end_time: endDate,
		filters: [{
			property_name: "key",
			operator: "eq",
			property_value: product,
		}],
		group_by: "key",
	}),
	plotId: "maxMaxTemperature",
},
{
	type: "stats",
	project: "esappin_project",
	collection: "metrics",
	params: JSON.stringify({
		attribute: ["min_temperature"],
		stat: "min",
		interval: "every_1_months",
		start_time: startDate,
		end_time: endDate,
		filters: [{
			property_name: "key",
			operator: "eq",
			property_value: product,
		}],
		group_by: "key",
	}),
	plotId: "minMinTemperature",
}];

export default esappinConfigs;
