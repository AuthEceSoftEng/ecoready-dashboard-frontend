export const organization = "magnet_data";

export const magnetConfigs = (countryKey) => {
	// Common configuration
	const baseConfig = {
		project: "magnetdata",
		collection: "magnet_data",
	};

	// Country filter applied to all queries
	const countryFilter = [
		{
			property_name: "key",
			operator: "eq",
			property_value: countryKey,
		},
	];

	// Data metrics configuration
	const dataConfig = {
		...baseConfig,
		type: "data",
		params: JSON.stringify({
			attributes: ["key", "indicator", "score", "risk_level"],
			filters: countryFilter,
		}),
		plotId: "metrics",
	};

	// Return all configurations
	return [dataConfig];
};

