import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import { organization, livOrganicConfigs } from "../config/LivOrganicConfig.js";
import { debounce, calculateDates, calculateDifferenceBetweenDates } from "../utils/data-handling-functions.js";
// import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, LoadingIndicator, StickyBand } from "../utils/rendering-items.js";

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
			minTemp: metrics.map((item) => item.min_temperature),
			solarRadiation: metrics.map((item) => item.solar_radiation),
			precipitation: metrics.map((item) => item.precipitation),
		};
	}, [metrics, isValidData]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<StickyBand formRef={formRefDate} formContent={formContentDate} />
			{[
				{
					title: "Temperature Evolution Per Day",
					data: [
						{
							x: isValidData ? chartData.timestamps : [],
							y: isValidData ? chartData.maxTemp : [],
							type: "bar",
							title: "Max",
							color: "secondary",
						},
						{
							x: isValidData ? chartData.timestamps : [],
							y: isValidData ? chartData.minTemp : [],
							type: "bar",
							title: "Min",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Temperature (°C)" },
				},
				{
					title: `${differenceInDays}-day Temperature Distribution`,
					data: [
						{
							y: isValidData ? chartData.maxTemp : [],
							type: "box",
							title: "Max	Temperature",
							color: "primary",
						},
						{
							y: isValidData ? chartData.meanTemp : [],
							type: "box",
							title: "Mean Temperature",
							color: "secondary",
						},
						{
							y: isValidData ? chartData.minTemp : [],
							type: "box",
							title: "Min Temperature",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Temperature (°C)" },
				},
				{
					title: "Wind Speed",
					data: [
						{
							x: isValidData ? chartData.timestamps : [],
							y: isValidData ? chartData.solarRadiation : [],
							type: "scatter",
							mode: "lines+markers",
							title: "Wind Speed",
							color: "primary",
						},
					],
					xaxis: { title: "Days" },
				// yaxis: { title: "Temperature (°C)" },
				},
				{
					title: "Daily Rain Sum",
					data: [
						{
							x: isValidData ? chartData.timestamps : [],
							y: isValidData ? chartData.precipitation : [],
							type: "bar",
							title: "Rain",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
				// yaxis: { title: "Temperature (°C)" },
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={6}>
					<Card title={card.title} footer={cardFooter({ minutesAgo })}>
						{isLoading ? (<LoadingIndicator />
						) : (
							<Plot
								scrollZoom
								data={card.data}
								showLegend={index === 0}
								height="300px"
								xaxis={card.xaxis}
								yaxis={card.yaxis}
							/>
						)}
					</Card>
				</Grid>
			))}
		</Grid>
	);
};

export default memo(LivOrganic);
