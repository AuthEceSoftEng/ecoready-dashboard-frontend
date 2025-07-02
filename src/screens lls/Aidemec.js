import { Grid } from "@mui/material";
import { memo, useRef, useMemo, useState, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import aidemecConfigs, { organization } from "../config/AidemecConfig.js";
import { getCustomDateTime, debounce, findKeyByText, isValidArray } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { monthNames } from "../utils/useful-constants.js";

const PRODUCTS = [
	{ value: "Villa D Agri (PZ) - Az. Bosco Galdo", text: "Beans (Villa D Agri (PZ) - Az. Bosco Galdo)" },
	{ value: "Metaponto - Pantanello", text: "Tomato (Metaponto - Pantanello)" },
];

const AIDEMEC = () => {
	const getMonthDetails = useMemo(() => (month) => {
		const paddedMonth = String(monthNames[month].no).padStart(2, "0");
		const lastDay = new Date(2024, monthNames[month].no, 0).getDate();
		return {
			paddedMonth,
			lastDay,
			dateRange: {
				month,
				startDate: `2024-${paddedMonth}-01`,
				endDate: `2024-${paddedMonth}-${lastDay}`,
			},
		};
	}, []);
	const customDate = useMemo(() => getCustomDateTime(2024, 10), []);
	const [dateRange, setDateRange] = useState(
		() => getMonthDetails(customDate.getMonth()).dateRange,
	);

	const debouncedSetMonth = useMemo(
		() => debounce((date, setter) => {
			setter(date);
		}, 100),
		[],
	);

	const handleMonthChange = useCallback((newValue) => {
		if (!newValue?.$d) return;

		const newMonth = newValue.$d.getMonth();

		debouncedSetMonth(getMonthDetails(newMonth).dateRange, setDateRange);
	}, [debouncedSetMonth, getMonthDetails]);

	const year = customDate.getFullYear();

	const [product, setProduct] = useState(PRODUCTS[0]);

	const handleProductChange = useCallback((event) => {
		const selectedProduct = findKeyByText(PRODUCTS, event.target.value, true);
		if (selectedProduct) {
			setProduct(selectedProduct);
		}
	}, []);

	const dropdownContent = useMemo(() => [{
		id: "product",
		size: "small",
		label: "Select Product",
		value: product.text,
		items: PRODUCTS,
		onChange: handleProductChange,
	}], [product, handleProductChange]);

	const formRefDate = useRef();
	const formContentDate = useMemo(() => [
		{
			customType: "date-picker",
			id: "monthPicker",
			type: "desktop",
			sublabel: "Select Month",
			views: ["month"],
			minDate: new Date(2024, 4, 1),
			maxDate: new Date(2024, 9, 31),
			value: customDate,
			labelSize: 12,
			onChange: handleMonthChange,
		},
	], [handleMonthChange, customDate]);

	const fetchConfigs = useMemo(
		() => (aidemecConfigs(product.value, dateRange.startDate, dateRange.endDate)),
		[product.value, dateRange.startDate, dateRange.endDate],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);

	const indicatorValues = useMemo(() => {
		const maxTemp = isValidArray(dataSets?.maxTemperature)
			? dataSets.maxTemperature[0]?.max_air_temperature_max_c
			: null;

		const minTemp = isValidArray(dataSets?.minTemperature)
			? dataSets.minTemperature[0]?.min_air_temperature_min_c
			: null;

		const avgHumidity = isValidArray(dataSets?.avgHumidity)
			? dataSets.avgHumidity[0]?.avg_relative_humidity_med_pct
			: null;

		const precipSum = isValidArray(dataSets?.precipitationSum)
			? dataSets.precipitationSum.find((item) => item.key === product.value)?.sum_rain_mm
			: null;

		return { maxTemp, minTemp, avgHumidity, precipSum };
	}, [dataSets, product]);

	const monthlyOverview = useMemo(() => [
		{
			data: {
				value: indicatorValues.maxTemp,
				subtitle: "Max Temperature",
			},
			range: [-35, 45],
			color: "goldenrod",
			shape: "angular",
			suffix: "°C",
		},
		{
			data: {
				value: indicatorValues.minTemp,
				subtitle: "Min Temperature",
			},
			range: [-35, 45],
			color: "third",
			shape: "angular",
			suffix: "°C",
		},
		{
			data: {
				value: indicatorValues.avgHumidity,
				subtitle: "Avg Humidity",
			},
			range: [0, 100],
			color: "primary",
			shape: "bullet",
			suffix: "%",
		},
		{
			data: {
				value: indicatorValues.precipSum,
				subtitle: "Precipitation Sum",
			},
			range: [0, 500],
			color: "third",
			shape: "bullet",
			suffix: "mm",
		},
	], [indicatorValues]);

	// Pre-compute chart data transformations
	const chartData = useMemo(() => ({
		// Time data
		timestamps: metrics.map((item) => item.timestamp) || [],

		// Temperature data
		maxTemp: metrics.map((item) => item.air_temperature_max_c) || [],
		// avgMaxTemp: metrics.map((item) => item.air_temperature_avg_max_c) || [],
		medTemp: metrics.map((item) => item.air_temperature_med_c) || [],
		// avgMinTemp: metrics.map((item) => item.air_temperature_avg_min_c) || [],
		minTemp: metrics.map((item) => item.air_temperature_min_c) || [],

		// Water data
		eto: metrics.map((item) => item.eto_hargreaves_mm) || [],
		rain: metrics.map((item) => item.rain_mm) || [],

		// Humidity data
		maxHumidity: metrics.map((item) => item.relative_humidity_max_pct) || [],
		// avgMaxHumidity: metrics.map((item) => item.relative_humidity_avg_max_pct) || [],
		medHumidity: metrics.map((item) => item.relative_humidity_med_pct) || [],
		// avgMinHumidity: metrics.map((item) => item.relative_humidity_avg_min_pct) || [],
		minHumidity: metrics.map((item) => item.relative_humidity_min_pct) || [],

	}), [metrics]);

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
					color: "goldenrod",
				},
				{
					x: chartData.timestamps,
					y: chartData.medTemp,
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
			title: "Daily Humidity Evolution",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.maxHumidity,
					type: "scatter",
					mode: "lines+markers",
					title: "Max",
					color: "primary",
				},
				{
					x: chartData.timestamps,
					y: chartData.medHumidity,
					type: "scatter",
					mode: "lines+markers",
					title: "Avg",
					color: "secondary",
				},
				{
					x: chartData.timestamps,
					y: chartData.minHumidity,
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
			title: "Daily Net Precipitation",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.rain,
					type: "bar",
					title: "Rain",
					color: "third",
				},
				{
					x: chartData.timestamps,
					y: chartData.eto,
					type: "bar",
					title: "ETo",
					color: "goldenrod",
				},
			],
			xaxis: { title: "Days" },
			yaxis: { title: "Precipitation (mm)" },
		},
		{
			title: "Monthly Precipitation Per Field",
			data: isValidArray(dataSets.precipitationSum)
				? [
					{
						labels: PRODUCTS.map((item) => item.text),
						// dataSets.precipitationSum
						// 	.filter((item) => !item.key.includes("'"))
						// 	.map((item) => item.key),
						values: dataSets.precipitationSum
							.filter((item) => !item.key.includes("'"))
							.map((item) => item.sum_rain_mm),
						type: "pie",
					},
				] : [{ labels: [], values: [], type: "pie" }],
		},
	], [chartData, dataSets.precipitationSum]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<StickyBand dropdownContent={dropdownContent} formContent={formContentDate} formRef={formRefDate} />
			{/* Monthly Overview Card */}
			<Grid item xs={12} md={12} alignItems="center" flexDirection="column" padding={0}>
				<Card title="Monthly Overview" footer={cardFooter({ minutesAgo })}>
					<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
						{isLoading ? (
							monthlyOverview.map((plotData, index) => (
								<Grid
									key={index}
									item
									xs={12}
									sm={12}
									md={plotData.shape === "bullet" ? 6 : 4}
									justifyContent="center"
									alignItems="center"
								>
									<LoadingIndicator minHeight={plotData.shape === "bullet" ? "120px" : "200px"} />
								</Grid>
							))
						) : monthlyOverview.some((plot) => plot.data.value) ? (
							monthlyOverview.map((plotData, index) => (
								<Grid
									key={index}
									item
									xs={12}
									sm={12}
									md={plotData.shape === "bullet" ? 6 : 4}
									justifyContent="center"
									alignItems="center"
								>
									{plotData.data.value !== null && plotData.data.value !== undefined ? (
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
									) : (
										<DataWarning minHeight={plotData.shape === "bullet" ? "120px" : "200px"} />
									)}
								</Grid>
							))
						) : (
							<Grid item xs={12}>
								<DataWarning minHeight="200px" />
							</Grid>
						)}
					</Grid>
				</Card>
			</Grid>

			{/* Chart Cards */}
			{charts.map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={6} mb={index === charts.length - 1 ? 2 : 0}>
					<Card title={card.title} footer={cardFooter({ minutesAgo })}>
						{isLoading ? (<LoadingIndicator minHeight="300px" />
						) : isValidArray(metrics) ? (
							<Plot
								scrollZoom
								showLegend
								data={card.data}
								title={dateRange.month ? `${monthNames[dateRange.month].text} ${year}` : ""}
								height="300px"
								xaxis={card?.xaxis}
								yaxis={card?.yaxis}
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

export default memo(AIDEMEC);
