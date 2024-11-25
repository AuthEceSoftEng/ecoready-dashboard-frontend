export const organization = "esappin";

const esappinConfigs = (product, month) => {
	// Pad month with zero if needed (1->01, 12->12)
	const paddedMonth = String(month).padStart(2, "0");
	const yearMonth = `2024-${paddedMonth}`;

	// Get last day (month is already 1-based)
	const lastDay = new Date(2024, month, 0).getDate();
	console.log("Last day", lastDay);

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
	}];
};

export default esappinConfigs;
