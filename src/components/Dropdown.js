import { MenuItem, Select } from "@mui/material";
import { makeStyles } from "@mui/styles";

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
	placeholder = "Placeholder",
	filled = true,
	color = "white",
	background = "secondary",
	showPlaceholder = true,
	width = "",
	items = [],
	value,
	onChange,
}) => {
	const classes = useStyles();

	return (
		<Select
			id={id}
			value={value}
			displayEmpty={showPlaceholder}
			className={classes[`${background}_${(filled ? "filled" : "outlined")}`]}
			color={background}
			size={size}
			style={{ color, width, height: "100%" }}
			autoWidth={!width}
			classes={{
				filled: classes[`${background}_${(filled ? "filled" : "outlined")}`],
				iconFilled: classes[`${background}_${(filled ? "filled" : "outlined")}`],
			}}
			sx={{ ">.MuiOutlinedInput-notchedOutline": { border: (filled) ? "none" : "1px solid", borderColor: `${background}.main` } }}
			renderValue={(selected) => (selected || placeholder)}
			onChange={onChange}
		>
			{items.map((it, index) => (
				<MenuItem key={it.value || index} value={it.value}>{it.text}</MenuItem>
			))}
		</Select>
	);
};

export default Dropdown;
