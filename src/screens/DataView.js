import { Grid, Typography, Box, Link as MaterialLink } from "@mui/material";
import { memo, useMemo, useState, useCallback, useRef } from "react";
// import { Edit, Archive, Delete } from "@mui/icons-material";
import { dateOldToNew, stringAToZInsensitive } from "@iamnapo/sort";

import Table from "../components/Table.js";
import StickyBand from "../components/StickyBand.js";
import { debounce, calculateDates } from "../utils/data-handling-functions.js";
// import { monthNames } from "../utils/useful-constants.js";
import { DataWarning } from "../utils/rendering-items.js";
import { isFuzzyMatch, dayjs } from "../utils/index.js";
import { products } from "../utils/useful-constants.js"; // Import the products

const DataView = () => {
	const [startDate, setStartDate] = useState("2024-06-01");
	const [endDate, setEndDate] = useState("2024-07-01");
	const [selectedProduct, setSelectedProduct] = useState(""); // Track the selected product

	// Debounced date setters
	const debouncedSetDate = useMemo(() => debounce((date, setter) => {
		const { currentDate } = calculateDates(date);
		setter(currentDate);
	}, 800), []);

	const handleDateChange = useCallback((newValue, setter) => {
		if (!newValue?.$d) return;
		setter(newValue.$d);
		debouncedSetDate(newValue.$d, setter);
	}, [debouncedSetDate]);

	// Date range form
	const formRefDate = useRef();
	const formContentDate = useMemo(() => [
		{
			customType: "date-range",
			id: "dateRange",
			type: "desktop",
			views: ["month", "year"],
			startValue: startDate,
			startLabel: "Start date",
			endValue: endDate,
			endLabel: "End date",
			background: "primary",
			labelSize: 12,
			onStartChange: (newValue) => handleDateChange(newValue, setStartDate),
			onEndChange: (newValue) => handleDateChange(newValue, setEndDate),
		},
	], [startDate, endDate, handleDateChange]);

	// Product dropdown
	const dropdownContent = useMemo(() => [
		{
			id: "productSelector",
			multiple: false,
			value: selectedProduct,
			label: "Select Product",
			items: products.map((product) => ({
				value: product.value, // Use value for selection
				text: product.text, // Display the product text
			})),
			size: "small",
			width: "200px",
			onChange: (event) => setSelectedProduct(event.target.value), // Update the selected product
		},
	], [selectedProduct]);

	// Rest of your logic (data fetching, validation, table setup)...
	const isValidDateRange = useMemo(() => startDate && endDate && new Date(startDate) <= new Date(endDate), [startDate, endDate]);
	const dummyData = [
		{ id: "test", name: "Test", status: "active", createdAt: new Date() },
		{ id: "test2", name: "Test2", status: "inactive", createdAt: new Date() },
		{ id: "test3", name: "Test3", status: "inactive", createdAt: new Date() },
	];

	const tableColumns = useMemo(() => [
		{
			Header: <Typography id="name_header" variant="h6">{"Name"}</Typography>,
			accessor: "name",
			id: "name",
			filterable: true,
			minWidth: 200,
			sortMethod: (value1, value2) => stringAToZInsensitive()(value1, value2),
			filterMethod: ({ id, value }, row) => isFuzzyMatch(row[id], value),
			Cell: ({ value }) => (
				<Box sx={{ display: "flex", ml: 1, alignItems: "center" }}>
					<MaterialLink underline="none" color="third" onClick={() => console.log(value)}>{value}</MaterialLink>
				</Box>
			),
		},
		{
			Header: <Typography variant="h6">{"Status"}</Typography>,
			accessor: "status",
			id: "status",
			filterable: true,
			minWidth: 250,
			maxWidth: 380,
			style: { overflow: "visible" },
			sortMethod: (value1, value2) => stringAToZInsensitive()(value1, value2),
			filterMethod: ({ id, value }, row) => isFuzzyMatch(row[id], value),
			Cell: ({ value }) => (
				<Box sx={{ display: "flex", ml: 1, alignItems: "center", justifyContent: "center" }}>
					<Typography color={value.toLowerCase() === "active" ? "success.main" : "error.main"}>{value}</Typography>
				</Box>
			),
		},
		{
			Header: <Typography variant="h6">{"Created"}</Typography>,
			accessor: "createdAt",
			id: "createdAt",
			minWidth: 250,
			maxWidth: 380,
			style: { overflow: "visible" },
			sortMethod: (value1, value2) => dateOldToNew((v) => new Date(v))(value1, value2),
			Cell: ({ value }) => (
				<Box sx={{ display: "flex", ml: 1, alignItems: "center", justifyContent: "center" }}>
					<Typography>{dayjs(value).format("L")}</Typography>
				</Box>
			),
		},
	], []);

	return (
		<Grid
			container
			direction="column"
			style={{
				width: "100%",
				height: "100vh",
				overflow: "hidden",
			}}
		>
			{/* StickyBand with product dropdown */}
			<Grid item style={{ flexShrink: 0 }}>
				<StickyBand
					formRef={formRefDate}
					formContent={formContentDate}
					dropdownContent={dropdownContent} // Add the product dropdown
				/>
			</Grid>

			{/* Table Content */}
			{isValidDateRange ? (
				<Grid
					item
					style={{
						flexGrow: 1,
						width: "100%",
						overflow: "auto",
					}}
				>
					<Table
						data={dummyData}
						noDataText="No data available!"
						columns={tableColumns}
						defaultSorted={[{ id: "name", desc: true }]}
					/>
				</Grid>
			) : (
				<Grid
					item
					style={{
						flexGrow: 1,
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<DataWarning message="Please Select a Valid Date Range" />
				</Grid>
			)}
		</Grid>
	);
};

export default memo(DataView);
