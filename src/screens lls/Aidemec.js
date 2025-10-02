import { Grid } from "@mui/material";
import { memo, useRef, useMemo, useState, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import aidemecConfigs, { organization } from "../config/AidemecConfig.js";
import { getCustomDateTime, getMonthDetails, debounce, findKeyByText, isValidArray } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { monthNames } from "../utils/useful-constants.js";

const PRODUCTS = [
	{ value: "Villa D Agri (PZ) - Az. Bosco Galdo", text: "Beans (Villa D Agri (PZ) - Az. Bosco Galdo)" },
	{ value: "Metaponto - Pantanello", text: "Tomato (Metaponto - Pantanello)" },
];

const OVERVIEW_CONFIG = [
	{ subtitle: "Max Temperature", key: "maxTemp", range: [-35, 45], color: "goldenrod", shape: "angular", suffix: "°C" },
	{ subtitle: "Min Temperature", key: "minTemp", range: [-35, 45], color: "third", shape: "angular", suffix: "°C" },
	{ subtitle: "Avg Humidity", key: "avgHumidity", range: [0, 100], color: "primary", shape: "bullet", suffix: "%" },
	{ subtitle: "Precipitation Sum", key: "precipSum", range: [0, 500], color: "third", shape: "bullet", suffix: "mm" },
];

const AIDEMEC = () => {
	const customDate = useMemo(() => getCustomDateTime(2024, 10), []);
	const [dateRange, setDateRange] = useState(
		() => getMonthDetails(customDate.getMonth(), 2024).dateRange,
	);

	const debouncedSetMonth = useMemo(() => debounce((date, setter) => { setter(date); }, 100), []);

	const handleMonthChange = useCallback((newValue) => {
		if (!newValue?.$d) return;

		const newMonth = newValue.$d.getMonth();
		const newYear = newValue.$d.getFullYear();

		debouncedSetMonth(getMonthDetails(newMonth, newYear).dateRange, setDateRange);
	}, [debouncedSetMonth]);

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
			views: ["month", "year"],
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
		if (!dataSets) {
			return { maxTemp: null, minTemp: null, avgHumidity: null, precipSum: null };
		}

		return {
			maxTemp: isValidArray(dataSets.maxTemperature)
				? dataSets.maxTemperature[0]?.max_air_temperature_max_c ?? null
				: null,
			minTemp: isValidArray(dataSets.minTemperature)
				? dataSets.minTemperature[0]?.min_air_temperature_min_c ?? null
				: null,
			avgHumidity: isValidArray(dataSets.avgHumidity)
				? dataSets.avgHumidity[0]?.avg_relative_humidity_med_pct ?? null
				: null,
			precipSum: isValidArray(dataSets.precipitationSum)
				? dataSets.precipitationSum.find((item) => item.key === product.value)?.sum_rain_mm ?? null
				: null,
		};
	}, [dataSets, product.value]);

	const monthlyOverview = useMemo(() => OVERVIEW_CONFIG.map((config) => ({
		data: {
			value: indicatorValues[config.key],
			subtitle: config.subtitle,
		},
		range: config.range,
		color: config.color,
		shape: config.shape,
		suffix: config.suffix,
	})), [indicatorValues]);

	// Pre-compute chart data transformations
	const chartData = useMemo(() => {
		const initialStructure = {
			timestamps: [],
			maxTemp: [],
			medTemp: [],
			minTemp: [],
			eto: [],
			rain: [],
			maxHumidity: [],
			medHumidity: [],
			minHumidity: [],
		};
		if (!isValidArray(metrics)) {
			return { initialStructure };
		}

		return metrics.reduce((acc, item) => {
			acc.timestamps.push(item.timestamp);
			acc.maxTemp.push(item.air_temperature_max_c);
			acc.medTemp.push(item.air_temperature_med_c);
			acc.minTemp.push(item.air_temperature_min_c);
			acc.eto.push(item.eto_hargreaves_mm);
			acc.rain.push(item.rain_mm);
			acc.maxHumidity.push(item.relative_humidity_max_pct);
			acc.medHumidity.push(item.relative_humidity_med_pct);
			acc.minHumidity.push(item.relative_humidity_min_pct);
			return acc;
		}, initialStructure);
	}, [metrics]);

	const createChartConfig = (data, precipitationSum) => [
		{
			title: "Daily Temperature Evolution",
			data: [
				{ x: data.timestamps, y: data.maxTemp, type: "scatter", mode: "lines+markers", title: "Max", color: "goldenrod" },
				{ x: data.timestamps, y: data.medTemp, type: "scatter", mode: "lines+markers", title: "Avg", color: "secondary" },
				{ x: data.timestamps, y: data.minTemp, type: "scatter", mode: "lines+markers", title: "Min", color: "third" },
			],
			yaxis: { title: "Temperature (°C)" },
		},
		{
			title: "Daily Humidity Evolution",
			data: [
				{ x: data.timestamps, y: data.maxHumidity, type: "scatter", mode: "lines+markers", title: "Max", color: "primary" },
				{ x: data.timestamps, y: data.medHumidity, type: "scatter", mode: "lines+markers", title: "Avg", color: "secondary" },
				{ x: data.timestamps, y: data.minHumidity, type: "scatter", mode: "lines+markers", title: "Min", color: "third" },
			],
			yaxis: { title: "Humidity (%)" },
		},
		{
			title: "Daily Net Precipitation",
			data: [
				{ x: data.timestamps, y: data.rain, type: "bar", title: "Rain", color: "third" },
				{ x: data.timestamps, y: data.eto, type: "bar", title: "ETo", color: "goldenrod" },
			],
			yaxis: { title: "Precipitation (mm)" },
		},
		{
			title: "Monthly Precipitation Per Field",
			data: isValidArray(precipitationSum)
				? [{
					labels: PRODUCTS.map((item) => item.text),
					values: precipitationSum.filter((item) => !item.key.includes("'")).map((item) => item.sum_rain_mm),
					type: "pie",
				}]
				: [{ labels: [], values: [], type: "pie" }],
		},
	];

	const charts = useMemo(() => createChartConfig(chartData, dataSets.precipitationSum), [chartData, dataSets.precipitationSum]);

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
