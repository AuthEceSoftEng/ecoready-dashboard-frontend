import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Dropdown from "../components/Dropdown.js";
import useInit from "../utils/screen-init.js";
import DatePicker from "../components/DatePicker.js";
import ecoReadyMasuriaConfigs, { organization } from "../config/EcoReadyMasuriaConfig.js";
import { calculateDates, getCustomDateTime } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter } from "../utils/card-footer.js";

const EcoReadyMasuria = () => {
	const customDate = useMemo(() => getCustomDateTime(2006, 1), []);
	console.log("Custom Date", customDate);

	const [year, setYear] = useState(customDate.getFullYear());

	const handleYearChange = useCallback((newValue) => {
		setYear(newValue.$y); // Select only the year from the resulting object
	}, []);

	// Memoize the date calculations and fetchConfigs to reduce re-calculations
	const { month, currentDate } = useMemo(
		() => calculateDates(new Date(year, 0, 2)),
		[year],
	);
	console.log("currentDate", currentDate);

	const [stationName, setStationName] = useState("BEZEK");
	const fetchConfigs = useMemo(
		() => ecoReadyMasuriaConfigs(stationName, year),
		[stationName, year],
	);

	const { state } = useInit(organization, fetchConfigs);

	const dropdownContent = useMemo(() => [
		{
			id: "station name",
			size: "small",
			width: "200px",
			height: "40px",
			color: "primary",
			label: "Weather Station",
			items: [
				{ value: "BEZEK", text: "Bezek" },
				{ value: "GRABIK", text: "Grabik" },
				{ value: "PRABUTY", text: "Prabuty" },
				{ value: "WARSZAWA-FILTRY", text: "Warszawa-Filtry" },
			],
			defaultValue: "BEZEK",
			onChange: (event) => {
				setStationName(event.target.value);
			},

		},
	], []);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid container display="flex" direction="row" justifyContent="flex-end" alignItems="center" spacing={2} mt={1}>
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} md={3}>
					<Dropdown
						id={dropdownContent[0].id}
						value={stationName}
						placeholder={dropdownContent[0].label}
						items={dropdownContent[0].items}
						size={dropdownContent[0].size}
						width={dropdownContent[0].width}
						height={dropdownContent[0].height}
						background={dropdownContent[0].color}
						onChange={dropdownContent[0].onChange}
					/>
				</Grid>
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} md={2}>
					{/* Select only the year */}
					<DatePicker
						type="desktop"
						label="Year Picker"
						views={["year"]}
						value={`${year}`}
						onChange={handleYearChange}
					/>
				</Grid>
			</Grid>
			{[
				{
					title: "Daily Temperature Evolution",
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
				{
					title: "Daily Minimum Ground Temperature",
					data: [
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.minimum_ground_temperature) : [],
							type: "bar",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Temperature (°C)" },
				},
				{
					title: "Daily Precipitation Sum",
					data: [
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.daily_precipitation_sum) : [],
							type: "bar",
							color: "primary",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Precipitation (mm)" },
				},
				{
					title: "Daily Snow Cover Height",
					data: [
						{
							x: state.dataSets.metrics
								? state.dataSets.metrics.map((item) => item.timestamp)
								: [],
							y: state.dataSets.metrics
								? state.dataSets.metrics
									.map((item) => item.snow_cover_height) : [],
							type: "bar",
							color: "blue",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Snow Height (cm)" },
				},
			].map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={6}>
					<Card title={card.title} footer={cardFooter({ minutesAgo: state.minutesAgo })}>
						<Plot
							scrollZoom
							data={card.data}
							title={`${monthNames[month].text} ${year}`}
							showLegend={index === 0}
							height="300px"
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
