import { Grid } from "@mui/material";
import { memo, useRef, useMemo, useState, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useInit from "../utils/screen-init.js";
import lofsConfigs, { organization } from "../config/LofsConfig.js";
import { getCustomDateTime, debounce, findKeyByText, isValidArray } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { monthNames } from "../utils/useful-constants.js";

const STATIONS = [
	{ value: "Station 44", text: "Station 44" },
	{ value: "Station 53", text: "Station 53" },
	{ value: "Station 85", text: "Station 85" },
];

const LOFS = () => {
	const getMonthDetails = useMemo(() => (month, year) => {
		const paddedMonth = String(monthNames[month].no).padStart(2, "0");
		const lastDay = new Date(year, monthNames[month].no, 0).getDate();
		return {
			paddedMonth,
			lastDay,
			dateRange: {
				month,
				year,
				startDate: `${year}-${paddedMonth}-01`,
				endDate: `${year}-${paddedMonth}-${lastDay}`,
			},
		};
	}, []);
	const customDate = useMemo(() => getCustomDateTime(2024, 10), []);
	const [dateRange, setDateRange] = useState(
		() => getMonthDetails(customDate.getMonth(), customDate.getFullYear()).dateRange,
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
		const newYear = newValue.$d.getFullYear();

		debouncedSetMonth(getMonthDetails(newMonth, newYear).dateRange, setDateRange);
	}, [debouncedSetMonth, getMonthDetails]);

	const [station, setStation] = useState(STATIONS[0]);

	const handleStationChange = useCallback((event) => {
		const selectedStation = findKeyByText(STATIONS, event.target.value, true);
		if (selectedStation) {
			setStation(selectedStation);
		}
	}, []);

	const dropdownContent = useMemo(() => [{
		id: "Station",
		size: "small",
		label: "Select Station",
		value: station.text,
		items: STATIONS,
		onChange: handleStationChange,
	}], [station, handleStationChange]);

	const formRefDate = useRef();
	const formContentDate = useMemo(() => [
		{
			customType: "date-picker",
			id: "monthPicker",
			type: "desktop",
			sublabel: "Select Month",
			views: ["month", "year"],
			minDate: new Date(2020, 0, 1),
			maxDate: new Date(2024, 11, 31),
			value: customDate,
			labelSize: 12,
			onChange: handleMonthChange,
		},
	], [customDate, handleMonthChange]);

	const fetchConfigs = useMemo(
		() => (lofsConfigs(station.value, dateRange.startDate, dateRange.endDate)),
		[station.value, dateRange.startDate, dateRange.endDate],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	console.log("dataSets", dataSets);
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);

	const indicatorValues = useMemo(() => {
		const maxTemp = isValidArray(dataSets?.maxTemperature)
			? dataSets.maxTemperature[0]?.max_temp_max_c
			: null;

		const minTemp = isValidArray(dataSets?.minTemperature)
			? dataSets.minTemperature[0]?.min_temp_min_c
			: null;

		const avgHumidity = isValidArray(dataSets?.avgHumidity)
			? dataSets.avgHumidity[0]?.avg_humidity_percent
			: null;

		const precipSum = isValidArray(dataSets?.precipitationSum)
			? dataSets.precipitationSum.find((item) => item.key === station.value)?.sum_rain_mm
			: null;

		const avgCo2 = isValidArray(dataSets?.avgCo2)
			? dataSets.avgCo2[0]?.avg_co2_ppm
			: null;

		const avgSolarRadiation = isValidArray(dataSets?.avgSolarRadiation)
			? dataSets.avgSolarRadiation[0]?.avg_solar_radiation_mj_m2
			: null;

		const avgWindSpeed = isValidArray(dataSets?.avgWindSpeed)
			? dataSets.avgWindSpeed[0]?.avg_wind_speed_2m
			: null;

		return {
			maxTemp,
			minTemp,
			avgHumidity,
			precipSum,
			avgCo2,
			avgSolarRadiation,
			avgWindSpeed,
		};
	}, [dataSets, station]);

	const monthlyOverview = useMemo(() => [
		{
			data: {
				value: indicatorValues.maxTemp,
				subtitle: "Max Temperature",
			},
			range: [-35, 45],
			color: "primary",
			shape: "angular",
			suffix: "°C",
		},
		{
			data: {
				value: indicatorValues.minTemp,
				subtitle: "Min Temperature",
			},
			range: [-35, 45],
			color: "secondary",
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
		{
			data: {
				value: indicatorValues.avgCo2,
				subtitle: "Avg CO2",
			},
			range: [300, 800],
			color: "secondary",
			shape: "bullet",
			suffix: "ppm",
		},
		{
			data: {
				value: indicatorValues.avgSolarRadiation,
				subtitle: "Avg Solar Radiation",
			},
			range: [0, 30],
			color: "goldenrod",
			shape: "bullet",
			suffix: "MJ/m²",
		},
		{
			data: {
				value: indicatorValues.avgWindSpeed,
				subtitle: "Avg Wind Speed",
			},
			range: [0, 15],
			color: "primary",
			shape: "bullet",
			suffix: "m/s",
		},
	], [indicatorValues]);

	// Pre-compute chart data transformations
	const chartData = useMemo(() => ({
		// Time data
		timestamps: metrics.map((item) => item.timestamp) || [],

		// Temperature data
		maxTemp: metrics.map((item) => item.temp_max_c) || [],
		minTemp: metrics.map((item) => item.temp_min_c) || [],

		// Water data
		eto: metrics.map((item) => item.etp_mm) || [],
		rain: metrics.map((item) => item.rain_mm) || [],

		// Humidity data - now we only have a single humidity value
		humidity: metrics.map((item) => item.humidity_percent) || [],

		co2: metrics.map((item) => item.co2_ppm) || [],
		solarRadiation: metrics.map((item) => item.solar_radiation_mj_m2) || [],
		wind: metrics.map((item) => item.wind_speed_2m) || [],

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
			title: "Daily Wind Speed",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.wind,
					type: "scatter",
					mode: "lines+markers",
					title: "Wind Speed",
					color: "primary",
				},
			],
			xaxis: { title: "Days" },
			yaxis: { title: "Wind Speed (m/s)" },
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
			title: "Daily Humidity Evolution",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.humidity,
					type: "scatter",
					mode: "lines+markers",
					title: "Humidity",
					color: "third",
				},
			],
			xaxis: { title: "Days" },
			yaxis: { title: "Humidity (%)" },
		},
		{
			title: "Daily CO2 Levels",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.co2,
					type: "scatter",
					mode: "lines+markers",
					title: "CO2",
					color: "secondary",
				},
			],
			xaxis: { title: "Days" },
			yaxis: { title: "CO2 (ppm)" },
		},
		{
			title: "Daily Solar Radiation",
			data: [
				{
					x: chartData.timestamps,
					y: chartData.solarRadiation,
					type: "scatter",
					mode: "lines+markers",
					title: "Solar Radiation",
					color: "goldenrod",
				},
			],
			xaxis: { title: "Days" },
			yaxis: { title: "Solar Radiation (MJ/m²)" },
		},
		{
			title: "Monthly Precipitation Per Field",
			data: isValidArray(dataSets.precipitationSum)
				? [
					{
						labels: STATIONS.map((item) => item.text),
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
											scrollZoom
											showLegend={index === 0 || index === 2}
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
								showLegend={card.data.length > 1} // Show legend only when data has more than 1 element
								data={card.data}
								title={dateRange.month === undefined
									? "" : `${monthNames[dateRange.month].text} ${dateRange.year}`}
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

export default memo(LOFS);
