import { Grid, Typography } from "@mui/material";
import { memo, useRef, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import useInit from "../utils/screen-init.js";
import agroConfigs, { organization } from "../config/AgroConfig.js";
import colors from "../_colors.scss";
import { sumByKey, groupByKey, getMaxValuesByProperty, getSumValuesByProperty, getCustomDateTime, calculateDates } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, LoadingIndicator } from "../utils/rendering-items.js";

const AgroLab = () => {
	const customDate = useMemo(() => getCustomDateTime(2024, 9), []);
	const { year, month, currentDate, formattedBeginningOfMonth } = useMemo(
		() => calculateDates(customDate),
		[customDate],
	);

	const fetchConfigs = useMemo(
		() => agroConfigs(formattedBeginningOfMonth, currentDate),
		[formattedBeginningOfMonth, currentDate],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;

	const formRef = useRef();
	const formContent = useMemo(() => [
		{
			customType: "dropdown",
			id: "time period sort",
			label: "Sort By:",
			items: [
				{ value: "Week", text: "Week" },
				{ value: "Month", text: "Month" },
				{ value: "Year", text: "Year" },
			],
			defaultValue: "Month",
			onChange: (event) => {
				console.log(`Status changed to ${event.target.value}`);
			},
		},
		{
			customType: "date-picker",
			id: "from",
			width: "130px",
			type: "desktop",
			label: "From:",
			sublabel: "Start date",
			background: "grey",
		},
		{
			customType: "date-picker",
			id: "to",
			width: "130px",
			type: "desktop",
			label: "To:",
			sublabel: "End date",
			background: "grey",
		},
	], []);

	// Calculate annual yield if dataSets['cropYield'] exists
	const annualYield = useMemo(() => (
		dataSets.cropYield ? dataSets.cropYield.reduce((sum, item) => sum + item.crop_yield, 0).toFixed(2) : "N/A"
	), [dataSets.cropYield]);

	const sumsByField = useMemo(() => (
		dataSets.cropYield ? sumByKey(dataSets.cropYield, "key", "crop_yield") : {}
	), [dataSets.cropYield]);

	const groupedSoilQuality = useMemo(() => (
		dataSets.soilQuality ? groupByKey(dataSets.soilQuality, "key") : {}
	), [dataSets.soilQuality]);

	const groupedSoilMoisture = useMemo(() => (
		dataSets.soilMoisture ? groupByKey(dataSets.soilMoisture, "interval_start") : {}
	), [dataSets.soilMoisture]);

	const maxSoilMoistureByDate = useMemo(() => (
		getMaxValuesByProperty(groupedSoilMoisture, "max_soil_moisture")
	), [groupedSoilMoisture]);

	const groupedHumidity = useMemo(() => (
		dataSets.humidity ? groupByKey(dataSets.humidity, "interval_start") : {}
	), [dataSets.humidity]);

	const maxHumidityByDate = useMemo(() => (
		getMaxValuesByProperty(groupedHumidity, "max_humidity")
	), [groupedHumidity]);

	const groupedYieldDistribution = useMemo(() => (
		dataSets.yieldDistribution ? groupByKey(dataSets.yieldDistribution, "interval_start") : {}
	), [dataSets.yieldDistribution]);

	const sumYieldDistribution = useMemo(() => (
		getSumValuesByProperty(groupedYieldDistribution, "sum_crop_yield")
	), [groupedYieldDistribution]);

	const percentages = useMemo(() => {
		if (annualYield === "N/A") return [];

		return Object.keys(sumsByField).map((key) => ({
			key,
			percentage: ((sumsByField[key] / annualYield) * 100).toFixed(2),
		}));
	}, [annualYield, sumsByField]);

	const monthIrrigation = useMemo(() => (
		dataSets.irrigation ? dataSets.irrigation.reduce((sum, item) => sum + item.irrigation, 0).toFixed(2) : "N/A"
	), [dataSets.irrigation]);

	const meanTemp = useMemo(() => (
		dataSets.temperature_now ? (dataSets.temperature_now.reduce((sum, item) => sum + item.temperature, 0) / dataSets.temperature_now.length).toFixed(2) : "N/A"
	), [dataSets.temperature_now]);

	const generate2024Months = useMemo(() => {
		const months = [];
		for (let mnth = 0; mnth < 12; mnth++) {
			const date = new Date(2024, mnth, 2);
			months.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
		}

		return months;
	}, []);

	const tickvals = generate2024Months;

	const renderCard = (card, index) => (
		<Grid key={index} item xs={12} md={4} alignItems="center" flexDirection="column">
			<Card title={card.title} footer={cardFooter({ minutesAgo })}>
				<Typography variant="h4" component="h4" align="center" sx={{ fontWeight: "bold" }}>
					{card.value}
					<Typography variant="body2" component="p" sx={{ fontSize: "0.6em" }}>
						<span style={{ color: card.color }}>{card.percentage}</span>
						{" "}
						{card.subtitle}
					</Typography>
				</Typography>
			</Card>
		</Grid>
	);

	const renderPlot = (plot, index) => (
		<Grid key={index} item xs={12} md={4} alignItems="center" flexDirection="column" mt={2}>
			<Card title={plot.title} footer={cardFooter({ minutesAgo })}>
				<Plot
					scrollZoom
					data={plot.data}
					showLegend={false}
					displayBar={false}
					height="400px"
					xaxis={plot.xaxis}
					yaxis={plot.yaxis}
				/>
			</Card>
		</Grid>
	);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			{isLoading ? (<LoadingIndicator />
			) : (
				[
					{
						title: "Annual Crop Yield",
						value: `${annualYield} T`,
						subtitle: `${year - 1}`,
						percentage: "6%",
						color: colors.secondary,
					},
					{
						title: "Current Month's Irrigation",
						value: `${monthIrrigation} Litres`,
						subtitle: monthNames[month].text,
						percentage: "10%",
						color: colors.error,
					},
					{
						title: "Temperature",
						value: `${meanTemp}°C`,
						subtitle: "Sunny skies in your area",
						color: colors.warning,
					},
				].map(renderCard)
			)}
			{isLoading ? (<LoadingIndicator />
			) : (
				[
					{
						title: "Harvest's Crop Yield Distribution",
						data: [
							{
								x: Object.keys(groupedYieldDistribution),
								y: Object.values(sumYieldDistribution),
								type: "bar",
								color: "secondary",
							},
						],
						xaxis: { tickvals: Object.keys(groupedYieldDistribution), tickangle: 15 },
						yaxis: { title: "Tonnes" },
					},
					{
						title: "Month's Soil Moisture",
						data: [
							{
								x: Object.keys(maxSoilMoistureByDate),
								y: Object.values(maxSoilMoistureByDate),
								type: "scatter",
								mode: "lines+markers",
								color: "secondary",
							},
						],
						xaxis: { tickangle: 15 },
						yaxis: { title: "Soil Moisture (%)", tickangle: -30 },
					},
					{
						title: "Month's Humidity",
						data: [
							{
								x: Object.keys(maxHumidityByDate),
								y: Object.values(maxHumidityByDate),
								type: "scatter",
								mode: "lines+markers",
								color: "secondary",
							},
						],
						xaxis: { tickangle: 15 },
						yaxis: { title: "Humidity (%)", tickangle: -30 },
					},
				].map(renderPlot)
			)}
			{isLoading ? (<LoadingIndicator />
			) : (
				<Grid item xs={12} md={12} mt={2}>
					<Card title="Annual Yield Per Field" footer={cardFooter({ minutesAgo })}>
						<Plot
							showLegend
							scrollZoom
							data={[
								{
									labels: percentages.map((item) => item.key),
									values: percentages.map((item) => item.percentage),
									type: "pie",
								},
							]}
							displayBar={false}
						/>
					</Card>
				</Grid>
			)}
			{isLoading ? (<LoadingIndicator />
			) : (
				[
					{
						title: "Seasonal Temperature Distribution",
						data: [
							{
								y: dataSets.temperature_june ? dataSets.temperature_june.map((item) => item.temperature) : [],
								type: "box",
								title: "June",
								color: "secondary",
							},
							{
								y: dataSets.temperature_july ? dataSets.temperature_july.map((item) => item.temperature) : [],
								type: "box",
								title: "July",
								color: "secondary",
							},
							{
								y: dataSets.temperature_august ? dataSets.temperature_august.map((item) => item.temperature) : [],
								type: "box",
								title: "August",
								color: "secondary",
							},
						],
						yaxis: { title: "Temperature (°C)" },
						formContent: formContent.slice(1),
						formConfig: {
							position: "absolute",
							top: 0,
							right: -15,
							zIndex: 10,
						},
					},
					{
						title: "Precipitation",
						data: [
							{
								x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
								y: dataSets.precipitation ? dataSets.precipitation.filter((item) => item.key === "field1").map((item) => item.avg_precipitation) : [],
								type: "bar",
								title: "Field 1",
								color: "primary",
							},
							{
								x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
								y: dataSets.precipitation ? dataSets.precipitation.filter((item) => item.key === "field2").map((item) => item.avg_precipitation) : [],
								type: "bar",
								title: "Field 2",
								color: "secondary",
							},
							{
								x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
								y: dataSets.precipitation ? dataSets.precipitation.filter((item) => item.key === "field3").map((item) => item.avg_precipitation) : [],
								type: "bar",
								title: "Field 3",
								color: "third",
							},
							{
								x: Array.from({ length: 4 }, (_, i) => `week ${i + 1}`),
								y: dataSets.precipitation ? dataSets.precipitation.filter((item) => item.key === "field4").map((item) => item.avg_precipitation) : [],
								type: "bar",
								title: "Field 4",
								color: "green",
							},
						],
						yaxis: { title: "Precipitation (mm)" },
						formContent,
						formConfig: {
							position: "absolute",
							bottom: 0,
							right: -70,
							// width: "54%",
							// height: "50%",
							zIndex: 20,
							display: "grid",
						},
					},
				].map((plot, index) => (
					<Grid key={index} item xs={12} sm={12} md={6} mt={2}>
						<Card title={plot.title} footer={cardFooter({ minutesAgo })}>
							<Grid container flexDirection="row" sx={{ position: "relative", width: "100%" }}>
								<Grid item sx={{ position: "relative", width: "75%", zIndex: 1 }}>
									<Plot
										scrollZoom
										data={plot.data}
										showLegend={false}
										yaxis={plot.yaxis}
									/>
								</Grid>
								<Grid
									item
									md={7}
									sx={plot.formConfig}
								>
									<Form ref={formRef} content={plot.formContent} />
								</Grid>
							</Grid>
						</Card>
					</Grid>
				))
			)}
			{isLoading ? (<LoadingIndicator />
			) : (
				<Grid item xs={12} md={12} mt={2}>
					<Card title="Soil Quality" footer={cardFooter({ minutesAgo })}>
						{groupedSoilQuality?.field1 && (
							<Plot
								scrollZoom
								data={Object.keys(groupedSoilQuality).map((field, index) => ({
									x: groupedSoilQuality[field].map((item) => item.interval_start),
									y: groupedSoilQuality[field].map((item) => item.avg_soil_quality),
									type: "scatter",
									mode: "lines",
									color: ["primary", "secondary", "third", "green"][index],
								}))}
								title="Average Soil Quality per Month"
								xaxis={{
									tickvals,
									ticktext: tickvals.map((date) => new Date(date).toLocaleString("default", { month: "long" })),
								}}
								yaxis={{ title: "Soil Quality" }}
							/>
						)}
					</Card>
				</Grid>
			)}
		</Grid>
	);
};

export default memo(AgroLab);
