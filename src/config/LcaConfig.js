const lcaConfigs = (ll, category) => [
	{
		type: "data",
		project: "lca",
		collection: "lca_data",
		params: JSON.stringify({
			attributes: ["reference", "name", "type", `${ll}`, "unit"],
			filters: [
				{
					property_name: "name",
					operator: "eq",
					property_value: category,
				},
			],
		}),
		plotId: "lca_overview",
	},
	{
		type: "data",
		project: "lca",
		collection: "lca_data",
		params: JSON.stringify({
			attributes: ["name", "type", `${ll}`],
			filters: [
				{
					property_name: "reference",
					operator: "eq",
					property_value: category,
				},
			],
		}),
		plotId: "lca_pies",
	},
];

export default lcaConfigs;
