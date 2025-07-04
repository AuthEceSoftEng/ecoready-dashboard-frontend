import { useState, useRef, useEffect } from "react"; // Add useEffect
import { TextField } from "@mui/material";
import { TimePicker, DateTimePicker, DesktopDatePicker, MobileDatePicker } from "@mui/x-date-pickers";
import { makeStyles } from "@mui/styles";

import colors from "../_colors.scss";

const useStyles = makeStyles(() => ({
	date_picker: {
		color: (props) => colors[props.color] || props.color,
		backgroundColor: "#1f2d45", // this is a hack
		minWidth: "160px",
		borderRadius: (props) => props.borderRadius,
		outline: "none",
		width: (props) => props.width,
		"& .MuiInputBase-root": {
			height: (props) => props.height,
		},
		"& .MuiInputLabel-root": {
			// Default position
			transform: "translate(14px, 8px) scale(1)",
		},
		"& .MuiInputLabel-root.MuiInputLabel-shrink": {
			// Shrunk position
			transform: "translate(14px, 10px) scale(0.7)",
		},
		"& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
			// Additional specificity for outlined variant
			transform: "translate(14px, -1px) scale(0.7)",
		},
		"& .MuiInputBase-input": {
			padding: (props) => (props.height === "auto" ? undefined : "0 14px"),
		},
		"& .MuiFormHelperText-root": {
			color: (error) => (error ? "#f44336" : "inherit"),
			marginLeft: "0",
			marginTop: "4px",
		},
	},
	container: {
		width: (props) => props.width,
		display: "flex",
		flexDirection: "row", // Change to row to position elements side by side
		alignItems: "flex-start",
		position: "relative", // Enable relative positioning for absolute children
	},
	errorMessage: {
		position: "absolute", // Position relative to container
		// left: "155px", // Position to the left of the date picker
		top: "75%", // Position at 50% from top
		// transform: "translateY(-40%)", // Pull back up by half of its own height
		color: "#d32f2f",
		fontSize: "0.75rem",
		fontFamily: "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
		fontWeight: 400,
		lineHeight: 1.66,
		padding: "8px 12px",
		width: "180px", // Fixed width
		backgroundColor: "#fff",
		borderRadius: "4px",
		boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
		zIndex: 9999,
	},
	datePickerWrapper: {
		flexGrow: 1, // Take remaining space
	},
	errorLabel: {
		fontWeight: 700, // Corrected from 11700 to 700 for proper bold text
		color: "#f44336", // Bright red for emphasis
		marginRight: "4px",
	},
}));

const getInputFormat = (views) => {
	if (!views) return "DD/MM/YYYY";
	if (views.length === 1) {
		switch (views[0]) {
			case "year": {
				return "YYYY";
			}

			case "month": {
				return "MM/YYYY";
			}

			case "day": {
				return "DD/MM/YYYY";
			}

			default: {
				return "DD/MM/YYYY";
			}
		}
	}

	if (views.includes("year") && views.includes("month") && !views.includes("day")) {
		return "MM/YYYY";
	}

	return "DD/MM/YYYY";
};

const DatePicker = ({
	type = "desktop",
	value = null,
	onChange,
	disabled = false,
	label = "Date",
	views = ["day", "month", "year"],
	background = "primary",
	color = "white",
	borderRadius = "10px",
	width = "100%",
	height = "40px",
	minDate,
	maxDate,
}) => {
	const classes = useStyles({ background, color, borderRadius, width, height });
	const [customValue, setCustomValue] = useState(value);
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const lastValidValueRef = useRef(value);
	const datePickerRef = useRef(null);
	const [isEditing, setIsEditing] = useState(false);

	// Handle clicks outside the date picker
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (datePickerRef.current && !datePickerRef.current.contains(event.target) && isEditing) {
				// If clicked outside and there's an error, reset to last valid value
				if (error) {
					// Force a reset of the component's value
					const previousValue = lastValidValueRef.current;

					// First clear the value then set it back to force UI update
					setCustomValue(null);

					// Use a short timeout to ensure the null value gets processed
					setTimeout(() => {
						setCustomValue(previousValue);
						setError(false);
						setErrorMessage("");
						if (onChange) onChange(previousValue);
					}, 0);
				}

				setIsEditing(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [error, onChange, isEditing]);

	// Track when editing starts
	const handleFocus = () => {
		setIsEditing(true);
	};

	const handleChange = (newValue) => {
		// First check if it's a valid date
		if (newValue === null || !Number.isNaN(new Date(newValue).getTime())) {
			const effectiveMinDate = minDate ?? new Date("2000-01-01");
			const effectiveMaxDate = maxDate ?? new Date("2050-12-31");

			if (newValue !== null && (newValue < effectiveMinDate || newValue > effectiveMaxDate)) {
				setError(true);
				setErrorMessage(`Date must be between ${effectiveMinDate.toLocaleDateString()} and ${effectiveMaxDate.toLocaleDateString()}`);
				// if (onChange) onChange(newValue);
			} else {
				// Valid date within range
				setCustomValue(newValue);
				lastValidValueRef.current = newValue; // Store as last valid value
				setError(false);
				setErrorMessage("");
				if (onChange) onChange(newValue);
			}
		} else {
			// Invalid date format
			setError(true);
			setErrorMessage("Invalid date format");
		}
	};

	const handleKeyboardInput = (event) => {
		if (event.key === "Enter") {
			event.preventDefault(); // Always prevent default on Enter to handle validation

			// Parse the input value
			const inputDate = new Date(event.target.value);
			const effectiveMinDate = minDate ?? new Date("2000-01-01");
			const effectiveMaxDate = maxDate ?? new Date("2050-12-31");

			// Check if valid date
			if (Number.isNaN(inputDate.getTime())) {
				setError(true);
				setErrorMessage("Invalid date format");
				return;
			}

			// Check if within range
			if (inputDate < effectiveMinDate || inputDate > effectiveMaxDate) {
				setError(true);
				setErrorMessage(`Date must be between ${effectiveMinDate.toLocaleDateString()} and ${effectiveMaxDate.toLocaleDateString()}`);
				return;
			}

			// Valid date in range
			setError(false);
			setErrorMessage("");
			setCustomValue(inputDate);
			if (onChange) onChange(inputDate);
		}
	};

	const handleBlur = (event) => {
		// Get the input field's value
		const inputValue = event.target.value;

		// Check if the value is a valid and complete date
		const inputDate = new Date(inputValue);

		// Reset to last valid value if input is empty, incomplete, or invalid
		if (!inputValue || inputValue.trim() === "" || Number.isNaN(inputDate.getTime())) {
			setCustomValue(lastValidValueRef.current);
			setError(false);
			setErrorMessage("");
			if (onChange) onChange(lastValidValueRef.current);
		}
	};

	return (
		<>
			{type === "desktop" && (
				<div ref={datePickerRef} className={classes.container}>
					<DesktopDatePicker
						className={classes.date_picker}
						views={views}
						disabled={disabled}
						label={label}
						inputFormat={getInputFormat(views)}
						value={customValue}
						minDate={minDate ?? new Date("2000-01-01")}
						maxDate={maxDate ?? new Date("2050-12-31")}
						renderInput={(params) => (
							<TextField
								{...params}
								error={error}
								onKeyDown={handleKeyboardInput}
								onBlur={handleBlur}
								onFocus={handleFocus}
							/>
						)}
						onChange={handleChange}
					/>
					{error && (
						<div className={classes.errorMessage}>
							<span className={classes.errorLabel}>{"Error:"}</span>
							{" "}
							{errorMessage}
						</div>
					)}
				</div>
			)}
			{type === "mobile" && (
				<div ref={datePickerRef} className={classes.container}>
					<MobileDatePicker
						className={classes.date_picker}
						views={views}
						disabled={disabled}
						label={label}
						inputFormat={getInputFormat(views)}
						value={customValue}
						minDate={minDate ?? new Date("2000-01-01")}
						maxDate={maxDate ?? new Date("2050-12-31")}
						renderInput={(params) => (
							<TextField
								{...params}
								error={error}
								onKeyDown={handleKeyboardInput}
								onBlur={handleBlur}
								onFocus={handleFocus}
							/>
						)}
						onChange={handleChange}
					/>
					{error && (
						<div className={classes.errorMessage}>
							<span className={classes.errorLabel}>{"Error:"}</span>
							{" "}
							{errorMessage}
						</div>
					)}
				</div>
			)}
			{type === "time" && (
				<div ref={datePickerRef} className={classes.container}>
					<TimePicker
						className={classes.date_picker}
						disabled={disabled}
						label={label}
						value={customValue}
						renderInput={(params) => (
							<TextField
								{...params}
								error={error}
								onKeyDown={handleKeyboardInput}
								onBlur={handleBlur}
								onFocus={handleFocus}
							/>
						)}
						onChange={handleChange}
					/>
					{error && (
						<div className={classes.errorMessage}>
							<span className={classes.errorLabel}>{"Error:"}</span>
							{" "}
							{errorMessage}
						</div>
					)}
				</div>
			)}
			{type === "datetime" && (
				<div ref={datePickerRef} className={classes.container}>
					<DateTimePicker
						className={classes.date_picker}
						views={views}
						disabled={disabled}
						label={label}
						value={customValue}
						minDate={minDate ?? new Date("2000-01-01")}
						maxDate={maxDate ?? new Date("2050-12-31")}
						renderInput={(params) => (
							<TextField
								{...params}
								error={error}
								onKeyDown={handleKeyboardInput}
								onBlur={handleBlur}
								onFocus={handleFocus}
							/>
						)}
						onChange={handleChange}
					/>
					{error && (
						<div className={classes.errorMessage}>
							<span className={classes.errorLabel}>{"Error:"}</span>
							{" "}
							{errorMessage}
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default DatePicker;
