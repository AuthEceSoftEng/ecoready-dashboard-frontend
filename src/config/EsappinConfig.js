export const organization = "esappin";

const esappinConfigs = (product, month) => {
	// Pad month with zero if needed (1->01, 12->12)
	const paddedMonth = String(month).padStart(2, "0");
	const yearMonth = `2024-${paddedMonth}`;

	// Get last day (month is already 1-based)
	const lastDay = new Date(2024, month, 0).getDate();

	return [{
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
					property_value: `${yearMonth}-01`,
				},
				{
					property_name: "timestamp",
					operator: "lte",
					property_value: `${yearMonth}-${lastDay}`,
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
			start_time: `${yearMonth}-01`,
			end_time: `${yearMonth}-${lastDay}`,
			// filters: [{
			// 	property_name: "key",
			// 	operator: "eq",
			// 	property_value: product,
			// }],
			group_by: "key",
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
			start_time: `${yearMonth}-01`,
			end_time: `${yearMonth}-${lastDay}`,
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
			start_time: `${yearMonth}-01`,
			end_time: `${yearMonth}-${lastDay}`,
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
			start_time: `${yearMonth}-01`,
			end_time: `${yearMonth}-${lastDay}`,
			filters: [{
				property_name: "key",
				operator: "eq",
				property_value: product,
			}],
			group_by: "key",
		}),
		plotId: "minMinTemperature",
	}];
};

export default esappinConfigs;
