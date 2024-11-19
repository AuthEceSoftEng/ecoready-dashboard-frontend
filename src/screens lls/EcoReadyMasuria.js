import { Grid } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

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

	const stationName = "TOMASZÓW LUBELSKI";
	const fetchConfigs = useMemo(
		() => ecoReadyMasuriaConfigs(stationName, year),
		[year],
	);

	const { state } = useInit(organization, fetchConfigs);

	const cardRef = useRef(null);
	const [cardDimensions, setCardDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const handleResize = () => {
			if (cardRef.current) {
				setCardDimensions({
					width: cardRef.current.offsetWidth,
					height: cardRef.current.offsetHeight,
				});
			}
		};

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={2}>
			<Grid container display="flex" direction="row" justifyContent="space-between" alignItems="center" spacing={2} mt={2}>
				<Grid item>
					{/* Other content can go here */}
				</Grid>
				<Grid item xs={6} sm={6} md={6}>
					{/* Select only the year */}
					<DatePicker type="desktop" label="Year Picker" views={["year"]} width="45%" labelHeight="30px" value={`${year}`} onChange={handleYearChange} />
				</Grid>
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
				<Grid key={index} ref={cardRef} item xs={12} sm={12} md={12}>
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
