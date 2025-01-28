import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { makeStyles } from "@mui/styles";

import Checkbox from "./Checkbox.js";

const useStyles = makeStyles((theme) => ({
	primary_filled: {
		backgroundColor: theme.palette.primary.main,
		color: "white!important",
		borderRadius: "10px",
		borderBottom: "0px",
		"&, &:before, &:after": {
			borderBottom: "0px!important",
		},
		"&:hover": {
			backgroundColor: theme.palette.primaryDark.main,
			borderBottom: "0px",
		},
		"&:focus": {
			backgroundColor: theme.palette.primaryDark.main,
			borderBottom: "0px",
		},
		"&:before": {
			borderBottom: "0px",
		},
	},
	primary_outlined: {
		backgroundColor: "transparent",
		borderColor: theme.palette.primary.main,
		borderRadius: "10px",
		borderBottom: "0px",
		"&, &:before, &:after": {
			borderBottom: "0px!important",
		},
		"&:hover": {
			backgroundColor: "transparent",
			borderBottom: "0px",
		},
		"&:focus": {
			backgroundColor: "transparent",
			borderBottom: "0px",
		},
		"&:before": {
			borderBottom: "0px",
		},
	},
	secondary_filled: {
		backgroundColor: theme.palette.secondary.main,
		color: "white!important",
		borderRadius: "10px",
		borderBottom: "0px",
		"&, &:before, &:after": {
			borderBottom: "0px!important",
		},
		"&:hover": {
			backgroundColor: theme.palette.secondaryDark.main,
			borderBottom: "0px",
		},
		"&:focus": {
			backgroundColor: theme.palette.secondaryDark.main,
			borderBottom: "0px",
		},
		"&:before": {
			borderBottom: "0px",
		},
	},
	secondary_outlined: {
		backgroundColor: "transparent",
		borderColor: theme.palette.secondary.main,
		borderRadius: "10px",
		borderBottom: "0px",
		"&, &:before, &:after": {
			borderBottom: "0px!important",
		},
		"&:hover": {
			backgroundColor: "transparent",
			borderBottom: "0px",
		},
		"&:focus": {
			backgroundColor: "transparent",
			borderBottom: "0px",
		},
		"&:before": {
			borderBottom: "0px",
		},
	},
	third_filled: {
		backgroundColor: theme.palette.third.main,
		color: "white!important",
		borderRadius: "10px",
		borderBottom: "0px",
		"&, &:before, &:after": {
			borderBottom: "0px!important",
		},
		"&:hover": {
			backgroundColor: theme.palette.thirdDark.main,
			borderBottom: "0px",
		},
		"&:focus": {
			backgroundColor: theme.palette.thirdDark.main,
			borderBottom: "0px",
		},
		"&:before": {
			borderBottom: "0px",
		},
	},
	third_outlined: {
		backgroundColor: "transparent",
		borderColor: "third",
		borderRadius: "10px",
		borderBottom: "0px",
		"&, &:before, &:after": {
			borderBottom: "0px!important",
		},
		"&:hover": {
			backgroundColor: "transparent",
			borderBottom: "0px",
		},
		"&:focus": {
			backgroundColor: "transparent",
			borderBottom: "0px",
		},
		"&:before": {
			borderBottom: "0px",
		},
	},
}));

const Dropdown = ({
	id = "custom-dropdown",
	size = "",
	placeholder = "",
	filled = true,
	color = "white",
	background = "secondary",
	width = "",
	height = "",
	items = [],
	value,
	multiple = false,
	onChange,
}) => {
	const classes = useStyles();

	return (
		<FormControl fullWidth={!width}>
			{placeholder && (
				<InputLabel
					id={`${id}-label`}
					sx={{
						color: `${color}!important`,
						"&.Mui-focused": {
							color: `${color}!important`,
						},
						"&.MuiFormLabel-root": {
							color: `${color}!important`,
						},
						transform: "translate(14px, -3px) scale(0.7)",
						"&.MuiInputLabel-shrink": {
							transform: "translate(14px, -1px) scale(0.7)",
							color: `${color}!important`,
						},
					}}
				>
					{placeholder}
				</InputLabel>
			)}
			<Select
				id={id}
				labelId={`${id}-label`}
				multiple={multiple}
				value={value}
				label={placeholder}
				className={classes[`${background}_${(filled ? "filled" : "outlined")}`]}
				color={background}
				size={size}
				style={{ color, width, height }}
				autoWidth={!width}
				classes={{
					filled: classes[`${background}_${(filled ? "filled" : "outlined")}`],
					iconFilled: classes[`${background}_${(filled ? "filled" : "outlined")}`],
				}}
				sx={{
					">.MuiOutlinedInput-notchedOutline": {
						border: (filled) ? "none" : "1px solid",
						borderColor: `${background}.main`,
					},
					".MuiSelect-icon": {
						fill: color,
					},
				}}
				onChange={onChange}
			>
				{items.map((item, index) => (
					<MenuItem key={index} value={typeof item === "string" ? item : item.text}>
						{multiple && (
							<Checkbox
								id={index}
								checked={Array.isArray(value) && value.includes(typeof item === "string" ? item : item.text)}
								color={background}
								size="small"
							/>
						)}
						{typeof item === "string" ? item : item.text}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

export default Dropdown;
