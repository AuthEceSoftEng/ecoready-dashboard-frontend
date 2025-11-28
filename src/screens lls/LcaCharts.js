import { Grid } from "@mui/material";
import { useState, useMemo, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import StickyBand from "../components/StickyBand.js";
import useInit from "../utils/screen-init.js";
import lcaConfigs from "../config/LcaConfig.js";
import { groupByKey } from "../utils/data-handling-functions.js";
import { cardFooter, DataWarning, LoadingIndicator } from "../utils/rendering-items.js";
import { LCA_INDICATORS } from "../utils/useful-constants.js";

const categoryLabels = LCA_INDICATORS.map((item) => item.label);
console.log("CATEGORY LABELS IN LCA CHARTS:", categoryLabels);

const LcaData = ({ organization, minutesAgo, additionalDropdown = null }) => {
	const [category, setCategory] = useState(categoryLabels[0]);

	const handleCategoryChange = useCallback((event) => {
		setCategory(event.target.value);
	}, []);

	const categoryDropdown = useMemo(() => ({
		id: "category-dropdown",
		label: "Select Category",
		items: categoryLabels,
		value: category,
		subheader: true,
		onChange: handleCategoryChange,
	}), [category, handleCategoryChange]);

	const dropdownContent = additionalDropdown ? [categoryDropdown, additionalDropdown] : [categoryDropdown];

	const lcaConfigsData = useMemo(() => lcaConfigs(organization, category), [category, organization]);
	console.log("LCA CONFIGS DATA:", lcaConfigsData);
	const { state: lcaState } = useInit("lca", lcaConfigsData);
	const { isLoading: isLcaLoading, dataSets: lcaDataSets } = lcaState;
	console.log("LCA DATA SETS:", lcaDataSets);

	const overviewValues = useMemo(() => {
		const overview = lcaDataSets.lca_overview?.[0];
		if (!overview) return null;

		return {
			totalValue: Number.parseFloat(overview[organization] || 0),
			unit: overview.unit || "",
		};
	}, [lcaDataSets.lca_overview, organization]);

	const lcaDataGrouped = useMemo(() => {
		if (isLcaLoading || !lcaDataSets) return null;
		const lcaData = lcaDataSets.lca_pies || [];
		return groupByKey(lcaData, "type");
	}, [isLcaLoading, lcaDataSets]);

	const lcaValuesByType = useMemo(() => {
		if (!lcaDataGrouped) return {};

		const result = {};

		const entries = Object.entries(lcaDataGrouped);

		for (const [type, items] of entries) {
			if (type === "Subcategory") continue;

			result[type] = {
				names: items.map((item) => item.name),
				values: items.map((item) => Number.parseFloat(item[organization] || 0)),
			};
		}

		return result;
	}, [lcaDataGrouped, organization]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1} mt={0.5}>
			{/* LCA Cards */}
			<Grid item xs={12} sm={12} md={12} mb={1}>
				<Card
					title={`Barley LCA - ${category}`}
					footer={isLcaLoading ? undefined : cardFooter({ minutesAgo })}
				>
					<StickyBand dropdownContent={dropdownContent} sticky={false} />

					<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>

						{Object.entries(lcaValuesByType).map(([type, { names, values }]) => (
							<Grid key={type} item xs={12} sm={6} md={6}>
								<Plot
									data={[
										{
											labels: names,
											values,
											type: "pie",
											title: type,
											hovertemplate: `%{label}<br>%{value} ${overviewValues?.unit || ""}<br>%{percent}<extra></extra>`,
										},
									]}
									title={type}
									height="400px"
								/>
							</Grid>
						))}
						{isLcaLoading && <LoadingIndicator minHeight="300px" />}
						{!isLcaLoading && Object.keys(lcaValuesByType).length === 0 && (
							<DataWarning minHeight="300px" />
						)}
					</Grid>
				</Card>
			</Grid>
		</Grid>
	);
};

export default LcaData;
