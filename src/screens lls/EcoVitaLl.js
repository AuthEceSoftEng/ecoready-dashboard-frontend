import { Grid } from "@mui/material";
import { memo, useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
// import Form from "../components/Form.js";
import { useSnackbar } from "../utils/index.js";
import fetchAllData from "../api/fetch-data.js";
import { ecoVitallConfigs, randomDataRadial, organization } from "../config/EcoVitallConfig.js";
import { initialState, reducer, calculateDates,
	getCustomDateTime, monthNames } from "../utils/data-handling-functions.js";
import { cardFooter } from "../utils/card-footer.js";

const EcoVItaLl = () => {
	const { success, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);
	const customDate = useMemo(() => getCustomDateTime(2024, 9), []);
	console.log("Custom Date", customDate);

	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { month, currentDate, formattedBeginningOfMonth, formattedBeginningOfHour } = useMemo(() => calculateDates(customDate),
		[customDate]);
	console.log("currentDate", currentDate);
	console.log("formattedBeginningOfHour", formattedBeginningOfHour);
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
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2} sx={{ flexGrow: 1, flexBasis: "100%", flexShrink: 0 }}>
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
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={12} mt={2}>
					<Card title={card.title} footer={cardFooter({ minutesAgo: state.minutesAgo })}>
						<Plot
							scrollZoom
							displayBar
							data={card.data}
							title={monthNames[month].text}
							showLegend={index === 1}
							xaxis={card.xaxis}
							yaxis={card.yaxis}
						/>
					</Card>
				</Grid>
			))}
			{[
				{
					min: 0,
					max: 14,
					value: state.dataSets.ph_avg && state.dataSets.ph_avg.length > 0 ? state.dataSets.ph_avg[0].avg_ph : null,
					symbol: "",
					title: "pH Target",
				},
				{
					min: 0,
					max: 5,
					value: state.dataSets.ec_avg && state.dataSets.ec_avg.length > 0 ? state.dataSets.ec_avg[0].avg_ec : null,
					symbol: "",
					title: "EC Target",
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} md={6}>
					<Card
						title={card.title}
						footer={cardFooter({ minutesAgo: state.minutesAgo })}
					>
						<Plot
							showLegend
							scrollZoom
							// width="113%"
							height="120px"
							data={[
								{
									type: "indicator",
									mode: "gauge+number",
									value: card.value,
									range: [card.min, card.max], // Gauge range
									color: "third", // Color of gauge bar
									shape: "bullet", // "angular" or "bullet"
									indicator: "primary", // Color of gauge indicator/value-line
									textColor: "primary", // Color of gauge value
									suffix: card.symbol, // Suffix of gauge value
								},
							]}
							displayBar={false}
							title={`${monthNames[month].text}'s Average`}
							margin={{ r: 0 }}
						/>
					</Card>
				</Grid>
			))}
			{[
				{
					title: "Tank Monitoring",
					data: [
						{
							subtitle: "Tank Level",
							min: 0,
							max: 100,
							value: state.dataSets.gauges && state.dataSets.gauges.length > 0
								? state.dataSets.gauges.at(-1).nutrienttanklevel
								: null,
							symbol: "%",
						},
						{
							subtitle: "Pump Pressure",
							min: 0,
							max: 1.5,
							value: state.dataSets.gauges && state.dataSets.gauges.length > 0
								? state.dataSets.gauges.at(-1).pumppressure
								: null,
							symbol: "psi",
						},
					],
					color: "third",
				},
				{
					title: "Nutrient Monitoring",
					data: [
						{
							min: 0,
							max: 3.5,
							value: state.dataSets.gauges && state.dataSets.gauges.length > 0 ? state.dataSets.gauges.at(-1).ec : null,
							symbol: "mS",
							subtitle: "EC",
						},
						{
							min: 0,
							max: 10,
							value: state.dataSets.gauges && state.dataSets.gauges.length > 0 ? state.dataSets.gauges.at(-1).ph : null,
							symbol: "",
							subtitle: "Ph",
						},
					],
					color: "secondary",
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} md={6} justifyContent="center">
					<Card
						title={card.title}
						footer={cardFooter({ minutesAgo: state.minutesAgo })}
					>
						{card.data.map((plotData, plotIndex) => (
							<Plot
								key={plotIndex}
								showLegend
								scrollZoom
								height="400px"
								// width="113%"
								data={[
									{
										type: "indicator",
										mode: "gauge+number",
										value: plotData.value,
										range: [plotData.min, plotData.max], // Gauge range
										color: card.color, // Color of gauge bar
										shape: "angular", // "angular" or "bullet"
										indicator: "primary", // Color of gauge indicator/value-line
										textColor: "primary", // Color of gauge value
										suffix: plotData.symbol, // Suffix of gauge value
									},
								]}
								displayBar={false}
								title={plotData.subtitle}
							/>
						))}
					</Card>
				</Grid>
			))}
			<Grid item xs={12} md={12} mt={2}>
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
