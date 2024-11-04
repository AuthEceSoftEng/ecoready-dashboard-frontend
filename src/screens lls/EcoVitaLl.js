import { Grid } from "@mui/material";
import { memo, useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import { useSnackbar } from "../utils/index.js";
import fetchAllData from "../api/fetch-data.js";
import agroConfigs, { organization } from "../config/AgroConfig.js";
import colors from "../_colors.scss";
import { initialState, reducer, sumByKey, groupByKey,
	getMaxValuesByProperty, getSumValuesByProperty, calculateDates } from "../utils/data-handling-functions.js";

const EcoVItaLl = () => {
	const { success, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);

	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { year, month, currentDate, formattedBeginningOfMonth } = useMemo(calculateDates, []);

	const fetchConfigs = useMemo(
		() => agroConfigs(formattedBeginningOfMonth, currentDate),
		[formattedBeginningOfMonth, currentDate],
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
			await fetchAllData(dispatch, organization, accessKey, fetchConfigs);
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
	
	const randomDataGauge = {
		nutrientPH: {
			min: 0,
			max: 14,
			symbol: "pH",
			title: "Nutrient pH",
		},
		nutrientEC: {
			min: 0,
			max: 5,
			symbol: "mS",
			title: "Nutrient EC",
		},
		phTarget: {
			min: 0,
			max: 14,
			value: 5.9,
			symbol: "",
			title: "pH Target",
		},
		ecTarget: {
			min: 0,
			max: 5,
			value: 2.25,
			symbol: "",
			title: "EC Target",
		},
		nutrientTank: {
			min: 0,
			max: 100,
			symbol: "%",
			title: "Nutrient Tank",
		},
		nutrientTemperature: {
			min: 0,
			max: 40,
			symbol: "°C",
			title: "Nutrient Temperature",
		},
		roomTemperature1: {
			min: 0,
			max: 40,
			symbol: "°C",
			title: "Room Temperature 1",
		},
		roomTemperature2: {
			min: 0,
			max: 40,
			symbol: "°C",
			title: "Room Temperature 2",
		},
	};

	const randomDataRadial = {
		"Romain Lettuce": {
			Color: Math.random(),
			"Leaf Shape": Math.random(),
			Crunchiness: Math.random(),
			Tenderness: Math.random(),
			Bitterness: Math.random(),
			Sweetness: Math.random(),
			Umami: Math.random(),
			Freshness: Math.random(),
			Aftertaste: Math.random(),
		},
		"Butterhead Lettuce": {
			Color: Math.random(),
			"Leaf Shape": Math.random(),
			Crunchiness: Math.random(),
			Tenderness: Math.random(),
			Bitterness: Math.random(),
			Sweetness: Math.random(),
			Umami: Math.random(),
			Freshness: Math.random(),
			Aftertaste: Math.random(),
		},
		"Oak Leaf Lettuce": {
			Color: Math.random(),
			"Leaf Shape": Math.random(),
			Crunchiness: Math.random(),
			Tenderness: Math.random(),
			Bitterness: Math.random(),
			Sweetness: Math.random(),
			Umami: Math.random(),
			Freshness: Math.random(),
			Aftertaste: Math.random(),
		},
	};

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
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
