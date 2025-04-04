import { Grid, Typography } from "@mui/material";
import { memo, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
// import Form from "../components/Form.js";
import useInit from "../utils/screen-init.js";
import hiveConfigs, { organization } from "../config/HiveConfig.js";
import colors from "../_colors.scss";
import { sumByKey, getCustomDateTime, calculateDates } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter } from "../utils/rendering-items.js";

const HiveLab = () => {
	const customDate = useMemo(() => getCustomDateTime(2024, 9), []);
	const { year, month, currentDate, formattedBeginningOfMonth } = useMemo(
		() => calculateDates(customDate),
		[customDate],
	);

	const fetchConfigs = useMemo(
		() => hiveConfigs(formattedBeginningOfMonth, currentDate),
		[formattedBeginningOfMonth, currentDate],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { dataSets, minutesAgo } = state;

	const annualYield = useMemo(() => (
		dataSets.honeyYield ? dataSets.honeyYield.reduce((sum, item) => sum + item.honey_yield, 0).toFixed(2) : "N/A"
	), [dataSets.honeyYield]);

	const sumsByHive = useMemo(() => (
		dataSets.honeyYield ? sumByKey(dataSets.honeyYield, "key", "honey_yield") : {}
	), [dataSets.honeyYield]);

	const percentages = useMemo(() => {
		if (annualYield === "N/A") return [];

		return Object.keys(sumsByHive).map((key) => ({
			key,
			percentage: ((sumsByHive[key] / annualYield) * 100).toFixed(2),
		}));
	}, [annualYield, sumsByHive]);

	const bees = useMemo(() => (
		dataSets.beeCount ? dataSets.beeCount.reduce((sum, item) => sum + item.avg_bee_count, 0).toFixed(2) : "N/A"
	), [dataSets.beeCount]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2} sx={{ flexGrow: 1, flexBasis: "100%", flexShrink: 0 }}>
			<Grid item xs={12}>
				<Card
					title="Annual Honey Yield Distribution"
					footer={cardFooter({ minutesAgo })}
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
			{[
				{
					title: "Annual Honey Production",
					value: `${annualYield} Litres`,
					change: "4%",
					changeText: `decrease since ${year - 1}`,
					color: colors.error,
					footer: cardFooter({ minutesAgo }),
				},
				{
					title: "Annual Costs of Production",
					value: `${(Math.random() * 5 + 3).toFixed(2)}k $`,
					change: "5%",
					changeText: `decrease since last ${monthNames[month].text}`,
					color: colors.secondary,
					footer: cardFooter({ minutesAgo }),
				},
				{
					title: "Current Bee Count Estimation",
					value: `${(bees / 1000).toFixed(2)}k Honeybees`,
					change: "8%",
					changeText: `increase since ${year - 1}`,
					color: "goldenrod",
					footer: cardFooter({ minutesAgo }),
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} md={4} alignItems="center" flexDirection="column">
					<Card title={card.title} footer={card.footer}>
						<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
							{card.value}
							<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
								<span style={{ color: card.color }}>{card.change}</span>
								{" "}
								{card.changeText}
							</Typography>
						</Typography>
					</Card>
				</Grid>
			))}
			<Grid item xs={12}>
				<Card title="Honey Yield per Harvest" footer={cardFooter({ minutesAgo })}>
					<Plot
						scrollZoom
						data={["hive1", "hive2", "hive3", "hive4"].map((hive, index) => ({
							x: dataSets.yieldDistribution
								? dataSets.yieldDistribution.map((item) => item.interval_start)
								: [],
							y: dataSets.yieldDistribution
								? dataSets.yieldDistribution.filter((item) => item.key === hive).map((item) => item.sum_honey_yield)
								: [],
							type: "bar",
							title: `Hive ${index + 1}`,
							color: ["primary", "secondary", "third", "green"][index],
						}))}
						title="Amount of Honey per Hive (Kg)"
						xaxis={{
							tickvals: dataSets.yieldDistribution
								? dataSets.yieldDistribution.map((item) => item.interval_start)
								: [],
						}}
						displayBar={false}
						height="400px"
					/>
				</Card>
			</Grid>
			{[
				{
					title: "Average Area Coverage",
					data: [
						{
							x: Array.from({ length: dataSets.coverage
								? dataSets.coverage.length : 0 }, (_, i) => i + 1),
							y: dataSets.coverage
								? dataSets.coverage
									.map((item) => item.sum_area_coverage) : [],
							type: "bar",
							color: "goldenrod",
							showLegend: false,
						},
					],
					yaxisTitle: "Area * 1000 (ha)",
				},
				{
					title: "Activity Levels",
					data: ["hive1", "hive2", "hive3", "hive4"].map((hive, index) => ({
						x: Array.from({ length: dataSets.coverage ? dataSets.coverage.length : 0 }, (_, i) => i + 1),
						y: dataSets.activity
							? dataSets.activity.filter((item) => item.key === hive).map((item) => item.avg_activity_level)
							: [],
						type: "scatter",
						title: `Hive ${index + 1}`,
						mode: "lines+markers",
						color: ["primary", "secondary", "third", "green"][index],
					})),
					yaxisTitle: "Activity Level (%)",
				},
			].map((plot, index) => (
				<Grid key={index} item xs={12} md={6}>
					<Card title={plot.title} footer={cardFooter({ minutesAgo })}>
						<Plot
							scrollZoom
							data={plot.data}
							title={`${monthNames[month].text}`}
							displayBar={false}
							height="400px"
							xaxis={{
								title: "Date",
								tickvals: Array.from({ length: dataSets.coverage ? dataSets.coverage.length : 0 }, (_, i) => i + 1),
								tickangle: 0,
								tickmode: "linear",
								tick0: 1,
								dtick: 3,
							}}
							yaxis={{
								title: plot.yaxisTitle,
							}}
						/>
					</Card>
				</Grid>
			))}
		</Grid>
	);
};

export default memo(HiveLab);
