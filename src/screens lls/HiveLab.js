import { Grid, Typography } from "@mui/material";
import { memo, useEffect, useReducer, useRef, useCallback, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
// import Form from "../components/Form.js";
import { useSnackbar } from "../utils/index.js";
import fetchAllData from "../api/fetch-data.js";
import hiveConfigs from "../config/HiveConfig.js";
import colors from "../_colors.scss";
import { initialState, reducer, sumByKey, calculateDates } from "../utils/data-handling-functions.js";

const HiveLab = () => {
	const { success, error } = useSnackbar();
	const accessKey = "******";
	const organization = "Hivelab";
	const [state, dispatch] = useReducer(reducer, initialState);
	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { year, month, currentDate, formattedBeginningOfMonth } = useMemo(calculateDates, []);

	const fetchConfigs = useMemo(
		() => hiveConfigs(formattedBeginningOfMonth, currentDate),
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

	const annualYield = state.dataSets.honeyYield ? state.dataSets.honeyYield.reduce((sum, item) => sum + item.honey_yield, 0).toFixed(2) : "N/A";
	const sumsByHive = useMemo(() => (
		state.dataSets.honeyYield ? sumByKey(state.dataSets.honeyYield, "key", "honey_yield") : {}
	), [state.dataSets.honeyYield]);

	// Calculate percentages
	const percentages = useMemo(() => {
		if (annualYield === "N/A") return [];

		return Object.keys(sumsByHive).map((key) => ({
			key,
			percentage: ((sumsByHive[key] / annualYield) * 100).toFixed(2),
		}));
	}, [annualYield, sumsByHive]);

	const bees = state.dataSets.beeCount ? state.dataSets.beeCount.reduce((sum, item) => sum + item.avg_bee_count, 0).toFixed(2) : "N/A";

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

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around">
			<Grid item xs={12}>
				<Card
					title="Annual Honey Yield Distribution"
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
									{`🕗 updated ${state.minutesAgo} minutes ago`}
								</Typography>
							</Grid>
						)}
					>
						<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
							{`${annualYield} Litres`}
							<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
								<span style={{ color: colors.error }}>{"4%"}</span>
								{" "}
								{"decrease since "}
								{year - 1}
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
									{`🕗 updated ${state.minutesAgo} minutes ago`}
								</Typography>
							</Grid>
						)}
					>
						<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
							{`${(Math.random() * 5 + 3).toFixed(2)}k $`}
							<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
								<span style={{ color: colors.secondary }}>{"5%"}</span>
								{" "}
								{"decrease since last "}
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
									{`🕗 updated ${state.minutesAgo} minutes ago`}
								</Typography>
							</Grid>
						)}
					>
						<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
							{`${(bees / 1000).toFixed(2)}k `}
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
					title="Honey Yield per Harvest"
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
								x: state.dataSets.yieldDistribution
									? state.dataSets.yieldDistribution.map((item) => item.interval_start)
									: [],
								y: state.dataSets.yieldDistribution
									? state.dataSets.yieldDistribution
										.filter((item) => item.key === "hive1")
										.map((item) => item.sum_honey_yield) : [],
								type: "bar",
								title: "Hive 1",
								color: "primary",
							},
							{
								x: state.dataSets.yieldDistribution
									? state.dataSets.yieldDistribution.map((item) => item.interval_start)
									: [],
								y: state.dataSets.yieldDistribution
									? state.dataSets.yieldDistribution
										.filter((item) => item.key === "hive2")
										.map((item) => item.sum_honey_yield) : [],
								type: "bar",
								title: "Hive 2",
								color: "secondary",
							},
							{
								x: state.dataSets.yieldDistribution
									? state.dataSets.yieldDistribution.map((item) => item.interval_start)
									: [],
								y: state.dataSets.yieldDistribution
									? state.dataSets.yieldDistribution
										.filter((item) => item.key === "hive3")
										.map((item) => item.sum_honey_yield) : [],
								type: "bar",
								title: "Hive 3",
								color: "third",
							},
							{
								x: state.dataSets.yieldDistribution
									? state.dataSets.yieldDistribution.map((item) => item.interval_start)
									: [],
								y: state.dataSets.yieldDistribution
									? state.dataSets.yieldDistribution
										.filter((item) => item.key === "hive4")
										.map((item) => item.sum_honey_yield) : [],
								type: "bar",
								title: "Hive 4",
								color: "green",
							},
						]}
						title="Amount of Honey per Hive (Kg)"
						xaxis={{
							tickvals: state.dataSets.yieldDistribution
								? state.dataSets.yieldDistribution.map((item) => item.interval_start)
								: [],
						}}
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
									{`🕗 updated ${state.minutesAgo} minutes ago`}
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
											x: Array.from({ length: state.dataSets.coverage
												? state.dataSets.coverage.length : 0 }, (_, i) => i + 1),
											y: state.dataSets.coverage
												? state.dataSets.coverage
													.map((item) => item.sum_area_coverage) : [],
											type: "bar", // One of: scatter, bar, pie
											title: "June",
											color: "goldenrod",
										},
									]}
									title={`${monthNames[month].text}`}
									showLegend={false}
									displayBar={false}
									height="400px"
									style={{ zIndex: 1 }}
									xaxis={{
										title: "Date",
										tickvals: Array.from({ length: state.dataSets.coverage
											? state.dataSets.coverage.length : 0 }, (_, i) => i + 1),
										tickangle: 0,
										tickmode: "linear",
										tick0: 1,
										dtick: 3,
									}}
									yaxis={{
										title: "Area * 1000 (ha)",
									}}
								/>
							</Grid>
							{/* <
							Grid
							item sx={{ position: "absolute", bottom: 0, right: -95, width: "52%", height: "50%", zIndex: 2, display: "flex" }}>
								<Form ref={formRef} content={formContent.slice(1)} />
							</Grid> */}
						</Grid>
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Card
						title="Activity Levels"
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
									x: Array.from({ length: state.dataSets.coverage
										? state.dataSets.coverage.length : 0 }, (_, i) => i + 1),
									y: state.dataSets.activity
										? state.dataSets.activity
											.filter((item) => item.key === "hive1")
											.map((item) => item.avg_activity_level) : [],
									type: "scatter", // One of: scatter, bar, pie
									title: "Hive 1",
									mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "primary",
								},
								{
									x: Array.from({ length: state.dataSets.coverage
										? state.dataSets.coverage.length : 0 }, (_, i) => i + 1),
									y: state.dataSets.activity
										? state.dataSets.activity
											.filter((item) => item.key === "hive2")
											.map((item) => item.avg_activity_level) : [],
									type: "scatter", // One of: scatter, bar, pie
									title: "Hive 2",
									mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "secondary",
								},
								{
									x: Array.from({ length: state.dataSets.coverage
										? state.dataSets.coverage.length : 0 }, (_, i) => i + 1),
									y: state.dataSets.activity
										? state.dataSets.activity
											.filter((item) => item.key === "hive3")
											.map((item) => item.avg_activity_level) : [],
									type: "scatter", // One of: scatter, bar, pie
									title: "Hive 3",
									mode: "lines+markers", // For scatter one of: lines, markers, text and combinations (e.g. lines+markers)
									color: "third",
								},
								{
									x: Array.from({ length: state.dataSets.coverage
										? state.dataSets.coverage.length : 0 }, (_, i) => i + 1),
									y: state.dataSets.activity
										? state.dataSets.activity
											.filter((item) => item.key === "hive4")
											.map((item) => item.avg_activity_level) : [],
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
								title: "Date",
								tickvals: Array.from({ length: state.dataSets.coverage
									? state.dataSets.coverage.length : 0 }, (_, i) => i + 1),
								tickangle: 0,
								tickmode: "linear",
								tick0: 1,
								dtick: 3,
							}}
							yaxis={{
								title: "Activity Level (%)",
							}}
						/>
					</Card>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default memo(HiveLab);
