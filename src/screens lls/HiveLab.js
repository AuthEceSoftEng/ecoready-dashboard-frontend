import { Grid, Typography } from "@mui/material";
import { memo, useState, useRef } from "react";

import { PrimaryBackgroundButton } from "../components/Buttons.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import colors from "../_colors.scss";

// import { CollectionDataManagement } from 'eco-ready-services.js';

const HiveLab = () => {
	const formRef = useRef();
	const [plotData, setPlotData] = useState(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [sortValue, setSortValue] = useState("month");

	// Get the current year and month
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();

	// Get the number of days in the current month
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const monthsInYear = 12;

	// Generate ten random percentages that sum up to 100%
	const generateRandomPercentages = (num) => {
		const arr = Array.from({ length: num }, () => Math.random());
		const sum = arr.reduce((a, b) => a + b, 0);
		return arr.map((value) => (value / sum) * 100);
	};

	const values = generateRandomPercentages(10);

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

	const [value, setValue] = useState("");

	const formContent = [
		{
			customType: "dropdown",
			id: "sort",
			label: "Hive:",
			items: [
				{ value: 1, label: "1" },
				{ value: 2, label: "2" },
				{ value: 3, label: "3" },
				{ value: 4, label: "4" },
			],
			size: "small",
			background: "grey",
			defaultValue: "Month",
			onChange: (event) => setSortValue(event.target.value),
		},
	];

	const onChange = (event) => setValue(event.target.value);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around">
			<Grid item xs={12}>
				<Card
					title="Annual Honey Yield Distribution"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{"🕗 updated 4 min ago"}
							</Typography>
						</Grid>
					)}
				>
					<Plot
						showLegend
						scrollZoom
						data={[
							{
								labels: Array.from({ length: 4 }, (_, i) => `Hive ${i + 1}`), // Generate labels from "Cow 1" to "Cow 4"
								values,
								type: "pie",
								title: "pie",
							},
						]}

					/>
				</Card>
			</Grid>
			<Grid container width="100%" mt={4} display="flex" direction="row" spacing={2} justifyContent="space-around">
				<Grid item xs={12} md={4} alignItems="center" flexDirection="column">
					<Card
						title="Annual Honey Production"
						footer={(
							<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
								<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
									{"🕗 updated 4 min ago"}
								</Typography>
							</Grid>
						)}
					>
						<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
							{`${Math.floor(Math.random() * 500) + 300} Litres`}
							<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
								<span style={{ color: colors.error }}>{"4%"}</span>
								{" "}
								{"decrease since"}
								{year}
							</Typography>
						</Typography>
					</Card>
				</Grid>
				<Grid item xs={12} md={4} alignItems="center" flexDirection="column">
					<Card
						title="Annual Costs of Production"
						footer={(
							<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
								<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
									{"🕗 updated 4 min ago"}
								</Typography>
							</Grid>
						)}
					>
						<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
							{`${(Math.random() * 5 + 3).toFixed(2)}k $`}
							<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
								<span style={{ color: colors.secondary }}>{"5%"}</span>
								{" "}
								{"decrease since last"}
								{monthNames[month - 1].text}
							</Typography>
						</Typography>
					</Card>
				</Grid>
				<Grid item xs={12} md={4} alignItems="center" flexDirection="column">
					<Card
						title="Current Bee Count Estimation"
						footer={(
							<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
								<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
									{"🕗 updated 4 min ago"}
								</Typography>
							</Grid>
						)}
					>
						<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
							{`${(Math.random() * 240 + 80).toFixed(2)}k `}
							{" "}
							<span style={{ color: "goldenrod" }}>{"Honeybees"}</span>
							{" "}
							<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
								<span style={{ color: colors.secondary }}>{"8%"}</span>
								{" "}
								{"increase since"}
								{year - 1}
							</Typography>
						</Typography>
					</Card>
				</Grid>
			</Grid>
			<Grid item xs={12} mt={4}>
				<Card
					title="Monthly Honey Yield Distribution"
					footer={(
						<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
							<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
								{"🕗 updated 4 min ago"}
							</Typography>
						</Grid>
					)}
				>
					<Plot
						scrollZoom
						data={[
							{
								x: Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`),
								y: Array.from({ length: 4 }, (_, i) => Math.floor(Math.random() * (10 - 3 + 1) + 3)),
								type: "bar",
								title: "Hive 1",
								color: "primary",
							},
							{
								x: Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`),
								y: Array.from({ length: 4 }, (_, i) => Math.floor(Math.random() * (10 - 3 + 1) + 3)),
								type: "bar",
								title: "Hive 2",
								color: "secondary",
							},
							{
								x: Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`),
								y: Array.from({ length: 4 }, (_, i) => Math.floor(Math.random() * (10 - 3 + 1) + 3)),
								type: "bar",
								title: "Hive 3",
								color: "third",
							},
							{
								x: Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`),
								y: Array.from({ length: 4 }, (_, i) => Math.floor(Math.random() * (10 - 3 + 1) + 3)),
								type: "bar",
								title: "Hive 4",
								color: "green",
							},
						]}
						title="Amount of Honey per Hive (Kg)"
						displayBar={false}
						height="400px"
					/>
				</Card>
			</Grid>
			<Grid container xs={12} mt={4} display="flex" spacing={2} justifyContent="space-between">
				<Grid item xs={12} md={6}>
					<Card
						title="Average Area Coverage"
						footer={(
							<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
								<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
									{"🕗 updated 4 min ago"}
								</Typography>
							</Grid>
						)}
					>
						<Grid item sx={{ position: "relative", width: "100%" }}>
							<Grid item sx={{ position: "relative", width: "100%" }}>
								<Plot
									scrollZoom
									data={[
										{
											x: Array.from({ length: daysInMonth }, (_, i) => i + 1),
											y: Array.from({ length: daysInMonth }, () => Math.floor(Math.random() * 6) + 10),
											type: "bar", // One of: scatter, bar, pie
											title: "June",
											color: "secondary",
										},
									]}
									title={`${monthNames[month].text}`}
									showLegend={false}
									displayBar={false}
									height="400px"
									style={{ zIndex: 1 }}
									xaxis={{
										title: "Day",
										tickmode: "linear",
										// tickangle: 45,
										tick0: 1,
										dtick: 2,
									}}
									yaxis={{
										title: "Area * 1000 (ha)",
										tickmode: "linear",
										tick0: 0,
										dtick: 10,
									}}
								/>
							</Grid>
							<Grid item sx={{ position: "absolute", bottom: 0, right: -95, width: "52%", height: "50%", zIndex: 2, display: "flex" }}>
								<Form ref={formRef} content={formContent.slice(1)} />
							</Grid>
						</Grid>
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Card
						title="Activity Levels"
						footer={(
							<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
								<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
									{"🕗 updated 4 min ago"}
								</Typography>
							</Grid>
						)}
					>
						<Plot
							scrollZoom
							data={[
								{
									x: Array.from({ length: daysInMonth }, (_, i) => i + 1), // Generate a range of values for the number of days in the current month
									y: Array.from({ length: daysInMonth }, (_, i) => Math.random() * 100), // Example y values
									type: "scatter", // One of: scatter, bar, pie
									title: "Hive 1",
									mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "primary",
								},
								{
									x: Array.from({ length: daysInMonth }, (_, i) => i + 1), // Generate a range of values for the number of days in the current month
									y: Array.from({ length: daysInMonth }, (_, i) => Math.random() * 100), // Example y values
									type: "scatter", // One of: scatter, bar, pie
									title: "Hive 2",
									mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "secondary",
								},
								{
									x: Array.from({ length: daysInMonth }, (_, i) => i + 1), // Generate a range of values for the number of days in the current month
									y: Array.from({ length: daysInMonth }, (_, i) => Math.random() * 100), // Example y values
									type: "scatter", // One of: scatter, bar, pie
									title: "Hive 3",
									mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "third",
								},
								{
									x: Array.from({ length: daysInMonth }, (_, i) => i + 1), // Generate a range of values for the number of days in the current month
									y: Array.from({ length: daysInMonth }, (_, i) => Math.random() * 100), // Example y values
									type: "scatter", // One of: scatter, bar, pie
									title: "Hive 4",
									mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "green",
								},
							]}
							title={`${monthNames[month].text}`}
							displayBar={false}
							height="400px"
							xaxis={{
								title: "Day",
								tickmode: "linear",
								// tickangle: 45,
								tick0: 1,
								dtick: 2,
							}}
							yaxis={{
								title: "Activity Level (%)",
								tickmode: "linear",
								tick0: 0,
								dtick: 10,
							}}
						/>
					</Card>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default memo(HiveLab);
