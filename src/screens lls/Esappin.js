import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import StickyBand from "../components/StickyBand.js";
import useInit from "../utils/screen-init.js";
import esappinConfigs, { organization } from "../config/EsappinConfig.js";
import { getCustomDateTime, getMonthDetails, debounce, findKeyByText, isValidArray } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";
import { monthNames } from "../utils/useful-constants.js";

const PRODUCTS = [
	{ value: "Erdbeeren", text: "Erdbeeren" },
	{ value: "Gerstefeld G1", text: "Gerstefeld G1" },
	{ value: "Rapsfeld B1", text: "Rapsfeld B1" },
	{ value: "Rapsfeld B2", text: "Rapsfeld B2" },
	{ value: "Rapsfeld H1", text: "Rapsfeld H1" },
	{ value: "Rapsfeld H2", text: "Rapsfeld H2" },
];

const YEAR = 2024;
const INITIAL_MONTH = 10;
const MIN_DATE = new Date(2024, 8, 1);
const MAX_DATE = new Date(2025, 3, 31);

const Esappin = () => {
	const customDate = useMemo(() => getCustomDateTime(YEAR, INITIAL_MONTH), []);
	const [dateRange, setDateRange] = useState(
		() => getMonthDetails(customDate.getMonth(), YEAR).dateRange,
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
		if (selectedProduct) { setProduct(selectedProduct); }
	}, []);

	const dropdownContent = useMemo(() => [{
		id: "product",
		size: "small",
		label: "Select field",
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
			minDate: MIN_DATE,
			maxDate: MAX_DATE,
			value: customDate,
			labelSize: 12,
			onChange: handleMonthChange,
		},
	], [handleMonthChange, customDate]);

	const fetchConfigs = useMemo(
		() => (esappinConfigs(product.value, dateRange.startDate, dateRange.endDate)),
		[product.value, dateRange.startDate, dateRange.endDate],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);

	// Pre-compute data transformations
	const chartData = useMemo(() => {
		if (!isValidArray(metrics)) {
			return {
				timestamps: [],
				maxTemp: [],
				minTemp: [],
				precipitation: [],
				radiationSum: [],
			};
		}

		return metrics.reduce((acc, item) => {
			acc.timestamps.push(item.timestamp);
			acc.maxTemp.push(item.max_temperature);
			acc.minTemp.push(item.min_temperature);
			acc.precipitation.push(item.precipitation_sum);
			acc.radiationSum.push(item.shortwave_radiation_sum);
			return acc;
		}, {
			timestamps: [],
			maxTemp: [],
			minTemp: [],
			precipitation: [],
			radiationSum: [],
		});
	}, [metrics]);

	const indicatorValues = useMemo(() => {
		const maxTemp = isValidArray(dataSets?.maxMaxTemperature) ? dataSets.maxMaxTemperature[0]?.max_max_temperature : null;

		const minTemp = isValidArray(dataSets?.minMinTemperature) ? dataSets.minMinTemperature[0]?.min_min_temperature : null;

		const precipSum = isValidArray(dataSets?.precipitationSum)
			? dataSets.precipitationSum.find((item) => item.key === product.value)?.sum_precipitation_sum : null;

		return { maxTemp, minTemp, precipSum };
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
				value: indicatorValues.precipSum,
				subtitle: "Precipitation Sum",
			},
			range: [0, 500],
			color: "third",
			shape: "bullet",
			suffix: "mm",
		},
	], [indicatorValues]);

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
					y: chartData.minTemp,
					type: "scatter",
					mode: "lines+markers",
					title: "Min",
					color: "third",
				},
			],
			yaxis: { title: "Temperature (°C)", automargin: true },
		},
		{
			title: "Shortwave Radiation Sum",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.radiationSum,
					type: "bar",
					color: "goldenrod",
				},
			],
			yaxis: { title: "Radiation Metric", automargin: true },
		},
		{
			title: "Daily Precipitation Sum",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.precipitation,
					type: "bar",
					color: "third",
				},
			],
			yaxis: { title: "Precipitation (mm)", automargin: true },
		},
		{
			title: "Monthly Precipitation Per Field",
			data: isValidArray(dataSets.precipitationSum)
				? [
					{
						labels: dataSets.precipitationSum.map((item) => item.key),
						values: dataSets.precipitationSum.map((item) => item.sum_precipitation_sum),
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
								data={card.data}
								title={dateRange.month ? `${monthNames[dateRange.month].text} ${year}` : ""}
								showLegend={index === 0 || index === 3}
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

export default memo(Esappin);
