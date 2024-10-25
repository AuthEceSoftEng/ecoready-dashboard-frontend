import { Grid, Typography } from "@mui/material";
import { memo, useEffect, useState, useRef, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import { useSnackbar, fetchAllData } from "../utils/index.js";
import colors from "../_colors.scss";

const AgroLab = () => {
	const { success, error } = useSnackbar();
	const [dataSets, setDataSets] = useState({});
	const [pageRefreshTime, setPageRefreshTime] = useState(new Date());
	const [minutesAgo, setMinutesAgo] = useState(0);

	// Get the current year and month
	const now = new Date();
	const currentDate = now.toISOString().slice(0, 19);
	console.log("Current Date:", currentDate);
	const year = now.getFullYear();
	const month = now.getMonth();
	const day = now.getDate();

	const beginningOfMonth = new Date(year, month, 1);
	beginningOfMonth.setHours(beginningOfMonth.getHours() + 3); // acount for timezone
	const formattedBeginningOfMonth = beginningOfMonth.toISOString().slice(0, 19);
	console.log("Beginning of Month:", formattedBeginningOfMonth);

	const updateData = useCallback(() => {
		const accessKey = "******";
		const fetchConfigs = [
			{
				type: "data",
				organization: "agrolab",
				project: "wheat",
				collection: "yield_data",
				params: JSON.stringify({
					attributes: ["crop_yield"],
				}),
				plotId: "sum1",
			},
			{
				type: "data",
				organization: "agrolab",
				project: "wheat",
				collection: "sensor_iot_data",
				params: JSON.stringify({
					attributes: ["timestamp", "soil_moisture", "humidity"],
					filters: [
						{
							property_name: "timestamp",
							operator: "gte",
							property_value: `${formattedBeginningOfMonth}`,
						},
						{
							property_name: "timestamp",
							operator: "lte",
							property_value: `${currentDate}`,
						},
					],
					order_by: {
						field: "timestamp",
						order: "asc",
					},
				}),
				plotId: "plot1",
			},
			{
				type: "data",
				organization: "agrolab",
				project: "wheat",
				collection: "sensor_iot_data",
				params: JSON.stringify({
					attributes: ["timestamp", "soil_quality"],
					filters: [
						{
							property_name: "soil_quality",
							operator: "gte",
							property_value: 0.2,
						},
						{
							property_name: "soil_quality",
							operator: "lte",
							property_value: 0.8,
						},
					],
					order_by: {
						field: "timestamp",
						order: "asc",
					},
				}),
				plotId: "plot2",
			},
			// Add more configurations here as needed
		];

		fetchAllData(fetchConfigs, accessKey, setDataSets, setPageRefreshTime, success, error);
	}, [error, formattedBeginningOfMonth, success]);

	// Set data update interval and reset last update timer when new data is fetched
	useEffect(() => {
		const updateMinutesAgo = () => {
			setMinutesAgo(Math.floor((Date.now() - pageRefreshTime) / 60_000));
		};

		// Fetch data on component mount and set an interval to fetch every 30 minutes
		updateData(); // Fetch immediately on mount
		const fetchInterval = setInterval(updateData, 30 * 60 * 1000); // Fetch data every 30 minutes

		// Set interval to show minutes since last update
		const minutesAgoInterval = setInterval(updateMinutesAgo, 60 * 1000); // Update every 1 minute

		// Cleanup intervals on unmount
		return () => {
			clearInterval(fetchInterval);
			clearInterval(minutesAgoInterval);
		};
	}, [updateData]);

	// Get the number of days in the current month
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const monthsInYear = 12;

	// Generate ten random percentages that sum up to 100%
	const generateRandomPercentages = (num) => {
		const arr = Array.from({ length: num }, () => Math.random());
		const sum = arr.reduce((a, b) => a + b, 0);
		return arr.map((value) => (value / sum) * 100);
	};

	const generateRandomNumbers = (length, min = 0, max = 1) => Array.from({ length }, () => (Math.random() * (max - min)) + min);

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
	// const [value, setValue] = useState("");

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

	// Calculate annual yield if dataSets['sum1'] exists
	const annualYield = dataSets.sum1 ? dataSets.sum1.reduce((sum, item) => sum + item.crop_yield, 0).toFixed(2) : "N/A";

	const generate2024Months = () => {
		const months = [];
		for (let mnth = 0; mnth < 12; mnth++) {
			const date = new Date(2024, mnth, 2);
			months.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
		}

		return months;
	};

	const tickvals = generate2024Months();
	console.log("Tickvals:", tickvals);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid item xs={12} md={4} alignItems="center" flexDirection="column">
				<Card
					title="Annual Crop Yield"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
						{`${annualYield} T`}
						<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
							<span style={{ color: colors.secondary }}>{"6%"}</span>
							{" "}
							{"increase from"}
							{year - 1}
						</Typography>
					</Typography>
				</Card>
			</Grid>
			<Grid item xs={12} md={4} alignItems="center" flexDirection="column">
				<Card
					title="Monthly Irrigation"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
						{`${Math.floor(Math.random() * 500) + 300} Litres`}
						<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
							<span style={{ color: colors.error }}>{"10%"}</span>
							{" "}
							{"decrease since last"}
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
								{`🕗 updated ${minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold", textAlign: "center" }}>
						{`${Math.floor(Math.random() * 10) + 20}°C`}
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
					title="Monthly Crop Yield Distribution"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Plot
						scrollZoom
						data={[
							{
								x: Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`),
								y: generateRandomNumbers(4, 25, 35),
								type: "bar",
								title: "bar",
								color: "secondary",
							},
						]}
						title="Total Crop Yield per Week"
						showLegend={false}
						displayBar={false}
						height="400px"
						yaxis={{ title: "Tonnes" }}
					/>
				</Card>
			</Grid>
			<Grid item xs={12} md={4} alignItems="center" flexDirection="column" mt={4}>
				<Card
					title="Soil Moisture"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					{dataSets.plot1 && (
						<Plot
							scrollZoom
							data={[
								{
									x: dataSets.plot1.map((item) => item.timestamp), // generateHoursUntilNow()
									y: dataSets.plot1.map((item) => item.soil_moisture), // Example y values
									type: "scatter", // One of: scatter, bar, pie
									title: "scatter",
									mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "secondary",
								},
							]}
							title={`${monthNames[month].text} ${day}`}
							showLegend={false}
							displayBar={false}
							height="400px"
							xaxis={{
								// title: "Time of Day",
								tickangle: 45,
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
					title="Monthly Humidity"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					{dataSets.plot1 && (
						<Plot
							scrollZoom
							data={[
								{
									x: dataSets.plot1.map((item) => item.timestamp), // generateTimesOfDay()
									y: dataSets.plot1.map((item) => item.humidity), // Example y values
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
								tickangle: 45,
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
								{`🕗 updated ${minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Plot
						showLegend
						scrollZoom
						data={[
							{
								labels: Array.from({ length: 4 }, (_, i) => `Field ${i + 1}`), // Generate labels from "field 1" to "field 10"
								values: generateRandomPercentages(4),
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
								{`🕗 updated ${minutesAgo} minutes ago`}
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
										y: generateRandomNumbers(daysInMonth, 20, 40),
										type: "box", // One of: scatter, bar, pie
										title: "June",
										color: "secondary",
									},
									{
										y: generateRandomNumbers(daysInMonth, 32, 42),
										type: "box", // One of: scatter, bar, pie
										title: "July",
										color: "secondary",
									},
									{
										y: generateRandomNumbers(daysInMonth, 28, 38),
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
								{`🕗 updated ${minutesAgo} minutes ago`}
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
										y: generateRandomNumbers(monthsInYear, 0, 10),
										type: "bar", // One of: scatter, bar, pie
										title: "Field 1",
										color: "primary",
									},
									{
										x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
										y: generateRandomNumbers(monthsInYear, 0, 10),
										type: "bar", // One of: scatter, bar, pie
										title: "Field 2",
										color: "secondary",
									},
									{
										x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
										y: generateRandomNumbers(monthsInYear, 0, 10),
										type: "bar",
										title: "Field 3",
										color: "third",
									},
									{
										x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
										y: generateRandomNumbers(monthsInYear, 0, 10),
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
								{`🕗 updated ${minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					<Plot
						scrollZoom
						data={[
							{
								x: monthNames.map((item) => item.text).slice(0, 10), // Array.from({ length: monthsInYear }, (_, i) => i + 1),
								y: generateRandomNumbers(monthsInYear - 2, 0, 100),
								texts: ["One", "Two", "Three"], // Text for each data point
								type: "scatter", // One of: scatter, bar, pie
								title: "Field 1",
								mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
								color: "primary",
							},
							{
								x: monthNames.map((item) => item.text).slice(0, 10), // Array.from({ length: monthsInYear }, (_, i) => i + 1),
								y: generateRandomNumbers(monthsInYear - 2, 0, 100),
								type: "scatter", // One of: scatter, bar, pie
								title: "Field 2",
								mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
								color: "secondary",
							},
							{
								x: monthNames.map((item) => item.text).slice(0, 10), // Array.from({ length: monthsInYear }, (_, i) => i + 1),
								y: generateRandomNumbers(monthsInYear - 2, 0, 100),
								type: "scatter", // One of: scatter, bar, pie
								title: "Field 3",
								mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
								color: "third",
							},
						]}
						title="Average Soil Quality per Month"
						xaxis={{
							// title: "Month",
							tickmode: "linear",
							tick0: 1,
							dtick: 1,
						}}
						yaxis={{
							title: "Soil Quality (%)",
							tickmode: "linear",
							tick0: 0,
							dtick: 5,
						}}
					/>
				</Card>
			</Grid>
			<Grid item width="100%" mt={4}>
				<Card
					title="Soil Quality"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{`🕗 updated ${minutesAgo} minutes ago`}
							</Typography>
						</Grid>
					)}
				>
					{dataSets.plot2 && (
						<Plot
							scrollZoom
							data={[
								{
									x: dataSets.plot2.map((item) => item.timestamp),
									y: dataSets.plot2.map((item) => item.soil_quality),
									texts: ["One", "Two", "Three"], // Text for each data point
									type: "scatter", // One of: scatter, bar, pie
									title: "Field 1",
									mode: "lines", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "secondary",
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
