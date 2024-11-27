import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
// import Dropdown from "../components/Dropdown.js";
import useInit from "../utils/screen-init.js";
import Form from "../components/Form.js";
import { probioConfigs, organization } from "../config/ProbioConfig.js";
import { monthNames } from "../utils/useful-constants.js";
import { calculateDates } from "../utils/data-handling-functions.js";
import { cardFooter } from "../utils/card-footer.js";

const debounce = (func, delay) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func(...args);
		}, delay);
	};
};

const Probio = () => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
			console.log(setter === setStartDate ? "Start Date" : "End Date", currentDate);
		}, 3000),
		[],
	);

	const handleDateChange = useCallback((newValue, setter) => {
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	const formRef = useRef();

	const formContent = useMemo(() => [
		{
			customType: "date-picker",
			id: "start",
			type: "desktop",
			label: "From:",
			sublabel: "Start date",
			background: "primary",
			value: startDate,
			labelPosition: "side",
			labelSize: 12,
			onChange: (newValue) => handleDateChange(newValue, setStartDate),
		},
		{
			customType: "date-picker",
			id: "end",
			type: "desktop",
			label: "To:",
			sublabel: "End date",
			background: "primary",
			value: endDate,
			labelPosition: "side",
			labelSize: 12,
			onChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [startDate, endDate, handleDateChange]);

	const isValidDateRange = useMemo(() => startDate && endDate && new Date(startDate) <= new Date(endDate), [startDate, endDate]);

	const fetchConfigs = useMemo(
		() => (isValidDateRange ? probioConfigs(startDate, endDate) : null),
		[startDate, endDate, isValidDateRange],
	);

	const { state } = useInit(organization, fetchConfigs);
	const metrics = state?.dataSets?.metrics || [];
	const isValidData = Array.isArray(metrics) && metrics.length > 0;

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid container display="flex" direction="row" justifyContent="flex-end" alignItems="center" spacing={2} mt={1}>
				{/* <Grid item sx={{ display: "flex", justifyContent: "flex-end" }} md={3}>
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
				</Grid> */}
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} md={5}>
					<Form ref={formRef} content={formContent} />
				</Grid>
			</Grid>
			{[
				{
					title: "Temperature Evolution Per Day",
					data: [
						{
							x: isValidData ? metrics.map((item) => item.timestamp) : [],
							y: isValidData ? metrics.map((item) => item.air_temperature_max) : [],
							type: "bar",
							title: "Max",
							color: "primary",
						},
						{
							x: isValidData ? metrics.map((item) => item.timestamp) : [],
							y: isValidData ? metrics.map((item) => item.air_temperature_avg) : [],
							type: "bar",
							title: "Avg",
							color: "secondary",
						},
						{
							x: isValidData ? metrics.map((item) => item.timestamp) : [],
							y: isValidData ? metrics.map((item) => item.air_temperature_min) : [],
							type: "bar",
							title: "Min",
							color: "third",
						},
					],
					xaxis: { title: "Days" },
					yaxis: { title: "Temperature (°C)" },
				},
				// {
				// 	title: "Minimum Ground Temperature Per Day",
				// 	data: [
				// 		{
				// 			x: state.dataSets.metrics
				// 				? state.dataSets.metrics.map((item) => item.timestamp)
				// 				: [],
				// 			y: state.dataSets.metrics
				// 				? state.dataSets.metrics
				// 					.map((item) => item.minimum_ground_temperature) : [],
				// 			type: "bar",
				// 			color: "third",
				// 		},
				// 	],
				// 	xaxis: { title: "Days" },
				// 	yaxis: { title: "Temperature (°C)" },
				// },
				// {
				// 	title: "Daily Precipitation Sum",
				// 	data: [
				// 		{
				// 			x: state.dataSets.metrics
				// 				? state.dataSets.metrics.map((item) => item.timestamp)
				// 				: [],
				// 			y: state.dataSets.metrics
				// 				? state.dataSets.metrics
				// 					.map((item) => item.daily_precipitation_sum) : [],
				// 			type: "bar",
				// 			color: "primary",
				// 		},
				// 	],
				// 	xaxis: { title: "Days" },
				// 	yaxis: { title: "Precipitation (mm)" },
				// },
				// {
				// 	title: "Daily Snow Cover Height",
				// 	data: [
				// 		{
				// 			x: state.dataSets.metrics
				// 				? state.dataSets.metrics.map((item) => item.timestamp)
				// 				: [],
				// 			y: state.dataSets.metrics
				// 				? state.dataSets.metrics
				// 					.map((item) => item.snow_cover_height) : [],
				// 			type: "bar",
				// 			color: "blue",
				// 		},
				// 	],
				// 	xaxis: { title: "Days" },
				// 	yaxis: { title: "Snow Height (cm)" },
				// },
			].map((card, index) => (
				<Grid key={index} item xs={12} sm={12} md={6}>
					<Card title={card.title} footer={cardFooter({ minutesAgo: state.minutesAgo })}>
						<Plot
							scrollZoom
							data={card.data}
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

export default memo(Probio);
