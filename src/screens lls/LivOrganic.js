import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
// import Dropdown from "../components/Dropdown.js";
import useInit from "../utils/screen-init.js";
import Form from "../components/Form.js";
import { organization, livOrganicConfigs } from "../config/LivOrganicConfig.js";
import { debounce, calculateDates, calculateDifferenceBetweenDates } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, LoadingIndicator } from "../utils/rendering-items.js";

const LivOrganic = () => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	// const [region, setRegion] = useState(null);

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 0), // Reduced from 2700ms to 800ms
		[],
	);

	const handleDateChange = useCallback((newValue, setter) => {
		if (!newValue?.$d) return;

		// Immediate visual feedback
		setter(newValue.$d);
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	const formRefDate = useRef();

	const formContentDate = useMemo(() => [
		{
			customType: "date-range",
			id: "dateRange",
			width: "170px",
			type: "desktop",
			label: "",
			startLabel: "Start date",
			endLabel: "End date",
			background: "primary",
			labelSize: 12,
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [handleDateChange]);

	const isValidDateRange = useMemo(() => startDate && endDate && new Date(startDate) <= new Date(endDate), [startDate, endDate]);

	const { differenceInDays } = calculateDifferenceBetweenDates(startDate, endDate);

	const fetchConfigs = useMemo(
		() => (isValidDateRange ? livOrganicConfigs(startDate, endDate, differenceInDays) : null),
		[isValidDateRange, startDate, endDate, differenceInDays],
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
			maxTemp: metrics.map((item) => item.max_temperature),
			meanTemp: metrics.map((item) => item.mean_temperature),
			minTemp: metrics.map((item) => item.min_temperature),
			windSpeed: metrics.map((item) => item.wind_speed),
			rain: metrics.map((item) => item.rain),
		};
	}, [metrics, isValidData]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid container display="flex" direction="row" justifyContent="flex-end" alignItems="center" mt={1} spacing={2}>
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} md={2}>
					<Form ref={formRefDate} content={formContentDate} />
				</Grid>
			</Grid>

			{/* <Grid item xs={12} md={12} alignItems="center" flexDirection="column" padding={0}>
				<Card title="Month's Overview" footer={cardFooter({ minutesAgo: state.minutesAgo })}>
					<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
						{[
							{
								data: {
									value: state.dataSets.maxMaxTemperature && state.dataSets.maxMaxTemperature.length > 0
										? state.dataSets.maxMaxTemperature[0].max_max_temperature
										: null,
									subtitle: "Max Temperature",
								},
								color: "goldenrod",
							},
							{
								data: {
									value: state.dataSets.minMinTemperature && state.dataSets.minMinTemperature.length > 0
										? state.dataSets.minMinTemperature[0].min_min_temperature
										: null,
									subtitle: "Min Temperature",
								},
								color: "third",
							},
						].map((plotData, index) => (
							<Grid key={index} item xs={12} sm={12} md={6} justifyContent="flex-end" alignItems="center" sx={{ height: "200px" }}>
								<Plot
									showLegend
									scrollZoom
									// width="220px"
									data={[
										{
											type: "indicator",
											mode: "gauge+number",
											value: plotData.data.value,
											range: [-35, 45], // Gauge range
											color: plotData.color, // Color of gauge bar
											shape: "angular", // "angular" or "bullet"
											indicator: "primary", // Color of gauge indicator/value-line
											textColor: "primary", // Color of gauge value
											suffix: "°C", // Suffix of gauge value
										},
									]}
									displayBar={false}
									title={plotData.data.subtitle}
								/>
							</Grid>
						))}
					</Grid>
				</Card>
			</Grid>
			{[
				{
					title: "Daily Temperature Evolution",
					data: [
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.max_temperature) : [],
							type: "scatter",
							mode: "lines+markers",
							title: "Max",
							color: "primary",
						},
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.min_temperature) : [],
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
					title: "Shortwave Radiation Sum",
					data: [
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.shortwave_radiation_sum) : [],
							type: "bar",
							color: "goldenrod",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Radiation Metric" },
				},
				{
					title: "Daily Precipitation Sum",
					data: [
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.precipitation_sum) : [],
							type: "bar",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Precipitation (mm)" },
				},
				{
					title: "Monthly Precipitation Per Field",
					data: [
						{
							labels: state.dataSets.precipitationSum
								? state.dataSets.precipitationSum.map((item) => item.key)
								: [],
							values: state.dataSets.precipitationSum
								? state.dataSets.precipitationSum.map((item) => item.sum_precipitation_sum)
								: [],
							type: "pie",
						},
					],
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={6}>
					<Card title={card.title} footer={cardFooter({ minutesAgo: state.minutesAgo })}>
						<Plot
							scrollZoom
							data={card.data}
							title={`${monthNames[month].text} ${year}`}
							showLegend={index === 0 || 3}
							height="300px"
							xaxis={card?.xaxis}
							yaxis={card?.yaxis}
						/>
					</Card>
				</Grid>
			))} */}
		</Grid>
	);
};

export default memo(LivOrganic);
