import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import { thallaConfigs, organization } from "../config/ThallaConfig.js";
import { calculateDates, calculateDifferenceBetweenDates, debounce } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand } from "../utils/rendering-items.js";

const REGIONS = [
	{ value: "Amfissa", text: "Amfissa" },
	{ value: "Evoia", text: "Evoia" },
	{ value: "Larisa", text: "Larisa" },
	{ value: "Lamia", text: "Lamia" },
	{ value: "Thiva", text: "Thiva" },
];

const THALLA = () => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [region, setRegion] = useState(null);

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 0),
		[],
	);

	const handleDateChange = useCallback((newValue, setter) => {
		if (!newValue?.$d) return;
		setter(newValue.$d);
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	const dropdownContent = useMemo(() => [
		{
			id: "region",
			size: "small",
			width: "170px",
			height: "40px",
			color: "primary",
			label: "Regions",
			items: REGIONS,
			defaultValue: "",
			onChange: (event) => {
				setRegion(event.target.value);
			},

		},
	], []);

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
		() => (isValidDateRange && region ? thallaConfigs(region, startDate, endDate, differenceInDays) : null),
		[isValidDateRange, region, startDate, endDate, differenceInDays],
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
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={dropdownContent} value={region} formRef={formRefDate} formContent={formContentDate} />
			<Grid item xs={12} md={12} alignItems="center" flexDirection="column">
				<Card title={`${differenceInDays}-day Overview`} footer={cardFooter({ minutesAgo })}>
					{isLoading ? (<LoadingIndicator />
					) : (
						<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
							{[
								{
									data: {
										value: dataSets?.maxMaxTemperature?.[0]
											? dataSets.maxMaxTemperature[0].max_max_temperature
											: null,
										subtitle: "Max Temperature",
									},
									color: "goldenrod",
								},
								{
									data: {
										value: dataSets?.meanMeanTemperature?.[0]
											? dataSets.meanMeanTemperature[0].avg_mean_temperature
											: null,
										subtitle: "Average Temperature",
									},
									color: "primary",
								},
								{
									data: {
										value: dataSets?.minMinTemperature?.[0]
											? dataSets.minMinTemperature[0].min_min_temperature
											: null,
										subtitle: "Min Temperature",
									},
									color: "third",
								},
								{
									data: {
										value: dataSets?.rainSum?.[0]
											? dataSets.rainSum[0].sum_rain
											: null,
										subtitle: "Rain Sum",
									},
									range: [0, 100],
									color: "third",
									orientation: "h",
									suffix: "mm",
								},
								{
									data: {
										value: dataSets?.meanWindSpeed?.[0]
											? dataSets.meanWindSpeed[0].avg_wind_speed
											: null,
										subtitle: "Average Wind Speed",
									},
									range: [0, 10],
									color: "primary",
									orientation: "h",
									suffix: "Beaufort",
								},
							].map((plotData, index) => (
								<Grid key={index} item xs={12} sm={12} md={plotData.orientation ? 6 : 3} justifyContent="flex-end" alignItems="center" sx={{ height: "200px" }}>
									{plotData.orientation ? (
										<Plot
											showLegend
											scrollZoom
											height="120px"
											data={[
												{
													type: "indicator",
													mode: "gauge+number",
													value: plotData.data.value,
													range: plotData.range, // Gauge range
													color: plotData.color, // Color of gauge bar
													shape: "bullet", // "angular" or "bullet"
													orientation: plotData.orientation,
													indicator: "primary", // Color of gauge indicator/value-line
													textColor: "primary", // Color of gauge value
													suffix: plotData.suffix, // Suffix of gauge value
												},
											]}
											displayBar={false}
											title={plotData.data.subtitle}
										/>
									) : (
										<Plot
											showLegend
											scrollZoom
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
									)}
								</Grid>
							))}
						</Grid>
					)}
				</Card>
			</Grid>
			{[
				{
					title: "Temperature Evolution Per Day",
					data: [
						{
							x: chartData.timestamps,
							y: chartData.maxTemp,
							type: "bar",
							title: "Max",
							color: "primary",
						},
						{
							x: chartData.timestamps,
							y: chartData.meanTemp,
							type: "bar",
							title: "Avg",
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
					title: `${differenceInDays}-day Temperature Distribution`,
					data: [
						{
							y: chartData.maxTemp,
							type: "box",
							title: "Max	Temperature",
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
					title: "Wind Speed",
					data: [
						{
							x: chartData.timestamps,
							y: chartData.windSpeed,
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
							x: chartData.timestamps,
							y: chartData.rain,
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

export default memo(THALLA);
