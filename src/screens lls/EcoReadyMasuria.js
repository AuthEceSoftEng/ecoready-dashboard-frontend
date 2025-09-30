import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import ecoReadyMasuriaConfigs, { organization } from "../config/EcoReadyMasuriaConfig.js";
import { findKeyByText } from "../utils/data-handling-functions.js";
import { cardFooter, StickyBand, DataWarning, LoadingIndicator } from "../utils/rendering-items.js";

const REGIONS = [
	{ value: "BEZEK", text: "Bezek" },
	{ value: "GRABIK", text: "Grabik" },
	{ value: "PRABUTY", text: "Prabuty" },
	{ value: "WARSZAWA-FILTRY", text: "Warszawa-Filtry" },
];

const EcoReadyMasuria = () => {
	const [year, setYear] = useState("2014");
	const [stationName, setStationName] = useState(REGIONS[0]);

	const handleYearChange = useCallback((newValue) => {
		setYear(newValue.$y);
	}, []);

	const handleStationChange = useCallback((event) => {
		const selectedStation = findKeyByText(REGIONS, event.target.value, true);
		if (selectedStation) {
			setStationName(selectedStation);
		}
	}, []);

	const dropdownContent = useMemo(() => [
		{
			id: "station name",
			size: "small",
			label: "Select Weather Station",
			items: REGIONS,
			value: stationName.text,
			onChange: handleStationChange,
		},
	], [handleStationChange, stationName]);

	const formRefDate = useRef();

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

	// const stationNameKey = findKeyByText(REGIONS, stationName);
	const fetchConfigs = useMemo(
		() => (year ? ecoReadyMasuriaConfigs(stationName.value, year) : null),
		[stationName.value, year],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
	const isValidData = useMemo(() => metrics.length > 0, [metrics]);

	// Pre-compute data transformations
	const chartData = useMemo(() => {
		if (!isValidData) return [];
		const timestamps = metrics.map((item) => item.timestamp);
		return {
			timestamps,
			maxTemp: metrics.map((item) => item.maximum_daily_temperature),
			meanTemp: metrics.map((item) => item.average_daily_temperature),
			minTemp: metrics.map((item) => item.minimum_daily_temperature),
			groundTemp: metrics.map((item) => item.minimum_ground_temperature),
			precipitation: metrics.map((item) => item.daily_precipitation_sum),
			snowHeight: metrics.map((item) => item.snow_cover_height),
		};
	}, [metrics, isValidData]);

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
			xaxis: { title: "Days" },
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
			xaxis: { title: "Days" },
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
			xaxis: { title: "Days" },
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
			xaxis: { title: "Days" },
			yaxis: { title: "Snow Height (cm)" },
		},
	], [chartData]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<StickyBand dropdownContent={dropdownContent} formRef={formRefDate} formContent={formContentDate} />

			{/* Chart Cards - Always render, with conditional content */}
			{charts.map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={6} mb={index === charts.length - 1 ? 2 : 0}>
					<Card
						title={card.title}
						footer={!isLoading && isValidData ? cardFooter({ minutesAgo }) : undefined}
					>
						{isLoading ? (<LoadingIndicator minHeight="300px" />
						) : isValidData ? (
							<Plot
								scrollZoom
								data={card.data}
								// title={`${monthNames[month].text} ${year}`}
								showLegend={index === 0}
								height="300px"
								xaxis={card.xaxis}
								yaxis={card.yaxis}
							/>
						) : (
							<DataWarning minHeight="300px" />
						)}
					</Card>
				</Grid>
			))}
		</Grid>
	);
};

export default memo(EcoReadyMasuria);
