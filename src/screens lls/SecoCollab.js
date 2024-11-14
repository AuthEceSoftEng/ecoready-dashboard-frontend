import { Grid } from "@mui/material";
import { memo, useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import { useSnackbar } from "../utils/index.js";
import fetchAllData from "../api/fetch-data.js";
import secoConfigs, { organization } from "../config/SecoConfig.js";
import { initialState, reducer, sumByKey, groupByKey,
	getMaxValuesByProperty, getSumValuesByProperty, calculateDates } from "../utils/data-handling-functions.js";
import monthNames from "../utils/useful-constants.js";
import { cardFooter } from "../utils/card-footer.js";

const SecoCollab = () => {
	const { success, error } = useSnackbar();
	const [state, dispatch] = useReducer(reducer, initialState);

	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { year, month, currentDate, formattedBeginningOfMonth } = useMemo(calculateDates, []);

	const fetchConfigs = useMemo(
		() => secoConfigs(formattedBeginningOfMonth, currentDate),
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
			await fetchAllData(dispatch, organization, fetchConfigs); // accessKey,
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

	const formRef = useRef();
	const formContent = [

		{ customType: "dropdown",
			id: "time period sort",
			label: "Sort By:",
			items: [
				{ value: "Week", text: "Week" },
				{ value: "Month", text: "Month" },
				{ value: "Year", text: "Year" },
			],
			// value,
			defaultValue: "Month",
			onChange: (event) => {
				console.log(`Status changed to ${event.target.value}`);
			},
		},
		{
			customType: "date-picker",
			id: "from",
			type: "desktop",
			label: "From:",
			background: "grey",
		},
		{
			customType: "date-picker",
			id: "to",
			type: "desktop",
			label: "To:",
			background: "grey",
		},
	];

	// Calculate annual yield if dataSets['cropYield'] exists
	const annualYield = state.dataSets.cropYield ? state.dataSets.cropYield.reduce((sum, item) => sum + item.crop_yield, 0).toFixed(2) : "N/A";
	const sumsByField = useMemo(() => (
		state.dataSets.cropYield ? sumByKey(state.dataSets.cropYield, "key", "crop_yield") : {}
	), [state.dataSets.cropYield]);

	const groupedSoilQuality = useMemo(() => (
		state.dataSets.soilQuality ? groupByKey(state.dataSets.soilQuality, "key") : {}
	), [state.dataSets.soilQuality]);

	const groupedSoilMoisture = useMemo(() => (
		state.dataSets.soilMoisture ? groupByKey(state.dataSets.soilMoisture, "interval_start") : {}
	), [state.dataSets.soilMoisture]);

	const maxSoilMoistureByDate = useMemo(() => (
		getMaxValuesByProperty(groupedSoilMoisture, "max_soil_moisture")
	), [groupedSoilMoisture]);

	const groupedHumidity = useMemo(() => (
		state.dataSets.humidity ? groupByKey(state.dataSets.humidity, "interval_start") : {}
	), [state.dataSets.humidity]);

	const maxHumidityByDate = useMemo(() => (
		getMaxValuesByProperty(groupedHumidity, "max_humidity")
	), [groupedHumidity]);

	const groupedYieldDistribution = useMemo(() => (
		state.dataSets.yieldDistribution ? groupByKey(state.dataSets.yieldDistribution, "interval_start") : {}
	), [state.dataSets.yieldDistribution]);

	const sumYieldDistribution = useMemo(() => (
		getSumValuesByProperty(groupedYieldDistribution, "sum_crop_yield")
	), [groupedYieldDistribution]);
	console.log("Grouped Distribution:", Object.keys(sumYieldDistribution));

	// Calculate percentages
	const percentages = useMemo(() => {
		if (annualYield === "N/A") return [];

		return Object.keys(sumsByField).map((key) => ({
			key,
			percentage: ((sumsByField[key] / annualYield) * 100).toFixed(2),
		}));
	}, [annualYield, sumsByField]);

	const generate2024Months = useMemo(() => {
		const months = [];
		for (let mnth = 0; mnth < 12; mnth++) {
			const date = new Date(2024, mnth, 2);
			months.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
		}

		return months;
	}, []);

	const tickvals = generate2024Months;

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid item xs={12} md={12} alignItems="center" flexDirection="column" mt={2}>
				<Card title="Overview" footer={cardFooter({ minutesAgo: state.minutesAgo })}>
					{[
						{
							data: [
								{
									x: state.dataSets.overview ? state.dataSets.overview.map((item) => item.timestamp) : [],
									y: state.dataSets.overview ? state.dataSets.overview.map((item) => item.m_temp01) : [],
									type: "scatter",
									mode: "lines",
									color: "gold",
									title: "Temperature",
								},
							],
							yaxis: { title: "Temperature (°C)" },
						},
						{
							data: [
								{
									x: state.dataSets.overview ? state.dataSets.overview.map((item) => item.timestamp) : [],
									y: state.dataSets.overview ? state.dataSets.overview.map((item) => item.m_hum01) : [],
									type: "scatter",
									mode: "lines",
									color: "secondary",
									title: "Humidity",
								},
							],
							yaxis: { title: "Humidity (%)" },
						},
						{
							data: [
								{
									x: state.dataSets.overview ? state.dataSets.overview.map((item) => item.timestamp) : [],
									y: state.dataSets.overview ? state.dataSets.overview.map((item) => item.a_co2) : [],
									type: "scatter",
									mode: "markers",
									color: "primary",
									title: "Co2",
								},
							],
							yaxis: { title: "Co2" },
						},
					].map((plotData, index) => (
						<Plot
							key={index}
							scrollZoom
							data={plotData.data}
							displayBar={false}
							yaxis={plotData.yaxis}
						/>
					))}
				</Card>
			</Grid>
			<Grid item xs={12} md={12} alignItems="center" flexDirection="row" mt={2}>
				<Card title="Today's Overview" footer={cardFooter({ minutesAgo: state.minutesAgo })}>
					{[
						{
							data: [
								{
									x: state.dataSets.overview ? state.dataSets.overview.map((item) => item.timestamp) : [],
									y: state.dataSets.overview ? state.dataSets.overview.map((item) => item.m_temp01) : [],
									type: "scatter",
									mode: "lines",
									color: "gold",
									title: "Temperature",
								},
							],
							yaxis: { title: "Temperature (°C)" },
						},
						{
							data: [
								{
									x: state.dataSets.overview ? state.dataSets.overview.map((item) => item.timestamp) : [],
									y: state.dataSets.overview ? state.dataSets.overview.map((item) => item.m_hum01) : [],
									type: "scatter",
									mode: "lines",
									color: "secondary",
									title: "Humidity",
								},
							],
							yaxis: { title: "Humidity (%)" },
						},
						{
							data: [
								{
									x: state.dataSets.overview ? state.dataSets.overview.map((item) => item.timestamp) : [],
									y: state.dataSets.overview ? state.dataSets.overview.map((item) => item.a_co2) : [],
									type: "scatter",
									mode: "markers",
									color: "primary",
									title: "Co2",
								},
							],
							yaxis: { title: "Co2" },
						},
					].map((plotData, index) => (
						<Plot
							key={index}
							scrollZoom
							data={plotData.data}
							displayBar={false}
							yaxis={plotData.yaxis}
						/>
					))}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(SecoCollab);
