import { useState } from "react";
import { TextField } from "@mui/material";
import { TimePicker, DateTimePicker, DesktopDatePicker, MobileDatePicker } from "@mui/x-date-pickers";
import { makeStyles } from "@mui/styles";

import colors from "../_colors.scss";

const useStyles = makeStyles(() => ({
	date_picker: {
		color: (props) => colors[props.color] || props.color,
		backgroundColor: (props) => colors[props.background] || props.background,
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
			transform: "translate(14px, 0px) scale(0.7)",
		},
		"& .MuiInputBase-input": {
			padding: (props) => (props.height === "auto" ? undefined : "0 14px"),
		},
	},
}));

const getInputFormat = (views) => {
	if (!views) return "DD/MM/YYYY";
	if (views.length === 1) {
		switch (views[0]) {
			case "year": { return "YYYY";
			}

			case "month": { return "MM/YYYY";
			}

			case "day": { return "DD/MM/YYYY";
			}

			default: { return "DD/MM/YYYY";
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

	const handleChange = (newValue) => {
		setCustomValue(newValue);
		if (onChange) onChange(newValue);
	};

	return (
		<>
			{type === "desktop" && (
				<DesktopDatePicker
					className={classes.date_picker}
					views={views}
					disabled={disabled}
					label={label}
					inputFormat={getInputFormat(views)}
					value={customValue}
					minDate={minDate ?? new Date("2000-01-01")}
					maxDate={maxDate ?? new Date("2050-12-31")}
					renderInput={(params) => <TextField {...params} />}
					onChange={handleChange}
				/>
			)}
			{type === "mobile" && (
				<MobileDatePicker
					className={classes.date_picker}
					views={views}
					disabled={disabled}
					label={label}
					inputFormat={getInputFormat(views)}
					value={customValue}
					minDate={minDate ?? new Date("2000-01-01")}
					maxDate={maxDate ?? new Date("2050-12-31")}
					renderInput={(params) => <TextField {...params} />}
					onChange={handleChange}
				/>
			)}
			{type === "time" && (
				<TimePicker
					className={classes.date_picker}
					disabled={disabled}
					label={label}
					value={customValue}
					renderInput={(params) => <TextField {...params} />}
					onChange={handleChange}
				/>
			)}
			{type === "datetime" && (
				<DateTimePicker
					className={classes.date_picker}
					views={views}
					disabled={disabled}
					label={label}
					value={customValue}
					minDate={minDate ?? new Date("2000-01-01")}
					maxDate={maxDate ?? new Date("2050-12-31")}
					renderInput={(params) => <TextField {...params} />}
					onChange={handleChange}
				/>
			)}
		</>
	);
};

export default DatePicker;
