import { Grid } from "@mui/material";
import { memo, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import { useInit } from "../utils/index.js";
import secoConfigs, { organization } from "../config/SecoConfig.js";
import { calculateDates } from "../utils/data-handling-functions.js";
import { cardFooter } from "../utils/card-footer.js";

const SecoCollab = () => {
	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { currentDate, formattedBeginningOfDay } = useMemo(calculateDates, []);

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
