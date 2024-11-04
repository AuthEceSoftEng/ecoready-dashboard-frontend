import { Grid, Typography } from "@mui/material";
import { memo, useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import { useSnackbar } from "../utils/index.js";
import fetchAllData from "../api/fetch-data.js";
import agroConfigs from "../config/AgroConfig.js";
import colors from "../_colors.scss";
import { initialState, reducer, sumByKey, groupByKey,
	getMaxValuesByProperty, getSumValuesByProperty, calculateDates } from "../utils/data-handling-functions.js";

const AgroLab = () => {
	const { success, error } = useSnackbar();
	const accessKey = "d797e79f40385c2948de74ab6b07ebc336f5733da31ced691117fe7700ac22c8";
	const organization = "agrolab";
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

	// Form Parameters
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

	const monthIrrigation = state.dataSets.irrigation ? state.dataSets.irrigation.reduce((sum, item) => sum + item.irrigation, 0).toFixed(2) : "N/A";

	const meanTemp = state.dataSets.temperature_now ? (state.dataSets.temperature_now.reduce((sum, item) => sum + item.temperature, 0) / state.dataSets.temperature_now.length).toFixed(2) : "N/A";

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
			<Grid item xs={12} md={4} alignItems="center" flexDirection="column">
				<Card
					title="Annual Crop Yield"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${state.minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
						{`${annualYield} T`}
						<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
							<span style={{ color: colors.secondary }}>{"6%"}</span>
							{" "}
							{"increase from "}
							{year - 1}
						</Typography>
					</Typography>
				</Card>
			</Grid>
			<Grid item xs={12} md={4} alignItems="center" flexDirection="column">
				<Card
					title="Current Month's Irrigation"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${state.minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
						{`${monthIrrigation} Litres`}
						<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
							<span style={{ color: colors.error }}>{"10%"}</span>
							{" "}
							{"decrease since "}
							{monthNames[month - 1].text}
						</Typography>
					</Typography>
				</Card>
			</Grid>
			<Grid item xs={12} md={4} alignItems="center" flexDirection="column">
				<Card
					title="Temperature"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${state.minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold", textAlign: "center" }}>
						{`${meanTemp}°C`}
						<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
							<span style={{ color: colors.warning }}>{"Sunny"}</span>
							{" "}
							<span style={{ color: colors.third }}>{"skies"}</span>
							{" "}
							{"in your area"}
						</Typography>
					</Typography>
				</Card>
			</Grid>
			<Grid item xs={12} md={4} alignItems="center" flexDirection="column" mt={4}>
				<Card
					title="Harvest's Crop Yield Distribution"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${state.minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Plot
						scrollZoom
						data={[
							{
								x: Object.keys(groupedYieldDistribution),
								y: Object.values(sumYieldDistribution),
								type: "bar",
								title: "bar",
								color: "secondary",
							},
						]}
						// title="Total Crop Yield per Week during Harvest"
						showLegend={false}
						displayBar={false}
						height="400px"
						xaxis={{ tickvals: Object.keys(groupedYieldDistribution), tickangle: 15 }}
						yaxis={{ title: "Tonnes" }}
					/>
				</Card>
			</Grid>
			<Grid item xs={12} md={4} alignItems="center" flexDirection="column" mt={4}>
				<Card
					title="Month's Soil Moisture"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${state.minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					{maxSoilMoistureByDate && (
						<Plot
							scrollZoom
							data={[
								{
									x: Object.keys(maxSoilMoistureByDate),
									y: Object.values(maxSoilMoistureByDate),
									type: "scatter", // One of: scatter, bar, pie
									title: "scatter",
									mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "secondary",
								},
							]}
							title={`${monthNames[month].text}`}
							showLegend={false}
							displayBar={false}
							height="400px"
							xaxis={{
								// title: "Time of Day",
								tickangle: 15,
							}}
							yaxis={{
								title: "Soil Moisture (%)",
							}}
						/>
					)}
				</Card>
			</Grid>
			<Grid item xs={12} md={4} alignItems="center" flexDirection="column" mt={4}>
				<Card
					title="Month's Humidity"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${state.minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					{maxHumidityByDate && (
						<Plot
							scrollZoom
							data={[
								{
									x: Object.keys(maxHumidityByDate),
									y: Object.values(maxHumidityByDate),
									type: "scatter", // One of: scatter, bar, pie
									title: "scatter",
									mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "secondary",
								},
							]}
							title={`${monthNames[month].text}`}
							showLegend={false}
							displayBar={false}
							height="400px"
							xaxis={{
								// title: "Time of Day",
								tickangle: 15,
							}}
							yaxis={{
								title: "Humidity (%)",
							}}
						/>
					)}
				</Card>
			</Grid>
			<Grid item xs={12} md={12} mt={4}>
				<Card
					title="Annual Yield Per Field"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${state.minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Plot
						showLegend
						scrollZoom
						data={[
							{
								labels: percentages.map((item) => item.key),
								values: percentages.map((item) => item.percentage),
								type: "pie",
								title: "pie",
							},
						]}
						displayBar={false}
					/>
				</Card>
			</Grid>
			<Grid item xs={12} sm={12} md={6} mt={4}>
				<Card
					title="Seasonal Temperature Distribution"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${state.minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Grid container flexDirection="row" sx={{ position: "relative", width: "100%" }}>
						<Grid item sx={{ position: "relative", width: "85%", zIndex: 1 }}>
							<Plot
								scrollZoom
								data={[
									{
										y: state.dataSets.temperature_june ? state.dataSets.temperature_june.map((item) => item.temperature) : [],
										type: "box", // One of: scatter, bar, pie
										title: "June",
										color: "secondary",
									},
									{
										y: state.dataSets.temperature_july ? state.dataSets.temperature_july.map((item) => item.temperature) : [],
										type: "box", // One of: scatter, bar, pie
										title: "July",
										color: "secondary",
									},
									{
										y: state.dataSets.temperature_august ? state.dataSets.temperature_august.map((item) => item.temperature) : [],
										type: "box", // One of: scatter, bar, pie
										title: "August",
										color: "secondary",
									},
								]}
								title="Summer Time"
								showLegend={false}
								yaxis={{
									title: "Temperature (°C)",
								}}
							/>
						</Grid>
						<Grid
							item
							md={7}
							sx={{
								position: "absolute",
								top: 0,
								right: -85,
								width: "52%",
								height: "50%",
								zIndex: 10,

							}}
						>
							<Form ref={formRef} content={formContent.slice(1)} />
						</Grid>
					</Grid>
				</Card>
			</Grid>
			<Grid item xs={12} sm={12} md={6} mt={4}>
				<Card
					title="Precipitation"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${state.minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Grid container flexDirection="row" sx={{ position: "relative", width: "100%" }}>
						<Grid item sx={{ position: "relative", width: "90%", zIndex: 1 }}>
							<Plot
								scrollZoom
								data={[
									{
										x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
										y: (state.dataSets.precipitation ? state.dataSets.precipitation.filter((item) => item.key === "field1").map((item) => item.avg_precipitation) : []),
										type: "bar", // One of: scatter, bar, pie
										title: "Field 1",
										color: "primary",
									},
									{
										x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
										y: (state.dataSets.precipitation ? state.dataSets.precipitation.filter((item) => item.key === "field2").map((item) => item.avg_precipitation) : []),
										type: "bar", // One of: scatter, bar, pie
										title: "Field 2",
										color: "secondary",
									},
									{
										x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
										y: (state.dataSets.precipitation ? state.dataSets.precipitation.filter((item) => item.key === "field3").map((item) => item.avg_precipitation) : []),
										type: "bar",
										title: "Field 3",
										color: "third",
									},
									{
										x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
										y: (state.dataSets.precipitation ? state.dataSets.precipitation.filter((item) => item.key === "field4").map((item) => item.avg_precipitation) : []),
										type: "bar",
										title: "Field 4",
										color: "green",
									},
								]}
								title="Average Precipitation per Week"
								yaxis={{
									title: "Precipitation (mm)",
								}}
							/>
						</Grid>
						<Grid
							item
							md={7}
							sx={{
								position: "absolute",
								bottom: 0,
								right: -70,
								width: "52%",
								height: "50%",
								zIndex: 20,
								display: "grid",
							}}
						>
							<Form ref={formRef} content={formContent} />
						</Grid>
					</Grid>
				</Card>
			</Grid>
			<Grid item width="100%" mt={4}>
				<Card
					title="Soil Quality"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${state.minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					{groupedSoilQuality?.field1 && (
						<Plot
							scrollZoom
							data={[
								{
									x: groupedSoilQuality.field1.map((item) => item.interval_start),
									y: groupedSoilQuality.field1.map((item) => item.avg_soil_quality),
									texts: ["One", "Two", "Three"], // Text for each data point
									type: "scatter", // One of: scatter, bar, pie
									title: Object.keys(groupedSoilQuality)[0],
									mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "primary",
								},
								{
									x: groupedSoilQuality.field2.map((item) => item.interval_start),
									y: groupedSoilQuality.field2.map((item) => item.avg_soil_quality),
									texts: ["One", "Two", "Three"], // Text for each data point
									type: "scatter", // One of: scatter, bar, pie
									title: Object.keys(groupedSoilQuality)[1],
									mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "secondary",
								},
								{
									x: groupedSoilQuality.field3.map((item) => item.interval_start),
									y: groupedSoilQuality.field3.map((item) => item.avg_soil_quality),
									texts: ["One", "Two", "Three"], // Text for each data point
									type: "scatter", // One of: scatter, bar, pie
									title: Object.keys(groupedSoilQuality)[2],
									mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "third",
								},
								{
									x: groupedSoilQuality.field4.map((item) => item.interval_start),
									y: groupedSoilQuality.field4.map((item) => item.avg_soil_quality),
									texts: ["One", "Two", "Three"], // Text for each data point
									type: "scatter", // One of: scatter, bar, pie
									title: Object.keys(groupedSoilQuality)[3],
									mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "green",
								},
							]}
							title="Average Soil Quality per Month"
							xaxis={{
								tickvals,
								ticktext: tickvals.map((date) => new Date(date).toLocaleString("default", { month: "long" })), // Get full month name
							}}
							yaxis={{
								title: "Soil Quality",
							}}
						/>
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(AgroLab);
