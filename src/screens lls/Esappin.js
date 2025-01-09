import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useEffect } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Dropdown from "../components/Dropdown.js";
import useInit from "../utils/screen-init.js";
import DatePicker from "../components/DatePicker.js";
import esappinConfigs, { organization } from "../config/EsappinConfig.js";
import { getCustomDateTime, debounce } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";

const PRODUCTS = [
	{ value: "Rapsfeld B1", text: "Rapsfeld B1" },
	{ value: "Rapsfeld B2", text: "Rapsfeld B2" },
	{ value: "Rapsfeld H1", text: "Rapsfeld H1" },
	{ value: "Rapsfeld H2", text: "Rapsfeld H2" },
	{ value: "Erdbeeren", text: "Erdbeeren" },
	{ value: "Gerstefeld G1", text: "Gerstefeld G1" },
];

const getMonthDetails = (month) => {
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
};

const isValidArray = (arr) => Array.isArray(arr) && arr.length > 0;

const Esappin = () => {
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
	}, [debouncedSetMonth]);

	const year = customDate.getFullYear();

	const [product, setProduct] = useState("Rapsfeld B1");
	const isValidDateRange = useMemo(
		() => dateRange.startDate && dateRange.endDate && new Date(dateRange.startDate) <= new Date(dateRange.endDate),
		[dateRange.startDate, dateRange.endDate],
	);

	const fetchConfigs = useMemo(
		() => (isValidDateRange && product ? esappinConfigs(product, dateRange.startDate, dateRange.endDate) : null),
		[isValidDateRange, product, dateRange.startDate, dateRange.endDate],
	);

	const dropdownContent = [{
		id: "product",
		size: "small",
		width: "170px",
		height: "40px",
		color: "primary",
		label: "Product",
		items: PRODUCTS,
		defaultValue: "Rapsfeld B1",
		onChange: (event) => {
			setProduct(event.target.value);
		},

	}];

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
			precipitation: metrics.map((item) => item.precipitation_sum),
			radiationSum: metrics.map((item) => item.shortwave_radiation_sum),
		};
	}, [metrics, isValidData]);

	const monthlyOverview = useMemo(() => [
		{
			data: {
				value: dataSets?.maxMaxTemperature && Array.isArray(dataSets.maxMaxTemperature)
					? dataSets.maxMaxTemperature[0]?.max_max_temperature
					: null,
				subtitle: "Max Temperature",
			},

			range: [-35, 45],
			color: "goldenrod",
			shape: "angular",
			suffix: "°C",

		},
		{
			data: {
				value: dataSets?.minMinTemperature && Array.isArray(dataSets.minMinTemperature)
					? dataSets.minMinTemperature[0]?.min_min_temperature
					: null,
				subtitle: "Min Temperature",
			},
			range: [-35, 45],
			color: "third",
			shape: "angular",
			suffix: "°C",
		},
		{
			data: {
				value: dataSets?.precipitationSum && Array.isArray(dataSets.precipitationSum)
					? dataSets.precipitationSum.find((item) => item.key === product)?.sum_precipitation_sum
					: null,
				subtitle: "Precipitation Sum",
			},
			range: [0, 500],
			color: "third",
			shape: "bullet",
			suffix: "mm",
		},
	], [dataSets, product]);

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
			xaxis: { title: "Days" },
			yaxis: { title: "Temperature (°C)" },
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
			xaxis: { title: "Days" },
			yaxis: { title: "Radiation Metric" },
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
			xaxis: { title: "Days" },
			yaxis: { title: "Precipitation (mm)" },
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

	console.log("precipitation is an array:", isValidArray(dataSets.precipitationSum));
	console.log("precipitationSum:", dataSets.precipitationSum);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid container display="flex" direction="row" justifyContent="flex-end" alignItems="center" mt={1} spacing={2}>
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} xs={6} md={3}>
					<Dropdown
						id={dropdownContent[0].id}
						value={product}
						placeholder={dropdownContent[0].label}
						items={dropdownContent[0].items}
						size={dropdownContent[0].size}
						width={dropdownContent[0].width}
						height={dropdownContent[0].height}
						background={dropdownContent[0].color}
						onChange={dropdownContent[0].onChange}
					/>
				</Grid>
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} xs={6} sm={3} md={2}>
					{/* Select only the month */}
					<DatePicker
						type="desktop"
						label="Month Picker"
						width="170px"
						views={["month", "year"]}
						onChange={handleMonthChange}
					/>
				</Grid>
			</Grid>
			{isValidDateRange ? (
				<>
					<Grid item xs={12} md={12} alignItems="center" flexDirection="column" padding={0}>
						<Card title={`${monthNames[dateRange.month].text}'s Overview`} footer={cardFooter({ minutesAgo })}>
							<Grid container display="flex" direction="row" justifyContent="space-evenly" padding={0} spacing={1}>
								{monthlyOverview.map((plotData, index) => (
									<Grid
										key={index}
										item
										xs={12}
										sm={12}
										md={plotData.shape === "bullet" ? 6 : 4}
										justifyContent="center"
										alignItems="center"
									>
										{plotData.data.value
											? isLoading ? (<LoadingIndicator />
											) : (
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
											) : (<DataWarning />)}
									</Grid>
								))}
							</Grid>
						</Card>
					</Grid>
					{isValidData ? (
						<>
							{charts.map((card, index) => (
								<Grid key={index} item xs={12} sm={12} md={6} mb={index === charts.length - 1 ? 2 : 0}>
									<Card title={card.title} footer={cardFooter({ minutesAgo })}>
										{isLoading ? (<LoadingIndicator />
										) : (
											<Plot
												scrollZoom
												data={card.data}
												title={dateRange.month ? `${monthNames[dateRange.month].text} ${year}` : ""}
												showLegend={index === 0 || 3}
												height="300px"
												xaxis={card?.xaxis}
												yaxis={card?.yaxis}
											/>
										)}
									</Card>
								</Grid>
							))}
						</>
					) : (<DataWarning />)}
				</>
			) : (<DataWarning message="Please Select a Valid Date Range" />
			)}
		</Grid>
	);
};

export default memo(Esappin);
