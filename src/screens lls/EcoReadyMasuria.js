import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import StickyBand from "../components/StickyBand.js";
import useInit from "../utils/screen-init.js";
import ecoReadyMasuriaConfigs, { organization, REGIONS } from "../config/EcoReadyMasuriaConfig.js";
import lcaConfigs from "../config/LcaConfig.js";
import { findKeyByText, groupByKey } from "../utils/data-handling-functions.js";
import { cardFooter, DataWarning, LoadingIndicator } from "../utils/rendering-items.js";
import { LCA_INDICATORS } from "../utils/useful-constants.js";

const categoryLabels = LCA_INDICATORS.map((item) => item.label);

const EcoReadyMasuria = () => {
	const [year, setYear] = useState("2014");
	const [stationName, setStationName] = useState(REGIONS[0]);
	const [category, setCategory] = useState(categoryLabels[0]);

	const handleYearChange = useCallback((newValue) => {
		setYear(newValue.$y);
	}, []);

	const handleStationChange = useCallback((event) => {
		const selectedStation = findKeyByText(REGIONS, event.target.value, true);
		if (selectedStation) {
			setStationName(selectedStation);
		}
	}, []);

	const dropdownContent = useMemo(() => ({
		id: "station name",
		size: "small",
		label: "Select Weather Station",
		items: REGIONS,
		value: stationName.text,
		onChange: handleStationChange,
	}), [handleStationChange, stationName]);

	const categoryDropdown = useMemo(() => ({
		id: "category-dropdown",
		label: "Select Category",
		items: categoryLabels,
		value: category,
		subheader: true,
		onChange: (event) => setCategory(event.target.value),
	}), [category]);

	const dropdownArrays = useMemo(() => [dropdownContent, categoryDropdown], [categoryDropdown, dropdownContent]);

	// const formRefDate = useRef();

	const formContentDate = useMemo(() => [
		{
			customType: "date-picker",
			id: "yearPicker",
			width: "170px",
			sublabel: "Select Year",
			views: ["year"],
			value: year,
			minDate: new Date("2001-01-01"),
			maxDate: new Date("2015-12-31"),
			labelSize: 12,
			onChange: handleYearChange,
		},
	], [handleYearChange, year]);

	const fetchConfigs = useMemo(
		() => (year ? ecoReadyMasuriaConfigs(stationName.value, year) : null),
		[stationName.value, year],
	);

	const lcaConfigsData = useMemo(() => lcaConfigs(organization, category), [category]);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;

	const { state: lcaState } = useInit("lca", lcaConfigsData);
	const { isLoading: isLcaLoading, dataSets: lcaDataSets } = lcaState;
	console.log("LCA Data Sets:", lcaDataSets);

	const overviewValues = lcaDataSets.lca_overview?.[0] ? {
		totalValue: Number.parseFloat(lcaDataSets.lca_overview[0][organization] || 0),
		unit: lcaDataSets.lca_overview[0].unit || "",
	} : null;
	console.log("LCA Total Value:", overviewValues);

	const lcaDataGrouped = useMemo(() => {
		if (isLcaLoading || !lcaDataSets) return null;
		const lcaData = lcaDataSets.lca_pies || [];
		return groupByKey(lcaData, "type");
	}, [isLcaLoading, lcaDataSets]);

	const lcaValuesByType = useMemo(() => {
		if (!lcaDataGrouped) return {};

		const result = {};

		for (const [type, items] of Object.entries(lcaDataGrouped)
			.filter(([type, _]) => type !== "Subcategory")) {
			result[type] = {
				names: items.map((item) => item.name),
				values: items
					.map((item) => Number.parseFloat(item.ecoready_masuria || 0)),
			};
		}

		return result;
	}, [lcaDataGrouped]);

	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
	const isValidData = useMemo(() => metrics.length > 0, [metrics]);

	// Pre-compute data transformations
	const chartData = useMemo(() => {
		if (metrics.length === 0) {
			return {
				timestamps: [],
				maxTemp: [],
				meanTemp: [],
				minTemp: [],
				groundTemp: [],
				precipitation: [],
				snowHeight: [],
			};
		}

		const timestamps = [];
		const maxTemp = [];
		const meanTemp = [];
		const minTemp = [];
		const groundTemp = [];
		const precipitation = [];
		const snowHeight = [];

		for (const item of metrics) {
			timestamps.push(item.timestamp);
			maxTemp.push(item.maximum_daily_temperature);
			meanTemp.push(item.average_daily_temperature);
			minTemp.push(item.minimum_daily_temperature);
			groundTemp.push(item.minimum_ground_temperature);
			precipitation.push(item.daily_precipitation_sum);
			snowHeight.push(item.snow_cover_height);
		}

		return { timestamps, maxTemp, meanTemp, minTemp, groundTemp, precipitation, snowHeight };
	}, [metrics]);

	const charts = useMemo(() => [
		{
			title: "Daily Temperature Evolution",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.maxTemp,
					type: "scatter",
					mode: "lines+markers",
					title: "Max",
					color: "primary",
				},
				{
					x: chartData.timestamps,
					y: chartData.meanTemp,
					type: "scatter",
					mode: "lines+markers",
					title: "Avg",
					color: "secondary",
				},
				{
					x: chartData.timestamps,
					y: chartData.minTemp,
					type: "scatter",
					mode: "lines+markers",
					title: "Min",
					color: "third",
				},
			],
			yaxis: { title: "Temperature (°C)" },
		},
		{
			title: "Daily Minimum Ground Temperature",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.groundTemp,
					type: "bar",
					color: "third",
				},
			],
			yaxis: { title: "Temperature (°C)" },
		},
		{
			title: "Daily Precipitation Sum",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.precipitation,
					type: "bar",
					color: "primary",
				},
			],
			yaxis: { title: "Precipitation (mm)" },
		},
		{
			title: "Daily Snow Cover Height",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.snowHeight,
					type: "bar",
					color: "blue",
				},
			],
			yaxis: { title: "Snow Height (cm)" },
		},
	], [chartData]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={dropdownArrays} formContent={formContentDate} />

			{/* Chart Cards - Always render, with conditional content, mb={index === charts.length - 1 ? 2 : 0} */}
			{charts.map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={6}>
					<Card
						title={card.title}
						footer={!isLoading && isValidData ? cardFooter({ minutesAgo }) : undefined}
					>
						{isLoading ? (<LoadingIndicator minHeight="300px" />
						) : isValidData ? (
							<Plot
								scrollZoom
								data={card.data}
								showLegend={index === 0}
								height="300px"
								yaxis={card.yaxis}
							/>
						) : (
							<DataWarning minHeight="300px" />
						)}
					</Card>
				</Grid>
			))}
			{/* LCA Cards */}
			<Grid item xs={12} sm={12} md={12} mb={2}>
				<Card
					title={`Barley LCA - ${category}`}
					footer={isLcaLoading ? undefined : cardFooter({ minutesAgo })}
				>
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

export default memo(EcoReadyMasuria);
