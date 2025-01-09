import { Grid } from "@mui/material";
import { memo, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
// import Form from "../components/Form.js";
import useInit from "../utils/screen-init.js";
import secoConfigs, { organization } from "../config/SecoConfig.js";
import { getCustomDateTime, calculateDates } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";

const SecoCollab = () => {
	const customDate = useMemo(() => getCustomDateTime(2024, 8), []);
	const { month, currentDate, formattedBeginningOfMonth, formattedBeginningOfDay } =	useMemo(
		() => calculateDates(customDate), [customDate],
	);

	const fetchConfigs = useMemo(
		() => secoConfigs(currentDate, formattedBeginningOfMonth, formattedBeginningOfDay),
		[currentDate, formattedBeginningOfMonth, formattedBeginningOfDay],
	);
	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;

	const dailyOverview = useMemo(() => [
		{
			subtitle: "Avg Temperature",
			min: 0,
			max: 40,
			value: dataSets.todayTemperature?.at(-1)?.avg_m_temp01 ?? null,
			color: "goldenrod",
			symbol: "°C",
		},
		{
			subtitle: "Avg Humidity",
			min: 0,
			max: 100,
			value: dataSets.todayHumidity?.at(-1)?.avg_m_hum01 ?? null,
			color: "third",
			symbol: "%",
		},
		{
			subtitle: "Avg Co2",
			min: 100,
			max: 1600,
			value: dataSets.todayCo2?.at(-1)?.avg_a_co2 ?? null,
			color: "secondary",
			symbol: "",
		},
	], [dataSets]);

	const monthlyOverview = useMemo(() => [
		{
			data: [
				{
					x: dataSets.monthMaxTemperature?.map((item) => item.interval_start) ?? [],
					y: dataSets.monthMaxTemperature?.map((item) => item.max_m_temp01) ?? [],
					type: "bar",
					color: "goldenrod",
					title: "maxTemperature",
				},
				{
					x: dataSets.monthMaxTemperature?.map((item) => item.interval_start) ?? [],
					y: dataSets.monthMinTemperature?.map((item) => item.min_m_temp01) ?? [],
					type: "bar",
					color: "gold",
					title: "minTemperature",
				},
			],
			yaxis: { title: "Temperature (°C)" },
		},
		{
			data: [
				{
					x: dataSets.monthMaxHumidity?.map((item) => item.interval_start) ?? [],
					y: dataSets.monthMaxHumidity?.map((item) => item.max_m_hum01) ?? [],
					type: "bar",
					color: "primary",
					title: "maxHumidity",
				},
				{
					x: dataSets.monthMaxHumidity?.map((item) => item.interval_start) ?? [],
					y: dataSets.monthMinHumidity?.map((item) => item.min_m_hum01) ?? [],
					type: "bar",
					color: "third",
					title: "minHumidity",
				},
			],
			yaxis: { title: "Humidity (%)" },
		},
		{
			data: [
				{
					x: dataSets.monthMaxCo2?.map((item) => item.interval_start) ?? [],
					y: dataSets.monthMaxCo2?.map((item) => item.max_a_co2) ?? [],
					type: "bar",
					color: "green",
					title: "maxCo2",
				},
				{
					x: dataSets.monthMaxCo2?.map((item) => item.interval_start) ?? [],
					y: dataSets.monthMinCo2?.map((item) => item.min_a_co2) ?? [],
					type: "bar",
					color: "secondary",
					title: "minCo2",
				},
			],
			yaxis: { title: "Co2" },
		},
	], [dataSets]);

	const timelineOverview = useMemo(() => [
		{
			data: [
				{
					x: dataSets.overview?.map((item) => item.timestamp) ?? [],
					y: dataSets.overview?.map((item) => item.m_temp01) ?? [],
					type: "scatter",
					mode: "lines",
					color: "goldenrod",
					title: "Temperature",
				},
			],
			yaxis: { title: "Temperature (°C)" },
		},
		{
			data: [
				{
					x: dataSets.overview?.map((item) => item.timestamp) ?? [],
					y: dataSets.overview?.map((item) => item.m_hum01) ?? [],
					type: "scatter",
					mode: "lines",
					color: "third",
					title: "Humidity",
				},
			],
			yaxis: { title: "Humidity (%)" },
		},
		{
			data: [
				{
					x: dataSets.overview?.map((item) => item.timestamp) ?? [],
					y: dataSets.overview?.map((item) => item.a_co2) ?? [],
					type: "scatter",
					mode: "markers",
					color: "secondary",
					title: "Co2",
				},
			],
			yaxis: { title: "Co2" },
		},
	], [dataSets]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid item xs={12} md={12} alignItems="center" flexDirection="row" mt={2}>
				<Card title="Today's Overview" footer={cardFooter({ minutesAgo })}>
					{isLoading ? (<LoadingIndicator />
					) : (
						<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
							{dailyOverview.map((plot, index) => (
								<Grid key={index} item xs={12} md={4} justifyContent="center" sx={{ height: "200px" }}>
									<Plot
										scrollZoom
										data={[
											{
												type: "indicator",
												mode: "gauge+number",
												value: plot.value,
												range: [plot.min, plot.max],
												color: plot.color,
												shape: "angular",
												indicator: "primary",
												textColor: "primary",
												suffix: plot.symbol,
											},
										]}
										displayBar={false}
										title={plot.subtitle}
									/>
								</Grid>
							))}
						</Grid>
					)}
				</Card>
			</Grid>
			<Grid item xs={12} md={12} alignItems="center" flexDirection="column" mt={2}>
				<Card title={`${monthNames[month].text}'s Max vs Min Values`} footer={cardFooter({ minutesAgo })}>
					{isLoading ? (<LoadingIndicator />
					) : (
						<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
							{monthlyOverview.map((plot, index) => (
								<Grid key={index} item xs={12} md={4} justifyContent="center">
									<Plot
										key={index}
										scrollZoom
										height="250px"
										showLegend={false}
										data={plot.data}
										displayBar={false}
										yaxis={plot.yaxis}
									/>
								</Grid>
							))}
						</Grid>
					)}
				</Card>
			</Grid>
			<Grid item xs={12} md={12} alignItems="center" flexDirection="column" mt={2} mb={1}>
				<Card title="Timeline's Overview" footer={cardFooter({ minutesAgo })}>
					{isLoading ? (<LoadingIndicator />
					) : (
						timelineOverview.map((plotData, index) => (
							<Plot
								key={index}
								scrollZoom
								height="350px"
								data={plotData.data}
								displayBar={false}
								yaxis={plotData.yaxis}
							/>
						))
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default memo(SecoCollab);
