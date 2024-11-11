import { Grid } from "@mui/material";
import { memo, useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
// import Form from "../components/Form.js";
import { useSnackbar } from "../utils/index.js";
import fetchAllData from "../api/fetch-data.js";
import randomDataGauge, { ecoVitallConfigs, randomDataRadial, organization } from "../config/EcoVitallConfig.js";
// import colors from "../_colors.scss";
import { initialState, reducer, calculateDates } from "../utils/data-handling-functions.js";
import { cardFooter } from "../utils/card-footer.js";

const EcoVItaLl = () => {
	const { success, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);

	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { year, month, currentDate, formattedBeginningOfMonth, formattedBeginningOfHour } = useMemo(calculateDates, []);

	// Add one hour to formattedBeginningOfHour
	const oneHourLater = useMemo(() => {
		const date = new Date(formattedBeginningOfHour);
		date.setHours(date.getHours() + 1);
		return date.toISOString().slice(0, 19);
	}, [formattedBeginningOfHour]);

	const fetchConfigs = useMemo(
		() => ecoVitallConfigs(formattedBeginningOfMonth, currentDate, formattedBeginningOfHour, oneHourLater),
		[formattedBeginningOfMonth, currentDate, formattedBeginningOfHour, oneHourLater],
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
					title: "Maximum EC Monitoring",
					data: [
						{
							x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
							y: state.dataSets.precipitation ? state.dataSets.precipitation.filter((item) => item.key === "field1").map((item) => item.avg_precipitation) : [],
							type: "bar",
							title: "Field 1",
							color: "primary",
						},
						{
							x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
							y: state.dataSets.precipitation ? state.dataSets.precipitation.filter((item) => item.key === "field2").map((item) => item.avg_precipitation) : [],
							type: "bar",
							title: "Field 2",
							color: "secondary",
						},
						{
							x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
							y: state.dataSets.precipitation ? state.dataSets.precipitation.filter((item) => item.key === "field3").map((item) => item.avg_precipitation) : [],
							type: "bar",
							title: "Field 3",
							color: "third",
						},
						{
							x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
							y: state.dataSets.precipitation ? state.dataSets.precipitation.filter((item) => item.key === "field4").map((item) => item.avg_precipitation) : [],
							type: "bar",
							title: "Field 4",
							color: "green",
						},
					],
					yaxis: { title: "Precipitation (mm)" },
				},
			].map((plot, index) => (
				<Grid key={index} item xs={12} sm={12} md={12} mt={4}>
					<Card title={plot.title} footer={cardFooter({ minutesAgo: state.minutesAgo })}>
						<Grid container flexDirection="row" sx={{ position: "relative", width: "100%" }}>
							<Grid item sx={{ position: "relative", width: "75%", zIndex: 1 }}>
								<Plot
									scrollZoom
									data={plot.data}
									showLegend={false}
									yaxis={plot.yaxis}
								/>
							</Grid>
						</Grid>
					</Card>
				</Grid>
			))}
			{Object.keys(randomDataGauge).map((key) => (
				<Grid key={key} item xs={12} md={6}>
					<Card
						title={randomDataGauge[key].title}
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
