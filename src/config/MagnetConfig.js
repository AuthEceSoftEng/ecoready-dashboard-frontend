export const organization = "magnet_data";

const attributes = ["key", "indicator", "score", "risk_level"];

const createCountryFilter = (country) => [{
	property_name: "key",
	operator: "eq",
	property_value: country,
}];

export const magnetConfigs = (countryKeys, indicatorKey = null) => {
	// Common configuration
	const baseConfig = {
		project: "magnetdata",
		collection: "magnet_data",
		type: "data",
	};

	const indicatorFilter = indicatorKey ? [{
		property_name: "indicator",
		operator: "eq",
		property_value: indicatorKey,
	}] : [];

	// Data metrics configuration
	const dataConfig = countryKeys && countryKeys.length > 0
		? countryKeys.map((country) => ({
			...baseConfig,
			params: JSON.stringify({
				attributes,
				filters: createCountryFilter(country),
			}),
			plotId: `metrics_${country}`,
		})) : [];

	// Add indicator-specific config only if indicatorKey is provided
	if (indicatorKey) {
		dataConfig.push({
			...baseConfig,
			params: JSON.stringify({
				attributes,
				filters: [...createCountryFilter(countryKeys[0]), ...indicatorFilter],
			}),
			plotId: "indicators",
		});
	}

	return dataConfig;
};

