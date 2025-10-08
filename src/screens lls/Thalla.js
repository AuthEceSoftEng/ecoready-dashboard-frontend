import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import { thallaConfigs, organization } from "../config/ThallaConfig.js";
import { calculateDates, calculateDifferenceBetweenDates, debounce } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";

const REGIONS = ["Amfissa", "Evoia", "Larisa", "Lamia", "Thiva"];

// Define sensor ranges once to avoid repetition
const SENSOR_RANGES = {
	temperature: [-35, 45],
	windSpeed: [0, 21],
	rain: [0, 2000],
};

// Helper function to get value from dataset
const getDatasetValue = (dataset, key) => (dataset?.[0] ? dataset[0][key] : null);

const THALLA = () => {
	const [dateRange, setDateRange] = useState({
		start: "2024-06-01",
		end: "2024-06-30",
	});
	const { start: startDate, end: endDate } = dateRange;
	const [region, setRegion] = useState(REGIONS[0]);

	const handleRegionChange = useCallback((event) => { setRegion(event.target.value); }, []);

	const dropdownContent = useMemo(() => [
		{
			id: "region",
			items: REGIONS,
			label: "Select Area",
			value: region,
			size: "small",
			onChange: handleRegionChange,
		},
	], [handleRegionChange, region]);

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 2000),
		[],
	);

	const handleDateChange = useCallback((newValue, setter) => {
		if (!newValue?.$d) return;
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	const formRefDate = useRef();

	const formContentDate = useMemo(() => [
		{
			customType: "date-range",
			id: "dateRange",
			width: "350px",
			minDate: new Date(2024, 4, 1),
			maxDate: new Date(2024, 8, 30),
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			labelSize: 12,
			onStartChange: (newValue) => handleDateChange(newValue, (val) => setDateRange((prev) => ({ ...prev, start: val }))),
			onEndChange: (newValue) => handleDateChange(newValue, (val) => setDateRange((prev) => ({ ...prev, end: val }))),
		},
	], [endDate, handleDateChange, startDate]);

	const isValidDateRange = useMemo(() => startDate && endDate && new Date(startDate) <= new Date(endDate),
		[startDate, endDate]);

	const { differenceInDays } = calculateDifferenceBetweenDates(startDate, endDate);

	const fetchConfigs = useMemo(
		() => (isValidDateRange ? thallaConfigs(region, startDate, endDate, differenceInDays) : null),
		[isValidDateRange, region, startDate, endDate, differenceInDays],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
	const isValidData = useMemo(() => metrics.length > 0, [metrics]);

	// Pre-compute chart data transformations
	const chartData = useMemo(() => ({
		timestamps: metrics.map((item) => item.timestamp) || [],
		maxTemp: metrics.map((item) => item.max_temperature) || [],
		meanTemp: metrics.map((item) => item.mean_temperature) || [],
		minTemp: metrics.map((item) => item.min_temperature) || [],
		windSpeed: metrics.map((item) => item.wind_speed) || [],
		rain: metrics.map((item) => item.rain) || [],
	}), [metrics]);

	// Pre-define gauge configuration
	const gaugeConfigs = useMemo(() => [
		{
			data: {
				value: getDatasetValue(dataSets?.maxMaxTemperature, "max_max_temperature"),
				subtitle: "Max Temperature",
			},
			suffix: "°C",
			color: "goldenrod",
			range: SENSOR_RANGES.temperature,
		},
		{
			data: {
				value: getDatasetValue(dataSets?.meanMeanTemperature, "avg_mean_temperature"),
				subtitle: "Average Temperature",
			},
			suffix: "°C",
			color: "primary",
			range: SENSOR_RANGES.temperature,
		},
		{
			data: {
				value: getDatasetValue(dataSets?.minMinTemperature, "min_min_temperature"),
				subtitle: "Min Temperature",
			},
			suffix: "°C",
			color: "third",
			range: SENSOR_RANGES.temperature,
		},
		{
			data: {
				value: getDatasetValue(dataSets?.meanWindSpeed, "avg_wind_speed"),
				subtitle: "Average Wind Speed",
			},
			range: SENSOR_RANGES.windSpeed,
			color: "primary",
			shape: "bullet",
			suffix: "Bft",
		},
		{
			data: {
				value: getDatasetValue(dataSets?.rainSum, "sum_rain"),
				subtitle: "Rain Sum",
			},
			range: SENSOR_RANGES.rain,
			color: "third",
			shape: "bullet",
			suffix: "mm",
		},
	], [dataSets]);

	// Pre-define chart configurations
	const chartConfigs = useMemo(() => [
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
			yaxis: { title: "Temperature (°C)", automargin: true },
		},
		{
			title: `${differenceInDays}-day Temperature Distribution`,
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
			yaxis: { title: "Temperature (°C)", automargin: true },
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
			yaxis: { title: "Wind Speed (Bft)", automargin: true },
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
			yaxis: { title: "Rain (mm)", automargin: true },
		},
	], [chartData, differenceInDays]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<StickyBand dropdownContent={dropdownContent} formRef={formRefDate} formContent={formContentDate} />

			{isValidDateRange ? (
				<>
					{/* Overview Card */}
					<Grid item xs={12} md={12} alignItems="center" flexDirection="column">
						<Card title={`${differenceInDays}-day Overview`} footer={cardFooter({ minutesAgo })}>
							{isLoading ? (<LoadingIndicator />
							) : (
								<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
									{gaugeConfigs.map((plotData, index) => (
										<Grid
											key={index}
											item
											xs={12}
											sm={12}
											md={plotData.shape === "bullet" ? 6 : 4}
											justifyContent="flex-end"
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
															range: plotData.range,
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
											) : (<DataWarning minHeight={plotData.shape === "bullet" ? "120px" : "200px"} />
											)}
										</Grid>
									))}
								</Grid>
							)}
						</Card>
					</Grid>

					{/* Chart Cards */}
					{chartConfigs.map((card, index) => (
						<Grid key={index} item xs={12} sm={12} md={6} mb={1}>
							<Card title={card.title} footer={cardFooter({ minutesAgo })}>
								{isLoading ? (
									<LoadingIndicator minHeight="300px" />
								) : isValidData ? (
									<Plot
										scrollZoom
										data={card.data}
										showLegend={index === 0}
										height="300px"
										yaxis={card.yaxis}
									/>
								) : (
									<DataWarning minHeight="300px" message="No data available for selected period" />
								)}
							</Card>
						</Grid>
					))}
				</>
			) : (
				<Grid item xs={12}>
					<DataWarning message="Please select a valid date range" />
				</Grid>
			)}
		</Grid>
	);
};

export default memo(THALLA);
