export const organization = "magnet_data";

export const magnetConfigs = (countryKey, indicatorKey = null) => {
	// Common configuration
	const baseConfig = {
		project: "magnetdata",
		collection: "magnet_data",
		type: "data",
	};

	// Country filter applied to all queries
	const countryFilter = countryKey === "EU" ? [] : [
		{
			property_name: "key",
			operator: "eq",
			property_value: countryKey,
		},
	];
	const indicatorFilter = [
		{
			property_name: "indicator",
			operator: "eq",
			property_value: indicatorKey,
		},
	];

	// Data metrics configuration
	const dataConfig = [{
		...baseConfig,
		params: JSON.stringify({
			attributes: ["key", "indicator", "score", "risk_level"],
			filters: countryFilter,
		}),
		plotId: "metrics",
	},
	{
		...baseConfig,
		params: JSON.stringify({
			attributes: ["key", "indicator", "score", "risk_level"],
			filters: indicatorFilter,
		}),
		plotId: "indicators",
	}];

	// Return all configurations
	return dataConfig;
};

