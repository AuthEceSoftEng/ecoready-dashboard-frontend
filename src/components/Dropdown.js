import { MenuItem, Select, FormControl, InputLabel, ListSubheader, ListItemText, Menu } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { useState } from "react";
import { makeStyles } from "@mui/styles";

import Checkbox from "./Checkbox.js";

const useStyles = makeStyles((theme) => {
	const createStyle = (color, isDark = false) => ({
		backgroundColor: theme.palette[color].main,
		color: "white!important",
		borderRadius: (props) => props.borderRadius,
		borderBottom: "0px",
		"&, &:before, &:after": {
			borderBottom: "0px!important",
		},
		"&:hover": {
			backgroundColor: isDark ? theme.palette[`${color}Dark`].main : theme.palette[color].main,
			borderBottom: "0px",
		},
		"&:focus": {
			backgroundColor: isDark ? theme.palette[`${color}Dark`].main : theme.palette[color].main,
			borderBottom: "0px",
		},
		"&:before": {
			borderBottom: "0px",
		},
	});

	const createOutlinedStyle = (color) => ({
		backgroundColor: "transparent",
		borderColor: theme.palette[color]?.main || color,
		borderRadius: (props) => props.borderRadius,
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
	});

	return {
		primary_filled: createStyle("primary", true),
		primary_outlined: createOutlinedStyle("primary"),
		secondary_filled: createStyle("secondary", true),
		secondary_outlined: createOutlinedStyle("secondary"),
		third_filled: createStyle("third", true),
		third_outlined: createOutlinedStyle("third"),
	};
});

// Helper function to get item value
const getItemValue = (item) => (typeof item === "string" ? item : item.text || item.value);

const Dropdown = ({
	id = "custom-dropdown",
	size = "",
	placeholder = "",
	filled = true,
	color = "white",
	background = "secondary",
	width = "",
	height = "",
	borderRadius = "16px",
	items = [],
	value,
	subheader = false,
	multiple = false,
	nested = false,
	onChange,
}) => {
	const classes = useStyles({ borderRadius });
	const [anchorEl, setAnchorEl] = useState(null);
	const [hoveredItem, setHoveredItem] = useState(null);

	const renderValue = (selected) => {
		if (!multiple) return selected;
		return selected.length === 0 ? placeholder : selected.join(", ");
	};

	const isItemSelected = (item) => {
		if (!multiple || !Array.isArray(value)) return false;
		return value.includes(getItemValue(item));
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setHoveredItem(null);
	};

	const handleMenuItemHover = (event, item) => {
		if (nested && item.children?.length > 0) {
			setAnchorEl(event.currentTarget);
			setHoveredItem(item);
		}
	};

	const handleNestedItemClick = (childValue) => {
		onChange({ target: { value: childValue } });
		handleMenuClose();
	};

	// Common MenuItem renderer
	const renderMenuItem = (itemValue, displayValue, key, extraProps = {}) => (
		<MenuItem key={key} value={itemValue} {...extraProps}>
			{multiple && (
				<Checkbox
					checked={isItemSelected(itemValue)}
					sx={{
						color: `${background}.main`,
						"&.Mui-checked": {
							color: `${background}.main`,
						},
					}}
				/>
			)}
			<ListItemText
				primary={displayValue}
				sx={{
					"& .MuiListItemText-primary": {
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					},
				}}
			/>
		</MenuItem>
	);

	const renderNestedMenuItem = (item, index) => {
		const hasChildren = item.children?.length > 0;
		const itemValue = getItemValue(item);

		return (
			<MenuItem
				key={`item-${index}`}
				value={hasChildren ? undefined : itemValue}
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
				onMouseEnter={(e) => handleMenuItemHover(e, item)}
				onMouseLeave={handleMenuClose}
				onClick={hasChildren ? (e) => e.preventDefault() : undefined}
			>
				{multiple && !hasChildren && (
					<Checkbox
						checked={isItemSelected(item)}
						sx={{
							color: `${background}.main`,
							"&.Mui-checked": {
								color: `${background}.main`,
							},
						}}
					/>
				)}
				<ListItemText
					primary={itemValue}
					sx={{
						"& .MuiListItemText-primary": {
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						},
					}}
				/>
				{hasChildren && <ArrowRightIcon sx={{ ml: 1 }} />}
				{hasChildren && hoveredItem?.value === item.value && (
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						anchorOrigin={{ vertical: "top", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "left" }}
						sx={{ pointerEvents: "none" }}
						PaperProps={{ sx: { pointerEvents: "auto", ml: 0.5 } }}
						onClose={handleMenuClose}
					>
						{item.children.map((child, childIndex) => renderMenuItem(
							child.value || child.text || child,
							child.text || child.value || child,
							`child-${index}-${childIndex}`,
							{
								onClick: () => handleNestedItemClick(child.value || child.text || child),
								sx: { minWidth: 150 },
							},
						))}
					</Menu>
				)}
			</MenuItem>
		);
	};

	const renderRegularItems = () => items.flatMap((item, index) => {
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
				...item.options.map((option, optIndex) => renderMenuItem(option.value, option.text, `item-${index}-${optIndex}`, {
					sx: { pl: 4, backgroundColor: "rgba(0, 0, 0, 0.02)" },
				})),
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
				...(item.prices?.products || []).map((product, prodIndex) => renderMenuItem(product.toLowerCase(), product.toLowerCase(), `item-${index}-${prodIndex}`, {
					sx: { pl: 4, backgroundColor: "rgba(0, 0, 0, 0.02)" },
				})),
			];
		}

		// Handle regular items
		const itemValue = getItemValue(item);
		return renderMenuItem(itemValue, itemValue, `item-${index}`);
	});

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
				{nested ? items.map((item, index) => renderNestedMenuItem(item, index)) : renderRegularItems()}
			</Select>
		</FormControl>
	);
};

export default Dropdown;
