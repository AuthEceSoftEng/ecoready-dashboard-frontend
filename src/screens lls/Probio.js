import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
// import Dropdown from "../components/Dropdown.js";
import useInit from "../utils/screen-init.js";
import Form from "../components/Form.js";
import { probioConfigs, organization } from "../config/ProbioConfig.js";
// import { monthNames } from "../utils/useful-constants.js";
import { calculateDates, debounce } from "../utils/data-handling-functions.js";
import { cardFooter, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";

const Probio = () => {
	const [startDate, setStartDate] = useState("2023-06-01");
	const [endDate, setEndDate] = useState("2023-06-30");

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 800), // Reduced from 2700ms to 800ms
		[],
	);

	const handleDateChange = useCallback((newValue, setter) => {
		if (!newValue?.$d) return;

		// Immediate visual feedback
		setter(newValue.$d);
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	const formRef = useRef();

	const formContent = useMemo(() => [
		{
			customType: "date-picker",
			id: "start",
			width: "210px",
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
			width: "210px",
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
	const { isLoading, dataSets, minutesAgo } = state;
	const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
	const isValidData = useMemo(() => metrics.length > 0, [metrics]);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid container display="flex" direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
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
				<Grid item sx={{ display: "flex", justifyContent: "flex-end" }} xs={6} md={3} mt={1}>
					<Form ref={formRef} content={formContent} />
				</Grid>
			</Grid>
			{isValidDateRange ? (
				<>
					{[
						{
							title: "Temperature Evolution Per Day",
							data: [
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_temperature_max),
									type: "bar",
									title: "Max",
									color: "primary",
								},
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_temperature_avg),
									type: "bar",
									title: "Avg",
									color: "secondary",
								},
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_temperature_min),
									type: "bar",
									title: "Min",
									color: "third",
								},
							],
							xaxis: { title: "Days" },
							yaxis: { title: "Temperature (°C)" },
						},
						{
							title: "Air Temperature Vs Pressure Correlation",
							data: [
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_temperature_avg * 100),
									type: "scatter",
									mode: "lines",
									title: "Avg Temperature / 100",
									color: "secondary",
								},
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_pressure),
									type: "scatter",
									mode: "lines",
									title: "Air Pressure",
									color: "third",
								},
							],
							xaxis: { title: "Days" },
						},
						{
							title: "Air Temperature Vs Humidity Correlation",
							data: [
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_temperature_avg * 10),
									type: "scatter",
									mode: "lines",
									title: "Avg Temperature / 10",
									color: "secondary",
								},
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_humidity),
									type: "scatter",
									mode: "lines",
									title: "Air Pressure",
									color: "third",
								},
							],
							xaxis: { title: "Days" },
						},
						{
							title: "Air Pressure Vs Humidity Correlation",
							data: [
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_pressure),
									type: "scatter",
									mode: "lines",
									title: "Air Pressure",
									color: "primary",
								},
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_humidity * 10),
									type: "scatter",
									mode: "lines",
									title: "Air Pressure / 10",
									color: "third",
								},
							],
							xaxis: { title: "Days" },
						},
						{
							title: "Complete Overview",
							data: [
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_temperature_max * 100),
									type: "bar",
									title: "Max Temperature / 100",
									color: "secondary",
								},
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_pressure),
									type: "scatter",
									mode: "lines",
									title: "Air Pressure",
									color: "primary",
								},
								{
									x: metrics.map((item) => item.timestamp),
									y: metrics.map((item) => item.air_humidity * 10),
									type: "scatter",
									mode: "lines",
									title: "Air Pressure / 10",
									color: "third",
								},
							],
							xaxis: { title: "Days" },
						},
					].map((card, index) => (
						<Grid key={index} item xs={12} sm={12} md={6}>
							<Card title={card.title} footer={cardFooter({ minutesAgo })}>
								{isValidData
									? isLoading ? (<LoadingIndicator />
									) : (
										<Plot
											scrollZoom
											data={card.data}
											// showLegend={index === 0}
											height="300px"
											xaxis={card.xaxis}
											yaxis={card.yaxis}
										/>
									) : (<DataWarning />
									)}
							</Card>
						</Grid>
					))}
				</>
			) : (<DataWarning message="Please Select a Valid Date Range" />
			)}
		</Grid>
	);
};

export default memo(Probio);
