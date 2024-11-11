import { Grid } from "@mui/material";
import { memo, useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
// import Form from "../components/Form.js";
import { useSnackbar } from "../utils/index.js";
import fetchAllData from "../api/fetch-data.js";
import randomDataGauge, { ecoVitallConfigs, randomDataRadial, organization } from "../config/EcoVitallConfig.js";
import { initialState, reducer, calculateDates, getCustomDateTime } from "../utils/data-handling-functions.js";
import { cardFooter } from "../utils/card-footer.js";

const EcoVItaLl = () => {
	const { success, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);
	const customDate = useMemo(() => getCustomDateTime(2024, 9), []);
	console.log("Custom Date", customDate);

	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { month, currentDate, formattedBeginningOfMonth, formattedBeginningOfHour } = useMemo(() => calculateDates(customDate),
		[customDate]);
	console.log("Beginning of set Month", formattedBeginningOfMonth);
	console.log("Beginning of set Hour", formattedBeginningOfHour);

	const monthNames = [
		{ value: "January", text: "January" },
		{ value: "February", text: "February" },
		{ value: "March", text: "March" },
		{ value: "April", text: "April" },
		{ value: "May", text: "May" },
		{ value: "June", text: "June" },
		{ value: "July", text: "July" },
		{ value: "August", text: "August" },
		{ value: "September", text: "September" },
		{ value: "October", text: "October" },
		{ value: "November", text: "November" },
		{ value: "December", text: "December" },
	];
	// // Add one hour to formattedBeginningOfHour
	// const oneHourLater = useMemo(() => {
	// 	const date = new Date(formattedBeginningOfHour);
	// 	date.setHours(date.getHours() + 1);
	// 	return date.toISOString().slice(0, 19);
	// }, [formattedBeginningOfHour]);

	const fetchConfigs = useMemo(
		() => ecoVitallConfigs(formattedBeginningOfMonth, currentDate, formattedBeginningOfHour),
		[formattedBeginningOfMonth, currentDate, formattedBeginningOfHour],
	);
	// Use refs for stable references
	const successRef = useRef(success);
	const errorRef = useRef(error);

	useEffect(() => {
		successRef.current = success;
		errorRef.current = error;
	}, [success, error]);

	// Function to fetch and update data
	const updateData = useCallback(async () => {
		try {
			await fetchAllData(dispatch, organization, fetchConfigs);
			successRef.current("All data fetched successfully");
		} catch (error_) {
			errorRef.current(`Error fetching data: ${error_.message}`);
		}
	}, [fetchConfigs]);

	useEffect(() => {
		// Set interval for updating "minutesAgo"
		const minutesAgoInterval = setInterval(() => {
			dispatch({ type: "UPDATE_MINUTES_AGO" });
		}, 60 * 1000);

		// Fetch data immediately and set fetch interval
		updateData();
		const fetchInterval = setInterval(updateData, 30 * 60 * 1000);

		return () => {
			clearInterval(minutesAgoInterval);
			clearInterval(fetchInterval);
		};
	}, [updateData]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			{[
				{
					title: "Temperature Evolution Per Day",
					data: [
						{
							x: state.dataSets.temperature
								? state.dataSets.temperature.map((item) => item.interval_start)
								: [],
							y: state.dataSets.temperature
								? state.dataSets.temperature
									.map((item) => item.avg_envtemp) : [],
							type: "bar",
							title: "Temperature",
							color: "secondary",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Temperature (°C)" },
					subtitle: monthNames[month].text,
				},
				{
					title: "Humidity Range Per Day",
					data: [
						{
							x: state.dataSets.humidity_min
								? state.dataSets.humidity_min.map((item) => item.interval_start)
								: [],
							y: state.dataSets.humidity_min
								? state.dataSets.humidity_min
									.map((item) => item.min_humidity) : [],
							type: "line",
							title: "Min",
							color: "third",
						},
						{
							x: state.dataSets.humidity_max
								? state.dataSets.humidity_max.map((item) => item.interval_start)
								: [],
							y: state.dataSets.humidity_max
								? state.dataSets.humidity_max
									.map((item) => item.max_humidity) : [],
							type: "line",
							title: "Max",
							color: "primary",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Humidity (%)" },
					subtitle: monthNames[month].text,
				},
			].map((plot, index) => (
				<Grid key={index} item xs={12} sm={12} md={12} mt={2}>
					<Card title={plot.title} footer={cardFooter({ minutesAgo: state.minutesAgo })}>
						<Plot
							scrollZoom
							displayBar
							data={plot.data}
							title={plot.subtitle}
							showLegend={false}
							xaxis={plot.xaxis}
							yaxis={plot.yaxis}
						/>
					</Card>
				</Grid>
			))}
			{Object.keys(randomDataGauge).map((key) => (
				<Grid key={key} item xs={12} md={6}>
					<Card
						title={randomDataGauge[key].title}
						footer={cardFooter({ minutesAgo: state.minutesAgo })}
					>
						<Plot
							showLegend
							scrollZoom
							height={randomDataGauge[key]?.value ? "100px" : "100%"}
							data={[
								{
									type: "indicator",
									mode: "gauge+number",
									value: // If no value exists, generate a random value between min and max
										randomDataGauge[key].value
										|| Math.random() * (randomDataGauge[key].max - randomDataGauge[key].min) + randomDataGauge[key].min,
									range: [randomDataGauge[key].min, randomDataGauge[key].max], // Gauge range
									color: "third", // Color of gauge bar
									shape: randomDataGauge[key]?.value ? "bullet" : "angular", // "angular" or "bullet"
									indicator: "primary", // Color of gauge indicator/value-line
									textColor: "primary", // Color of gauge value
									suffix: randomDataGauge[key].symbol, // Suffix of gauge value
								},
							]}
							displayBar={false}
						/>
					</Card>
				</Grid>
			))}
			<Grid item xs={12} md={12} mt={4}>
				<Card
					title="Sensory Analysis of Leafy Greens"
					footer={cardFooter({ minutesAgo: state.minutesAgo })}
				>
					<Plot
						showLegend
						scrollZoom
						data={Object.keys(randomDataRadial).map((key, ind) => ({
							type: "scatterpolar",
							r: Object.values(randomDataRadial[key]),
							theta: Object.keys(randomDataRadial[key]),
							fill: "toself",
							color: ["primary", "secondary", "third"][ind],
							title: key,
						}))}
						polarRange={[0, 1]}
						displayBar={false}
					/>
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(EcoVItaLl);
