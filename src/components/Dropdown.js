import { MenuItem, Select, FormControl, InputLabel, ListSubheader, Chip, Box } from "@mui/material";
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
	placeholder = "",
	filled = true,
	color = "white",
	background = "secondary",
	width = "",
	height = "",
	items = [],
	value,
	subheader = false,
	multiple = false,
	onChange,
}) => {
	const classes = useStyles();

	// Custom render for multiple selection
	const renderValue = (selected) => {
		if (!multiple) return selected;

		if (selected.length === 0) {
			return placeholder;
		}

		return (
			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
				{selected.map((key) => (
					<Chip
						key={key}
						label={key}
						size="small"
						sx={{
							height: "20px",
							backgroundColor: `${background}.light`,
							color: "white",
						}}
					/>
				))}
			</Box>
		);
	};

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
				value={value}
				label={placeholder}
				multiple={multiple}
				renderValue={multiple ? renderValue : undefined}
				className={classes[`${background}_${filled ? "filled" : "outlined"}`]}
				color={background}
				size={size}
				style={{ color, width, height }}
				autoWidth={!width}
				classes={{
					filled: classes[`${background}_${filled ? "filled" : "outlined"}`],
					iconFilled: classes[`${background}_${filled ? "filled" : "outlined"}`],
				}}
				sx={{
					">.MuiOutlinedInput-notchedOutline": {
						border: filled ? "none" : "1px solid",
						borderColor: `${background}.main`,
					},
					".MuiSelect-icon": {
						fill: color,
					},
				}}
				onChange={onChange}
			>
				{items.flatMap((item, index) => {
					// Handle lcaIndicators structure (has label and options)
					if (subheader && item.label && item.options) {
						return [
							<ListSubheader
								key={`header-${index}`}
								sx={{
									fontWeight: "bold",
									borderTop: "1px solid rgba(0, 0, 0, 0.12)",
									color: "black!important",
								}}
							>
								{item.label}
							</ListSubheader>,
							...item.options.map((option, optIndex) => (
								<MenuItem
									key={`item-${index}-${optIndex}`}
									value={option}
									sx={{
										pl: 4, // Adds left padding to indent the items
										backgroundColor: "rgba(0, 0, 0, 0.02)",
									}}
								>
									{option}
								</MenuItem>
							)),
						];
					}

					// Handle products structure (has subheader and prices.products)
					if (subheader && item.subheader) {
						return [
							<ListSubheader
								key={`header-${index}`}
								sx={{
									fontWeight: "bold",
									borderTop: "1px solid rgba(0, 0, 0, 0.12)",
									color: "black!important",
								}}
							>
								{typeof item === "string" ? item : item.text}
							</ListSubheader>,
							...((item.prices?.products || []).map((product) => product.toLowerCase()) || []).map((product, prodIndex) => (
								<MenuItem
									key={`item-${index}-${prodIndex}`}
									value={product}
									sx={{
										pl: 4, // Adds left padding to indent the items
										backgroundColor: "rgba(0, 0, 0, 0.02)",
									}}
								>
									{product}
								</MenuItem>
							)),
						];
					}
					// Handle regular items (no subheader)

					return (
						<MenuItem key={`item-${index}`} value={typeof item === "string" ? item : item.text || item.value}>
							{typeof item === "string" ? item : item.text || item.value}
						</MenuItem>
					);
				})}
			</Select>
		</FormControl>
	);
};

export default Dropdown;
