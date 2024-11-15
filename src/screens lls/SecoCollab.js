import { Grid } from "@mui/material";
import { memo, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import useInit from "../utils/screen-init.js";
import secoConfigs, { organization } from "../config/SecoConfig.js";
import { getCustomDateTime, calculateDates } from "../utils/data-handling-functions.js";
import { cardFooter } from "../utils/card-footer.js";

const SecoCollab = () => {
	const customDate = useMemo(() => getCustomDateTime(2024, 9), []);
	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { currentDate, formattedBeginningOfMonth, formattedBeginningOfDay } =	useMemo(
		() => calculateDates(customDate), [customDate],
	);

	const fetchConfigs = useMemo(
		() => secoConfigs(formattedBeginningOfMonth, formattedBeginningOfDay, currentDate),
		[formattedBeginningOfMonth, formattedBeginningOfDay, currentDate],
	);
	const { state } = useInit(organization, fetchConfigs);

	// const formRef = useRef();
	// const formContent = [

	// 	{ customType: "dropdown",
	// 		id: "time period sort",
	// 		label: "Sort By:",
	// 		items: [
	// 			{ value: "Week", text: "Week" },
	// 			{ value: "Month", text: "Month" },
	// 			{ value: "Year", text: "Year" },
	// 		],
	// 		// value,
	// 		defaultValue: "Month",
	// 		onChange: (event) => {
	// 			console.log(`Status changed to ${event.target.value}`);
	// 		},
	// 	},
	// 	{
	// 		customType: "date-picker",
	// 		id: "from",
	// 		type: "desktop",
	// 		label: "From:",
	// 		background: "grey",
	// 	},
	// 	{
	// 		customType: "date-picker",
	// 		id: "to",
	// 		type: "desktop",
	// 		label: "To:",
	// 		background: "grey",
	// 	},
	// ];

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid item xs={12} md={12} alignItems="center" flexDirection="row" mt={2}>
				<Card title="Today's Overview" footer={cardFooter({ minutesAgo: state.minutesAgo })}>
					<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
						{[
							{
								subtitle: "Avg Temperture",
								min: 0,
								max: 40,
								value: state.dataSets.todayTemperature && state.dataSets.todayTemperature.length > 0
									? state.dataSets.todayTemperature.at(-1).avg_m_temp01
									: null,
								color: "goldenrod",
								symbol: "°C",
							},
							{
								subtitle: "Avg Humidity",
								min: 0,
								max: 100,
								value: state.dataSets.todayHumidity && state.dataSets.todayHumidity.length > 0
									? state.dataSets.todayHumidity.at(-1).avg_m_hum01
									: null,
								color: "third",
								symbol: "%",
							},
							{
								subtitle: "Avg Co2",
								min: 100,
								max: 1600,
								value: state.dataSets.todayCo2 && state.dataSets.todayCo2.length > 0
									? state.dataSets.todayCo2.at(-1).avg_a_co2
									: null,

								color: "secondary",
								symbol: "",
							},
						].map((plot, index) => (
							<Grid key={index} item xs={12} md={4} justifyContent="center" sx={{ height: "300px" }}>
								<Plot
									scrollZoom
									// width="30%"
									data={[
										{
											type: "indicator",
											mode: "gauge+number",
											value: plot.value,
											range: [plot.min, plot.max], // Gauge range
											color: plot.color, // Color of gauge bar
											shape: "angular", // "angular" or "bullet"
											indicator: "primary", // Color of gauge indicator/value-line
											textColor: "primary", // Color of gauge value
											suffix: plot.symbol, // Suffix of gauge value
										},
									]}
									displayBar={false}
									title={plot.subtitle}
								/>
							</Grid>
						))}
					</Grid>
				</Card>
			</Grid>
			<Grid item xs={12} md={12} alignItems="center" flexDirection="column" mt={2}>
				<Card title="Month's Overview" footer={cardFooter({ minutesAgo: state.minutesAgo })}>
					<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
						{[
							{
								data: [
									{
										x: state.dataSets.monthMaxTemperature
											? state.dataSets.monthMaxTemperature.map((item) => item.interval_start) : [],
										y: state.dataSets.monthMaxTemperature
											? state.dataSets.monthMaxTemperature.map((item) => item.max_m_temp01) : [],
										type: "bar",
										color: "goldenrod",
										title: "maxTemperature",
									},
									{
										x: state.dataSets.monthMaxTemperature
											? state.dataSets.monthMaxTemperature.map((item) => item.interval_start) : [],
										y: state.dataSets.monthMinTemperature
											? state.dataSets.monthMinTemperature.map((item) => item.min_m_temp01) : [],
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
										x: state.dataSets.monthMaxHumidity
											? state.dataSets.monthMaxHumidity.map((item) => item.interval_start) : [],
										y: state.dataSets.monthMaxHumidity
											? state.dataSets.monthMaxHumidity.map((item) => item.max_m_hum01) : [],
										type: "bar",
										color: "primary",
										title: "maxHumidity",
									},
									{
										x: state.dataSets.monthMaxHumidity
											? state.dataSets.monthMaxHumidity.map((item) => item.interval_start) : [],
										y: state.dataSets.monthMinHumidity
											? state.dataSets.monthMinHumidity.map((item) => item.min_m_hum01) : [],
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
										x: state.dataSets.monthMaxCo2
											? state.dataSets.monthMaxCo2.map((item) => item.interval_start) : [],
										y: state.dataSets.monthMaxCo2
											? state.dataSets.monthMaxCo2.map((item) => item.max_a_co2) : [],
										type: "bar",
										color: "green",
										title: "maxCo2",
									},
									{
										x: state.dataSets.monthMaxCo2
											? state.dataSets.monthMaxCo2.map((item) => item.interval_start) : [],
										y: state.dataSets.monthMinCo2
											? state.dataSets.monthMinCo2.map((item) => item.min_a_co2) : [],
										type: "bar",
										color: "secondary",
										title: "minCo2",
									},
								],
								yaxis: { title: "Co2" },
							},
						].map((plot, index) => (
							<Grid key={index} item xs={12} md={4} justifyContent="center">
								<Plot
									key={index}
									scrollZoom
									showLegend={false}
									data={plot.data}
									displayBar={false}
									yaxis={plot.yaxis}
								/>
							</Grid>
						))}
					</Grid>
				</Card>
			</Grid>
			<Grid item xs={12} md={12} alignItems="center" flexDirection="column" mt={2}>
				<Card title="Timeline's Overview" footer={cardFooter({ minutesAgo: state.minutesAgo })}>
					{[
						{
							data: [
								{
									x: state.dataSets.overview ? state.dataSets.overview.map((item) => item.timestamp) : [],
									y: state.dataSets.overview ? state.dataSets.overview.map((item) => item.m_temp01) : [],
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
									x: state.dataSets.overview ? state.dataSets.overview.map((item) => item.timestamp) : [],
									y: state.dataSets.overview ? state.dataSets.overview.map((item) => item.m_hum01) : [],
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
									x: state.dataSets.overview ? state.dataSets.overview.map((item) => item.timestamp) : [],
									y: state.dataSets.overview ? state.dataSets.overview.map((item) => item.a_co2) : [],
									type: "scatter",
									mode: "markers",
									color: "secondary",
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
