import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import useInit from "../utils/screen-init.js";
import thallaConfigs, { organization } from "../config/EcoReadyMasuriaConfig.js";
import { calculateDates, debounce } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator } from "../utils/rendering-items.js";

const THALLA = () => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [region, setRegion] = useState(null);

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 1800), // Reduced from 2700ms to 800ms
		[],
	);

	const handleRegionChange = useCallback((newValue) => {
		setRegion(newValue);
	}, []);

	const handleDateChange = useCallback((newValue, setter) => {
		if (!newValue?.$d) return;

		// Immediate visual feedback
		setter(newValue.$d);
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	const formRefRegion = useRef();

	const formContentRegion = useMemo(() => [
		{
			customType: "dropdown",
			id: "region",
			size: "small",
			width: "200px",
			height: "40px",
			color: "primary",
			label: "Region:",
			items: [
				{ value: "AMFISSA", text: "Amfissa" },
				{ value: "EVOIA", text: "Evoia" },
				{ value: "LARISA", text: "Larisa" },
				{ value: "LAMIA", text: "Lamia" },
				{ value: "THIVA", text: "Thiva" },
			],
			defaultValue: "AMFISSA",
			onChange: (newValue) => handleRegionChange(newValue),
		},

	], [handleRegionChange]);

	const formRefDate = useRef();

	const formContentDate = useMemo(() => [
		{
			customType: "date-picker",
			id: "start",
			width: "210px",
			type: "desktop",
			label: "From:",
			sublabel: "Start date",
			background: "primary",
			value: startDate,
			labelPosition: "side",
			labelSize: 12,
			onChange: (newValue) => handleDateChange(newValue, setStartDate),
		},
		{
			customType: "date-picker",
			id: "end",
			width: "210px",
			type: "desktop",
			label: "To:",
			sublabel: "End date",
			background: "primary",
			value: endDate,
			labelPosition: "side",
			labelSize: 12,
			onChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [startDate, endDate, handleDateChange]);

	const isValidDateRange = useMemo(() => startDate && endDate && new Date(startDate) <= new Date(endDate), [startDate, endDate]);

	const fetchConfigs = useMemo(
		() => (isValidDateRange ? thallaConfigs(region, startDate, endDate) : null),
		[isValidDateRange, region, startDate, endDate],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets } = state;
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
	const isValidData = useMemo(() => metrics.length > 0, [metrics]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid container display="flex" direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} xs={6} md={2} mt={1}>
					<Form ref={formRefRegion} content={formContentRegion} />
				</Grid>
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} xs={6} md={2} mt={1}>
					<Form ref={formRefDate} content={formContentDate} />
				</Grid>
			</Grid>
			{isLoading ? (<LoadingIndicator />
			) : (
				[
					{
						title: "Temperature Evolution Per Day",
						data: [
							{
								x: isValidData ? metrics.map((item) => item.timestamp) : [],
								y: isValidData ? metrics.map((item) => item.max_temperature) : [],
								type: "bar",
								title: "Max",
								color: "primary",
							},
							{
								x: isValidData ? metrics.map((item) => item.timestamp) : [],
								y: isValidData ? metrics.map((item) => item.mean_temperature) : [],
								type: "bar",
								title: "Avg",
								color: "secondary",
							},
							{
								x: isValidData ? metrics.map((item) => item.timestamp) : [],
								y: isValidData ? metrics.map((item) => item.min_temperature) : [],
								type: "bar",
								title: "Min",
								color: "third",
							},
						],
						xaxis: { title: "Days" },
						yaxis: { title: "Temperature (°C)" },
					},
					// {
					// 	title: "Air Temperature Vs Pressure Correlation",
					// 	data: [
					// 		{
					// 			x: isValidData ? metrics.map((item) => item.timestamp) : [],
					// 			y: isValidData ? metrics.map((item) => item.air_temperature_avg * 100) : [],
					// 			type: "scatter",
					// 			mode: "lines",
					// 			title: "Avg Temperature / 100",
					// 			color: "secondary",
					// 		},
					// 		{
					// 			x: isValidData ? metrics.map((item) => item.timestamp) : [],
					// 			y: isValidData ? metrics.map((item) => item.air_pressure) : [],
					// 			type: "scatter",
					// 			mode: "lines",
					// 			title: "Air Pressure",
					// 			color: "third",
					// 		},
					// 	],
					// 	xaxis: { title: "Days" },
					// // yaxis: { title: "Temperature (°C)" },
					// },
					// {
					// 	title: "Air Temperature Vs Humidity Correlation",
					// 	data: [
					// 		{
					// 			x: isValidData ? metrics.map((item) => item.timestamp) : [],
					// 			y: isValidData ? metrics.map((item) => item.air_temperature_avg * 10) : [],
					// 			type: "scatter",
					// 			mode: "lines",
					// 			title: "Avg Temperature / 10",
					// 			color: "secondary",
					// 		},
					// 		{
					// 			x: isValidData ? metrics.map((item) => item.timestamp) : [],
					// 			y: isValidData ? metrics.map((item) => item.air_humidity) : [],
					// 			type: "scatter",
					// 			mode: "lines",
					// 			title: "Air Pressure",
					// 			color: "third",
					// 		},
					// 	],
					// 	xaxis: { title: "Days" },
					// // yaxis: { title: "Temperature (°C)" },
					// },
					// {
					// 	title: "Air Pressure Vs Humidity Correlation",
					// 	data: [
					// 		{
					// 			x: isValidData ? metrics.map((item) => item.timestamp) : [],
					// 			y: isValidData ? metrics.map((item) => item.air_pressure) : [],
					// 			type: "scatter",
					// 			mode: "lines",
					// 			title: "Air Pressure",
					// 			color: "primary",
					// 		},
					// 		{
					// 			x: isValidData ? metrics.map((item) => item.timestamp) : [],
					// 			y: isValidData ? metrics.map((item) => item.air_humidity * 10) : [],
					// 			type: "scatter",
					// 			mode: "lines",
					// 			title: "Air Pressure / 10",
					// 			color: "third",
					// 		},
					// 	],
					// 	xaxis: { title: "Days" },
					// // yaxis: { title: "Temperature (°C)" },
					// },
					// {
					// 	title: "Complete Overview",
					// 	data: [
					// 		{
					// 			x: isValidData ? metrics.map((item) => item.timestamp) : [],
					// 			y: isValidData ? metrics.map((item) => item.air_temperature_max * 100) : [],
					// 			type: "bar",
					// 			title: "Max Temperature / 100",
					// 			color: "secondary",
					// 		},
					// 		{
					// 			x: isValidData ? metrics.map((item) => item.timestamp) : [],
					// 			y: isValidData ? metrics.map((item) => item.air_pressure) : [],
					// 			type: "scatter",
					// 			mode: "lines",
					// 			title: "Air Pressure",
					// 			color: "primary",
					// 		},
					// 		{
					// 			x: isValidData ? metrics.map((item) => item.timestamp) : [],
					// 			y: isValidData ? metrics.map((item) => item.air_humidity * 10) : [],
					// 			type: "scatter",
					// 			mode: "lines",
					// 			title: "Air Pressure / 10",
					// 			color: "third",
					// 		},
					// 	],
					// 	xaxis: { title: "Days" },
					// // yaxis: { title: "Temperature (°C)" },
					// },
				].map((card, index) => (
					<Grid key={index} item xs={12} sm={12} md={6}>
						<Card title={card.title} footer={cardFooter({ minutesAgo: state.minutesAgo })}>
							<Plot
								scrollZoom
								data={card.data}
								// showLegend={index === 0}
								height="300px"
								xaxis={card.xaxis}
								yaxis={card.yaxis}
							/>
						</Card>
					</Grid>
				))
			)}
		</Grid>
	);
};

export default memo(THALLA);
