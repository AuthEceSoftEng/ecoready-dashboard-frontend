import { useLocation } from "react-router-dom";
import { Grid, Button, Typography, Tooltip } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Accordion from "../components/Accordion.js";
import Dropdown from "../components/Dropdown.js";
import efsaConfigs, { organization } from "../config/EfsaConfig.js";
import useInit from "../utils/screen-init.js";
import {
	extractFields, getCustomDateTime, calculateDates, calculateDifferenceBetweenDates,
	debounce, isValidArray, generateYearsArray, groupByKey,
	findKeyByText,
} from "../utils/data-handling-functions.js";
import { LoadingIndicator, StickyBand, DataWarning } from "../utils/rendering-items.js";
import { europeanCountries } from "../utils/useful-constants.js";

const Efsa = () => {
	const [selectedCountry, setSelectedCountry] = useState(europeanCountries[0].text);
	console.log("Selected country:", selectedCountry);
	const [selectedContaminant, setSelectedContaminant] = useState(null);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [year, setYear] = useState("2019");
	console.log("Selected year:", year);

	const handleYearChange = useCallback((newValue) => {
		setYear(newValue.$y);
	}, []);
	const yearPickerRef = useRef();
	const yearPickerProps = useMemo(() => [
		{
			key: "year-picker",
			customType: "date-picker",
			width: "150px",
			sublabel: "Select Year",
			views: ["year"],
			value: new Date(`${year}-01-01`),
			minDate: new Date("2011-01-01"),
			maxDate: new Date("2021-01-01"),
			onChange: handleYearChange,
		},
	], [handleYearChange, year]);

	const countryDropdown = useMemo(() => ([{
		id: "country-dropdown",
		label: "Select Country",
		items: europeanCountries,
		value: selectedCountry,
		onChange: (event) => {
			const countryText = event.target.value;
			setSelectedCountry(countryText);
		},
	}]), [selectedCountry]);

	const fetchConfigs = useMemo(
		() => (year ? efsaConfigs(year) : null),
		[year],
	);

	const { state } = useInit(organization, fetchConfigs);
	const { isLoading, dataSets, minutesAgo } = state;
	console.log("Efsa dataSets:", dataSets);

	return (
		<Grid container display="flex" direction="row" justifyContent="space-around" spacing={1}>
			<StickyBand dropdownContent={countryDropdown} formRef={yearPickerRef} formContent={yearPickerProps} />
			<Grid item xs={12} sm={12} md={12} lg={12}>
				<Typography gutterBottom variant="h4" align="center">
					{"EFSA Contaminants Data"}
				</Typography>
				<Typography gutterBottom variant="subtitle1" align="center">
					{`Data from ${year} - last updated ${getCustomDateTime(minutesAgo)}`}
				</Typography>
			</Grid>
			<Grid item xs={12} sm={12} md={12} lg={12}>
				<Accordion title="About EFSA Contaminants Data">
					<Typography paragraph variant="body1">
						{"The European Food Safety Authority (EFSA) provides data on various contaminants found in food products across Europe."}
						{"This dashboard allows users to explore contaminant levels by country and year."}
					</Typography>
					<Typography paragraph variant="body1">
						{"Select a country and year to view the relevant data. The data is sourced from EFSA's official databases."}
					</Typography>
				</Accordion>
			</Grid>
		</Grid>

	);
};

export default memo(Efsa);
