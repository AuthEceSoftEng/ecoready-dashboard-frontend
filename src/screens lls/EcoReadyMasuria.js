import { Grid } from "@mui/material";
import { memo, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
// import Form from "../components/Form.js";
import useInit from "../utils/screen-init.js";
import DatePicker from "../components/DatePicker.js";
import ecoReadyMasuriaConfigs, { organization } from "../config/EcoReadyMasuriaConfig.js";
import { calculateDates, getCustomDateTime } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter } from "../utils/card-footer.js";

const EcoReadyMasuria = () => {
	const customDate = useMemo(() => getCustomDateTime(2016, 1), []);
	console.log("Custom Date", customDate);

	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { year, month, currentDate, formattedBeginningOfMonth, formattedBeginningOfHour } = useMemo(
		() => calculateDates(customDate),
		[customDate],
	);
	console.log("currentDate", currentDate);

	const stationName = "TOMASZÓW LUBELSKI";
	const fetchConfigs = useMemo(
		() => ecoReadyMasuriaConfigs(stationName, year, formattedBeginningOfMonth, formattedBeginningOfHour),
		[formattedBeginningOfMonth, year, formattedBeginningOfHour],
	);

	const { state } = useInit(organization, fetchConfigs);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid item mt={2}>
				{/* Select only the year */}
				<DatePicker type="desktop" label="Year Picker" views={["year"]} />
			</Grid>
			{[
				{
					title: "Temperature Evolution Per Day",
					data: [
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.maximum_daily_temperature) : [],
							type: "scatter",
							mode: "lines+markers",
							title: "Max",
							color: "primary",
						},
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.average_daily_temperature) : [],
							type: "scatter",
							mode: "lines+markers",
							title: "Avg",
							color: "secondary",
						},
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.minimum_daily_temperature) : [],
							type: "scatter",
							mode: "lines+markers",
							title: "Min",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Temperature (°C)" },
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={12} mt={2}>
					<Card title={card.title} footer={cardFooter({ minutesAgo: state.minutesAgo })}>
						<Plot
							scrollZoom
							height="250px"
							data={card.data}
							title={`${monthNames[month].text} ${year}`}
							showLegend={index === 0}
							xaxis={card.xaxis}
							yaxis={card.yaxis}
						/>
					</Card>
				</Grid>
			))}
		</Grid>
	);
};

export default memo(EcoReadyMasuria);
