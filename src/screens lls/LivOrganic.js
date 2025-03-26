import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import { organization, livOrganicConfigs } from "../config/LivOrganicConfig.js";
import { debounce, calculateDates, calculateDifferenceBetweenDates } from "../utils/data-handling-functions.js";
// import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, DataWarning, LoadingIndicator, StickyBand } from "../utils/rendering-items.js";

const LivOrganic = () => {
	const [startDate, setStartDate] = useState("2024-06-01");
	const [endDate, setEndDate] = useState("2024-07-01");

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
			type: "desktop",
			views: ["month", "year"],
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			background: "primary",
			labelSize: 12,
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [endDate, handleDateChange, startDate]);

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

	const gaugeConfigs = useMemo(() => [
		{
			data: {
				value: dataSets?.maxMaxTemperature?.[0]?.max_max_temperature ?? null,
				subtitle: "Max Temperature",
			},
			color: "primary",
			suffix: "°C",
			shape: "angular",
		},
		{
			data: {
				value: dataSets?.minMinTemperature?.[0]?.min_min_temperature ?? null,
				subtitle: "Min Temperature",
			},
			color: "third",
			suffix: "°C",
			shape: "angular",
		},
		{
			data: {
				value: dataSets?.meanPrecipitation?.[0]?.avg_precipitation ?? null,
				subtitle: "Average Precipitation",
			},
			range: [0, 100],
			color: "third",
			suffix: "mm",
			shape: "bullet",
		},
		{
			data: {
				value: dataSets?.meanSolarRadiation?.[0]?.avg_solar_radiation ?? null,
				subtitle: "Average Solar Radiation",
			},
			range: [0, 30],
			color: "goldenrod",
			suffix: "W/m²",
			shape: "bullet",
		},
	], [dataSets]);

	const graphConfigs = useMemo(() => [
		{
			title: "Temperature Evolution Per Day",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.maxTemp,
					type: "bar",
					title: "Max",
					color: "secondary",
				},
				{
					x: chartData.timestamps,
					y: chartData.minTemp,
					type: "bar",
					title: "Min",
					color: "third",
				},
			],
			xaxis: { title: "Days" },
			yaxis: { title: "Temperature (°C)" },
		},
		{
			title: "Period Temperature Distribution",
			data: [
				{
					y: chartData.maxTemp,
					type: "box",
					title: "Max Temperature",
					color: "primary",
				},
				{
					y: chartData.meanTemp,
					type: "box",
					title: "Mean Temperature",
					color: "secondary",
				},
				{
					y: chartData.minTemp,
					type: "box",
					title: "Min Temperature",
					color: "third",
				},
			],
			xaxis: { title: "Days" },
			yaxis: { title: "Temperature (°C)" },
		},
		{
			title: "Solar Radiation Evolution",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.solarRadiation,
					type: "scatter",
					mode: "lines+markers",
					title: "Wind Speed",
					color: "goldenrod",
				},
			],
			xaxis: { title: "Days" },
			yaxis: { title: "Solar Radiation (W/m²)" },
		},
		{
			title: "Daily Rain Sum",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.precipitation,
					type: "bar",
					title: "Rain",
					color: "third",
				},
			],
			xaxis: { title: "Days" },
			yaxis: { title: "Precipitation (mm)" },
		},
	], [chartData]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<StickyBand formRef={formRefDate} formContent={formContentDate} />
			{isValidDateRange ? (
				<>
					<Grid item xs={12} md={12} alignItems="center" flexDirection="column">
						<Card title="Period Overview" footer={cardFooter({ minutesAgo })}>
							{isLoading ? (
								<LoadingIndicator />
							) : (
								<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
									{gaugeConfigs.map((plotData, index) => (
										<Grid
											key={index}
											item
											xs={12}
											sm={12}
											md={plotData.shape === "bullet" ? 6 : 4}
											justifyContent="center"
											alignItems="center"
										>
											{plotData.data.value ? (
												<Plot
													showLegend
													scrollZoom
													height={plotData.shape === "bullet" ? "120px" : "200px"}
													data={[
														{
															type: "indicator",
															mode: "gauge+number",
															value: plotData.data.value,
															range: plotData.range ?? [-35, 45],
															color: plotData.color,
															shape: plotData.shape,
															indicator: "primary",
															textColor: "primary",
															suffix: plotData.suffix,
														},
													]}
													displayBar={false}
													title={plotData.data.subtitle}
												/>
											) : (<DataWarning />)}
										</Grid>
									))}
								</Grid>
							)}
						</Card>
					</Grid>
					{graphConfigs.map((card, index) => (
						<Grid key={index} item xs={12} sm={12} md={6} mb={index === graphConfigs.length - 1 ? 1 : 0}>
							<Card title={card.title} footer={cardFooter({ minutesAgo })}>
								{isValidData
									? isLoading ? (<LoadingIndicator />
									) : (
										<Plot
											scrollZoom
											data={card.data}
											showLegend={index === 0}
											height="300px"
											xaxis={card.xaxis}
											yaxis={card.yaxis}
										/>
									) : (<DataWarning />
									)}
							</Card>
						</Grid>
					))}
				</>
			) : (<DataWarning message="Please Select a Valid Date Range" />
			)}
		</Grid>
	);
};

export default memo(LivOrganic);
