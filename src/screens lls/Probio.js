import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import { probioConfigs, organization } from "../config/ProbioConfig.js";
import { calculateDates, debounce, isValidArray } from "../utils/data-handling-functions.js";
import { cardFooter, StickyBand, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";

const PRODUCTS = ["Overview", "Oats"];

const Probio = () => {
	const [startDate, setStartDate] = useState("2023-06-01");
	const [endDate, setEndDate] = useState("2023-06-30");
	const [product, setProduct] = useState(PRODUCTS[0]);
	console.log("Selected Product:", product);

	const handleProductChange = useCallback((event) => {
		setProduct(event.target.value);
	}, []);

	const dropdownContent = useMemo(() => [{
		id: "product",
		size: "small",
		label: "Select Product",
		value: product,
		items: PRODUCTS,
		onChange: handleProductChange,
	}], [product, handleProductChange]);

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 1500),
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
			minDate: new Date(2023, 0, 1),
			maxDate: new Date(2024, 11, 31),
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			labelSize: 12,
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [endDate, handleDateChange, startDate]);

	const isValidDateRange = useMemo(() => startDate && endDate && new Date(startDate) <= new Date(endDate), [startDate, endDate]);

	const fetchConfigs = useMemo(
		() => (isValidDateRange ? probioConfigs(startDate, endDate, product) : null),
		[isValidDateRange, startDate, endDate, product],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
	const oatMetrics = useMemo(() => dataSets?.oatMetrics || [], [dataSets]);

	const extractMetricData = useCallback((data, fields) => fields.reduce((acc, field) => {
		acc[field] = data.map((item) => item[field]);
		return acc;
	}, { timestamps: data.map((item) => item.timestamp) }),
	[]);

	const chartData = useMemo(() => extractMetricData(metrics, [
		"air_temperature_max", "air_temperature_avg", "air_temperature_min",
		"air_pressure", "air_humidity",
	]), [metrics, extractMetricData]);

	console.log("Chart Data:", chartData);

	const graphConfigs = useMemo(() => [
		{
			title: "Temperature Evolution Per Day",
			data: [
				{ x: chartData.timestamps, y: chartData.air_temperature_max, type: "bar", title: "Max", color: "primary" },
				{ x: chartData.timestamps, y: chartData.air_temperature_avg, type: "bar", title: "Avg", color: "secondary" },
				{ x: chartData.timestamps, y: chartData.air_temperature_min, type: "bar", title: "Min", color: "third" },
			],
			xaxis: { title: "Days" },
			yaxis: { title: "Temperature (°C)" },
		},
		{
			title: "Air Temperature Vs Pressure Correlation",
			data: [
				{ x: chartData.timestamps, y: chartData.air_temperature_avg, type: "scatter", mode: "lines", title: "Avg Temperature", color: "secondary" },
				{ x: chartData.timestamps, y: chartData.air_pressure, type: "scatter", mode: "lines", title: "Air Pressure", color: "third", yaxis: "y2" },
			],
			xaxis: { title: "Days" },
			yaxis: {
				primary: { title: "Temperature (°C)" },
				secondary: { title: "Air Pressure (hPa)", anchor: "x", overlaying: "y", side: "right" },
			},
		},
		{
			title: "Air Temperature Vs Humidity Correlation",
			data: [
				{ x: chartData.timestamps, y: chartData.air_temperature_avg, type: "scatter", mode: "lines", title: "Avg Temperature", color: "secondary" },
				{ x: chartData.timestamps, y: chartData.air_humidity, type: "scatter", mode: "lines", title: "Air Humidity", color: "third", yaxis: "y2" },
			],
			xaxis: { title: "Days" },
			yaxis: {
				primary: { title: "Temperature (°C)" },
				secondary: { title: "Air Humidity (%)", anchor: "x", overlaying: "y", side: "right" },
			},
		},
		{
			title: "Air Pressure Vs Humidity Correlation",
			data: [
				{ x: chartData.timestamps, y: chartData.air_pressure, type: "scatter", mode: "lines", title: "Air Pressure", color: "primary" },
				{ x: chartData.timestamps, y: chartData.air_humidity, type: "scatter", mode: "lines", title: "Air Humidity", color: "third", yaxis: "y2" },
			],
			xaxis: { title: "Days" },
			yaxis: {
				primary: { title: "Air Pressure (hPa)" },
				secondary: { title: "Air Humidity (%)", anchor: "x", overlaying: "y", side: "right" },
			},
		},
		{
			title: "Complete Overview",
			data: [
				{ x: chartData.timestamps, y: chartData.air_temperature_max, type: "bar", title: "Max Temperature", color: "secondary" },
				{ x: chartData.timestamps, y: chartData.air_pressure, type: "scatter", mode: "lines", title: "Air Pressure", color: "primary", yaxis: "y2" },
				{ x: chartData.timestamps, y: chartData.air_humidity, type: "scatter", mode: "lines", title: "Air Humidity", color: "third", yaxis: "y2" },
			],
			xaxis: { title: "Days" },
			yaxis: {
				primary: { title: "Temperature (°C)" },
				secondary: { title: "Pressure (hPa) / Humidity (%)", anchor: "x", overlaying: "y", side: "right" },
			},
		},
	], [chartData]);

	const oatData = useMemo(() => extractMetricData(oatMetrics, [
		"average_temperature", "precipitation", "precipitation_sum",
		"water_demand", "sum_water_demand",
	]), [oatMetrics, extractMetricData]);

	const oatGraphConfigs = useMemo(() => [
		{
			title: "Water Demands",
			data: [
				{ x: oatData.timestamps, y: oatData.sum_water_demand, type: "scatter", mode: "lines", title: "Sum of Water Demand ", color: "primary", showlegend: true },
				{ x: oatData.timestamps, y: oatData.precipitation_sum, type: "scatter", mode: "lines", title: "Sum of Precipitation", color: "third", showlegend: true },
			],
			xaxis: { title: "Days" },
			yaxis: { title: "Sums of Water Demand and Precipitation (mm)" },
			shapes: oatData.timestamps.map((timestamp, index) => ({
				type: "line",
				x0: timestamp,
				x1: timestamp,
				y0: oatData.precipitation_sum[index],
				y1: oatData.sum_water_demand[index],
				line: {
					color: oatData.precipitation_sum[index] < oatData.sum_water_demand[index] ? "goldenrod" : "green",
					width: 2,
				},
			})),
		},
		{
			title: "Complete Oats Overview",
			data: [
				{ x: oatData.timestamps, y: oatData.water_demand, type: "scatter", mode: "lines", title: "Water Demand", color: "primary" },
				{ x: oatData.timestamps, y: oatData.precipitation, type: "scatter", mode: "lines", title: "Precipitation", color: "third" },
				{ x: oatData.timestamps, y: oatData.average_temperature, type: "scatter", mode: "lines", title: "Avg Temperature", color: "goldenrod", yaxis: "y2" },
			],
			xaxis: { title: "Days" },
			yaxis: {
				primary: { title: "Precipitation and Water Demand(mm)" },
				secondary: { title: "Avg Temperature (°C)", anchor: "x", overlaying: "y", side: "right" },
			},
			shapes: oatData.timestamps.map((timestamp, index) => ({
				type: "line",
				x0: timestamp,
				x1: timestamp,
				y0: oatData.precipitation[index],
				y1: oatData.water_demand[index],
				line: {
					color: oatData.precipitation[index] < oatData.water_demand[index] ? "goldenrod" : "green",
					width: 2,
				},
			})),
		},
	], [oatData]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<StickyBand dropdownContent={dropdownContent} formRef={formRefDate} formContent={formContentDate} />
			{product === "Overview"
				? isValidDateRange ? (
					<>
						{graphConfigs.map((card, index) => (
							<Grid key={index} item xs={12} md={index === graphConfigs.length - 1 ? 12 : 6} mb={index === graphConfigs.length - 1 ? 1 : 0}>
								<Card title={card.title} footer={cardFooter({ minutesAgo })}>
									{isLoading ? (<LoadingIndicator minHeight="300px" />
									) : isValidArray(metrics) ? (
										<Plot
											scrollZoom
											data={card.data}
											height="300px"
											xaxis={card.xaxis}
											yaxis={card.yaxis}
										/>
									) : (<DataWarning minHeight="300px" />
									)}
								</Card>
							</Grid>
						))}
					</>
				) : (<DataWarning message="Please Select a Valid Date Range" />
				) : (
					product === "Oats" && isValidDateRange ? (
						<>
							{oatGraphConfigs.map((card, index) => (
								<Grid key={index} item xs={12} sm={12} md={12} mb={index === oatGraphConfigs.length - 1 ? 1 : 0}>
									<Card title={card.title} footer={cardFooter({ minutesAgo })}>
										{isLoading ? (<LoadingIndicator minHeight="300px" />
										) : isValidArray(oatMetrics) ? (
											<Plot
												scrollZoom
												data={card.data}
												height="300px"
												xaxis={card.xaxis}
												yaxis={card.yaxis}
												shapes={card.shapes}
											/>
										) : (<DataWarning minHeight="300px" />
										)}
									</Card>
								</Grid>
							))}
						</>
					) : (
						<DataWarning message="Please Select a Valid Date Range" />
					)
				)}
		</Grid>
	);
};

export default memo(Probio);
