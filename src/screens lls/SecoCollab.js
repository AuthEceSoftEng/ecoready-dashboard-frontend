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
	const { currentDate, formattedBeginningOfDay } = useMemo(() => calculateDates(customDate), [customDate]);
	console.log("Current Date", currentDate);
	console.log("Formatted Beginning of Day", formattedBeginningOfDay);

	const fetchConfigs = useMemo(
		() => secoConfigs(formattedBeginningOfDay, currentDate),
		[formattedBeginningOfDay, currentDate],
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
									color: "third",
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
					<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
						{[
							{
								subtitle: "Avg Temperture",
								min: 0,
								max: 40,
								value: state.dataSets.todayTemperature && state.dataSets.todayTemperature.length > 0
									? state.dataSets.todayTemperature.at(-1).avg_m_temp01
									: null,
								color: "gold",
								symbol: "°C",
							},
							{
								subtitle: "Avg Humidity",
								min: 0,
								max: 100,
								value: state.dataSets.todayHumidity && state.dataSets.todayHumidity.length > 0
									? state.dataSets.todayHumidity.at(-1).avg_m_hum01
									: null,
								color: "secondary",
								symbol: "%",
							},
							{
								subtitle: "Avg Co2",
								min: 100,
								max: 1600,
								value: state.dataSets.todayCo2 && state.dataSets.todayCo2.length > 0
									? state.dataSets.todayCo2.at(-1).avg_a_co2
									: null,

								color: "third",
								symbol: "",
							},
						].map((plot, index) => (
							<Grid key={index} item xs={12} md={12} justifyContent="center" sx={{ height: "600px" }}>
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
		</Grid>
	);
};

export default memo(SecoCollab);
