import { Grid } from "@mui/material";
import { memo, useRef, useMemo, useState, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import StickyBand from "../components/StickyBand.js";
import useInit from "../utils/screen-init.js";
import lofsConfigs, { organization } from "../config/LofsConfig.js";
import { getCustomDateTime, getMonthDetails, isValidArray } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";

const STATIONS = ["Station 44", "Station 53", "Station 85"];
const customDate = getCustomDateTime(2024, 10);

const LOFS = () => {
	const [dateRange, setDateRange] = useState(
		() => getMonthDetails(customDate.getMonth(), customDate.getFullYear()).dateRange,
	);
	const [station, setStation] = useState(STATIONS[0]);

	const handleMonthChange = useCallback((newValue) => {
		if (!newValue?.$d) return;

		const newMonth = newValue.$d.getMonth();
		const newYear = newValue.$d.getFullYear();

		setDateRange(getMonthDetails(newMonth, newYear).dateRange);
	}, []);

	const handleStationChange = useCallback((event) => {
		setStation(event.target.value);
	}, []);

	const dropdownContent = useMemo(() => [{
		id: "Station",
		size: "small",
		label: "Select Station",
		value: station,
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
	], [handleMonthChange]);

	const fetchConfigs = useMemo(() => (lofsConfigs(station, dateRange.startDate, dateRange.endDate)),
		[station, dateRange.startDate, dateRange.endDate]);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);

	const getFirstValue = useCallback((dataSet, key) => (isValidArray(dataSet) ? dataSet[0]?.[key] ?? null : null),
		[]);

	const indicatorValues = useMemo(() => ({
		maxTemp: getFirstValue(dataSets?.maxTemperature, "max_temp_max_c"),
		minTemp: getFirstValue(dataSets?.minTemperature, "min_temp_min_c"),
		avgHumidity: getFirstValue(dataSets?.avgHumidity, "avg_humidity_percent"),
		precipSum: isValidArray(dataSets?.precipitationSum)
			? dataSets.precipitationSum.find((item) => item.key === station)?.sum_rain_mm ?? null
			: null,
		avgCo2: getFirstValue(dataSets?.avgCo2, "avg_co2_ppm"),
		avgSolarRadiation: getFirstValue(dataSets?.avgSolarRadiation, "avg_solar_radiation_mj_m2"),
		avgWindSpeed: getFirstValue(dataSets?.avgWindSpeed, "avg_wind_speed_2m"),
	}), [dataSets, station, getFirstValue]);

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
	const chartData = useMemo(() => {
		const initialStructure = {
			timestamps: [],
			maxTemp: [],
			minTemp: [],
			eto: [],
			rain: [],
			humidity: [],
			co2: [],
			solarRadiation: [],
			wind: [],
		};

		if (!isValidArray(metrics)) { return initialStructure; }

		return metrics.reduce((acc, item) => {
			acc.timestamps.push(item.timestamp);
			acc.maxTemp.push(item.temp_max_c);
			acc.minTemp.push(item.temp_min_c);
			acc.eto.push(item.etp_mm);
			acc.rain.push(item.rain_mm);
			acc.humidity.push(item.humidity_percent);
			acc.co2.push(item.co2_ppm);
			acc.solarRadiation.push(item.solar_radiation_mj_m2);
			acc.wind.push(item.wind_speed_2m);
			return acc;
		}, initialStructure);
	}, [metrics]);

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
			showLegend: true,
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
			showLegend: false,
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
			showLegend: true,
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
			showLegend: false,
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
			showLegend: false,
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
			showLegend: false,
			yaxis: { title: "Solar Radiation (MJ/m²)" },
		},
		{
			title: "Monthly Precipitation Per Field",
			data: isValidArray(dataSets.precipitationSum)
				? [
					{
						labels: STATIONS,
						values: dataSets.precipitationSum
							.filter((item) => !item.key.includes("'"))
							.map((item) => item.sum_rain_mm),
						type: "pie",
						hovertemplate: "<b>%{label}</b> "
							+ "<br>%{value} mm"
							+ "<br>(%{percent})"
							+ "<extra></extra>",
					},
				] : [{ labels: [], values: [], type: "pie" }],
		},
	], [chartData, dataSets.precipitationSum]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
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
										<DataWarning
											message={`No Data Available on ${plotData.data.subtitle} for the selected month`}
											minHeight={plotData.shape === "bullet" ? "120px" : "200px"}
										/>
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
				<Grid key={index} item xs={12} sm={12} md={index === charts.length - 1 ? 12 : 6} mb={index === charts.length - 1 ? 1 : 0}>
					<Card title={card.title} footer={cardFooter({ minutesAgo })}>
						{isLoading ? (<LoadingIndicator minHeight="300px" />
						) : isValidArray(metrics) ? (
							<Plot
								scrollZoom
								showLegend={card.showLegend}
								data={card.data}
								height="300px"
								yaxis={card.yaxis}
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
