import { Grid, Typography } from "@mui/material";
import { memo, useRef, useMemo, useState, useCallback } from "react";
import { object } from "prop-types";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import useInit from "../utils/screen-init.js";
import Footer from "../components/Footer.js";
import concatConfigs, { organization, sites } from "../config/ConcatConfig.js";
import { debounce, calculateDates } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, StickyBand, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";

const currentYear = new Date().getFullYear();
const weatherMetricList = {
	Temperature: { attribute: ["t_max", "t_avg", "t_min"], yaxis: "Temperature (°C)" },
	Precipitation: { attribute: "p", yaxis: "Precipitation (mm)" },
	"Solar Radiation": { attribute: "sr", yaxis: "Solar Radiation (W/m²)" },
};

const CONCATLL = () => {
	const [locations, setLocations] = useState({
		location1: "La Tallada",
		location2: "La Tallada", 
		location3: "La Tallada"
	});
	const [weatherMetric, setWeatherMetric] = useState("Temperature");
	const [year, setYear] = useState(currentYear);
	const [startDate, setStartDate] = useState("2014-01-01");
	const [endDate, setEndDate] = useState("2015-01-01");

	const handleLocationChange = useCallback((event) => {
		setLocations((prevLocations) => ({
			...prevLocations,
			[event.target.name]: event.target.value,
		}));
	}, []);

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 2000),
		[],
	);

	const handleDateChange = useCallback((newValue, setter) => {
		if (!newValue?.$d) return;

		// Immediate visual feedback
		setter(newValue.$d);
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	const handleYearChange = useCallback((newValue) => {
		setYear(newValue.$y);
	}, []);

	const dropdownContent = useMemo(() => [
		{
			id: "location",
			size: "small",
			label: "Select Location",
			items: sites,
			value: locations.location2,
			onChange: handleLocationChange,
		},
		{
			id: "weather",
			size: "small",
			label: "Select Metric",
			items: Object.keys(weatherMetricList).map((key) => ({ value: key, text: key })),
			value: weatherMetric,
			onChange: (event) => setWeatherMetric(event.target.value),
		},
	], [handleLocationChange, locations.location2, weatherMetric]);

	const formRefDateRange = useRef();
	const formContentDateRange = useMemo(() => [
		{
			customType: "date-range",
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			labelSize: 12,
			minDate: new Date("2007-01-01"),
			maxDate: new Date(`${currentYear}-01-01`),
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [startDate, endDate, handleDateChange]);

	const formRefDate = useRef();

	const formContentDate = useMemo(() => [
		{
			customType: "date-picker",
			id: "yearPicker",
			width: "170px",
			sublabel: "Select Year",
			views: ["year"],
			value: year,
			minDate: new Date("2007-01-01"),
			maxDate: new Date(`${year}-12-31`),
			labelSize: 12,
			onChange: handleYearChange,
		},
	], [handleYearChange, year]);

	// const stationNameKey = findKeyByText(REGIONS, stationName);
	const fetchConfigs = useMemo(
		() => (concatConfigs(locations.location2, startDate, endDate, year)),
		[endDate, locations.location2, startDate, year],

	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	console.log(dataSets);
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
	const isValidData = useMemo(() => metrics.length > 0, [metrics]);

	const weatherData = useMemo(() => {
		if (!isValidData) return [];

		if (weatherMetric === "Temperature") {
			return [
				{
					title: "Temperature Evolution Per Day",
					data: [
						{
							x: metrics.map((item) => item.timestamp),
							y: metrics.map((item) => item.t_avg),
							type: "scatter",
							mode: "lines",
							name: "Average Temperature",
							color: "secondary",
						},
						{
							x: metrics.map((item) => item.timestamp),
							y: metrics.map((item) => item.t_max),
							type: "scatter",
							mode: "lines",
							name: "Maximum Temperature",
							color: "primary",
						},
						{
							x: metrics.map((item) => item.timestamp),
							y: metrics.map((item) => item.t_min),
							type: "scatter",
							mode: "lines",
							name: "Minimum Temperature",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: weatherMetricList[weatherMetric].yaxis },
				},
			];
		}

		// For other metrics (Precipitation, Solar Radiation)
		const attribute = weatherMetricList[weatherMetric].attribute;
		return [
			{
				title: `${weatherMetric} Evolution Per Day`,
				data: [
					{
						x: metrics.map((item) => item.timestamp),
						y: metrics.map((item) => item[attribute]),
						type: "scatter",
						mode: "lines",
						name: weatherMetric,
						color: weatherMetric === "Precipitation" ? "third" : "goldenrod",
					},
				],
				xaxis: { title: "Days" },
				yaxis: { title: weatherMetricList[weatherMetric].yaxis },
			},
		];
	}, [metrics, weatherMetric, isValidData]);

	// const productionPerYear = useMemo(() => {


	//= ============== RENDERING ===============

	return (
		<Grid container spacing={2} justifyContent="center" alignItems="center">
			<Grid item xs={12} sm={12} md={12}>
				<Card title="Production Per Year" footer={cardFooter({ minutesAgo })}>
					<StickyBand
						sticky={false}
						dropdownContent={[dropdownContent[0]]}
						formRef={formRefDateRange}
						formContent={formContentDateRange}
					/>
					{/* {isLoading ? (
						<LoadingIndicator />
					) : (
						isValidData ? weatherData.map((chart, index) => (
							<Plot
								key={index}
								scrollZoom
								height="400px"
								data={chart.data}
								title={chart.title}
								xaxis={chart.xaxis}
								yaxis={chart.yaxis}
							/>
						)) : (<DataWarning message="No data available for the selected options." />
						)
					)} */}
				</Card>
			</Grid>
			<Grid item xs={12} sm={12} md={12}>
				<Card title="Weather Metrics" footer={cardFooter({ minutesAgo })}>
					<StickyBand
						sticky={false}
						dropdownContent={dropdownContent}
						formRef={formRefDateRange}
						formContent={formContentDateRange}
					/>
					{isLoading ? (
						<LoadingIndicator />
					) : (
						isValidData ? weatherData.map((chart, index) => (
							<Plot
								key={index}
								scrollZoom
								height="400px"
								data={chart.data}
								title={chart.title}
								xaxis={chart.xaxis}
								yaxis={chart.yaxis}
							/>
						)) : (<DataWarning message="No data available for the selected options." />
						)
					)}
				</Card>
			</Grid>
			<Footer
				sticky
				customImages={[
					{
						src: "../ll_images/CONCATLL.png",
						alt: "CONCATLL Logo",
						link: { url: "https://www.irta.cat/en/noticia/concat-ll-project-starts-development-phase/", target: "_blank", rel: "noopener" },
					},
					{
						src: "../ll_images/IRTA.png",
						alt: "IRTA Logo",
						link: { url: "https://www.irta.cat/en/", target: "_blank", rel: "noopener" },
					},

				]}
				customMessage={(
					<>
						<Typography component="span" sx={{ fontWeight: "bold", fontSize: "0.975rem" }}>
							{"Disclaimer:"}
						</Typography>
						{" "}
						{"These materials have been generated using the CONCAT Wheat Production Dataset developed by IRTA. Each wheat variety has been anonymized using a unique numerical identifier. Users requiring the actual variety names may request this information from the dataset authors (marta.dasilva@irta.cat)."}
						<br />
					</>
				)}
				showDefaultCopyright={false}
			/>
		</Grid>
	);
};

export default memo(CONCATLL);
