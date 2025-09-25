import { Grid, Typography } from "@mui/material";
import { memo, useRef, useMemo, useState, useCallback } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import useInit from "../utils/screen-init.js";
import Footer from "../components/Footer.js";
import concatConfigs, { organization, locations } from "../config/ConcatConfig.js";
import { sumByKey, groupByKey, getMaxValuesByProperty, getSumValuesByProperty, getCustomDateTime, calculateDates } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";

const currentYear = new Date().getFullYear();

const CONCATLL = () => {
	const [location, setLocation] = useState(locations[0]);
	const [year, setYear] = useState(currentYear);
	const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
	const [endDate, setEndDate] = useState(`${currentYear}-12-31`);

	const handleLocationChange = useCallback((event) => {
		setLocation(event.target.value);
	}, []);

	const debouncedSetDate = useMemo(
		() => debounce((date, setter) => {
			const { currentDate } = calculateDates(date);
			setter(currentDate);
		}, 2000),
		[],
	);

	const handleDateChange = useCallback((newValue, setter) => {
		if (!newValue?.$d) return;

		// Immediate visual feedback
		setter(newValue.$d);
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	const handleYearChange = useCallback((newValue) => {
		setYear(newValue.$y);
	}, []);

	const dropdownContent = useMemo(() => [
		{
			id: "location",
			size: "small",
			label: "Select Location",
			items: locations,
			value: location,
			onChange: handleLocationChange,
		},
	], [location]);

	const formRefDateRange = useRef();
	const formContentDateRange = useMemo(() => [
		{
			customType: "date-range",
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			labelSize: 12,
			minDate: new Date("2007-01-01"),
			maxDate: new Date(`${currentYear}-01-01`),
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [startDate, endDate]);

	const formRefDate = useRef();

	const formContentDate = useMemo(() => [
		{
			customType: "date-picker",
			id: "yearPicker",
			width: "170px",
			sublabel: "Select Year",
			views: ["year"],
			value: year,
			minDate: new Date("2007-01-01"),
			maxDate: new Date(`${year}-12-31`),
			labelSize: 12,
			onChange: handleYearChange,
		},
	], [handleYearChange, year]);

	// const stationNameKey = findKeyByText(REGIONS, stationName);
	const fetchConfigs = useMemo(
		() => (concatConfigs(stationName.value, year) : null),
		[location, year],

	);

const { state } = useInit(organization, fetchConfigs);
const { isLoading, dataSets, minutesAgo } = state;
const metrics = useMemo(() => dataSets?.metrics || [], [dataSets]);
const isValidData = useMemo(() => metrics.length > 0, [metrics]);
return (
	<Grid container spacing={2} justifyContent="center" alignItems="center">
		<Grid item xs={12}>
			<DataWarning message="This screen is currently under construction" />
		</Grid>
		<Footer
			sticky
			customImages={[
				{
					src: "../ll_images/CONCATLL.png",
					alt: "CONCATLL Logo",
					link: { url: "https://www.irta.cat/en/noticia/concat-ll-project-starts-development-phase/", target: "_blank", rel: "noopener" },
				},
				{
					src: "../ll_images/IRTA.png",
					alt: "IRTA Logo",
					link: { url: "https://www.irta.cat/en/", target: "_blank", rel: "noopener" },
				},

			]}
			customMessage={(
				<>
					<Typography component="span" sx={{ fontWeight: "bold", fontSize: "0.975rem" }}>
						{"Disclaimer:"}
					</Typography>
					{" "}
					{"These materials have been generated using the CONCAT Wheat Production Dataset developed by IRTA. Each wheat variety has been anonymized using a unique numerical identifier. Users requiring the actual variety names may request this information from the dataset authors (marta.dasilva@irta.cat)."}
					<br />
				</>
			)}
			showDefaultCopyright={false}
		/>
	</Grid>
);
}
export default memo(CONCATLL);
