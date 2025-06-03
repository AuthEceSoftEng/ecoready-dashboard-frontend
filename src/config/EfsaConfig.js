export	const organization = "efsa";

const efsaConfigs = (year) => [

	{
		type: "data",
		project: "efsaproject",
		collection: "efsadata",
		params: JSON.stringify({
			attributes: [
				"timestamp", "key", "param",
				"resval", "resunit", "resloq",
				"origcountry",
			],
			filters: [
				// {
				// 	property_name: "station_name",
				// 	operator: "eq",
				// 	property_value: stationName,
				// },
				{
					property_name: "timestamp",
					operator: "gte",
					property_value: `${year}-01-01`,
				},
				{
					property_name: "timestamp",
					operator: "lte",
					property_value: `${year}-12-31`,
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
export default efsaConfigs;
