import { useCallback, memo } from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table-6";
import { Button, Typography, MenuItem, FormControl, Select, InputAdornment, Input } from "@mui/material";
import { NavigateBefore, NavigateNext, Search } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import { shallow } from "zustand/shallow";

import { isFuzzyMatch } from "../utils/index.js";
import useGlobalState from "../use-global-state.js";

const useStyles = makeStyles((theme) => ({
	paginationButton: {
		backgroundColor: theme.palette.primary.main,
		borderRadius: 3 * theme.shape.borderRadius,
		color: "white!important",
		"&:hover": {
			backgroundColor: theme.palette.primary.main,
		},
	},
	formControl: {
		marginRight: theme.spacing(0.5),
		minWidth: 70,
	},
	input: {
		padding: `${theme.spacing(0.5)} !important`,
		color: "white",
	},
}));

const defaultFilterMethod = ({ id, value }, row) => isFuzzyMatch(row[id], value);

const Table = (props) => {
	const {
		data,
		columns,
		noDataText,
		defaultSorted,
		className,
		customPageSize,
		showPageSizeOptions = true,
		...otherProps
	} = props;
	const { defaultPageSize, setDefaultPageSize } = useGlobalState((e) => ({
		defaultPageSize: e.defaultPageSize,
		setDefaultPageSize: e.setDefaultPageSize,
	}), shallow);
	const classes = useStyles();
	const theme = useTheme();

	const FilterComponent = useCallback(({ filter = { value: "" }, onChange }) => (
		<Input
			disableUnderline
			type="search"
			value={filter.value}
			name="search"
			sx={{ width: "100%", position: "relative", ">.MuiInput-input": { height: "100%" }, px: 1, py: 0.5 }}
			startAdornment={<InputAdornment sx={{ position: "absolute" }} position="end"><Search sx={{ display: filter?.value ? "none" : "block" }} /></InputAdornment>}
			onChange={(event) => onChange(event.target.value)}
		/>
	), []);

	const PreviousComponent = useCallback((prps) => (
		<Button variant="outlined" size="small" {...prps} className={classes.paginationButton}>
			<NavigateBefore />
		</Button>
	), [classes.paginationButton]);

	const NextComponent = useCallback((prps) => (
		<Button variant="outlined" size="small" {...prps} className={classes.paginationButton}>
			<NavigateNext />
		</Button>
	), [classes.paginationButton]);

	const getTheadTrProps = useCallback(() => ({
		style: {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.common.white,
			borderBottom: `1px solid ${theme.palette.divider}`, // Optional: Add a subtle border
		},
	}), [theme.palette.common.white, theme.palette.primary.main, theme.palette.divider]);

	const getThProps = useCallback(() => ({
		style: {
			backgroundColor: theme.palette.common.white, // Set header cell background to white
			color: theme.palette.text.primary, // Ensure text is neutral
			textAlign: "center", // Center align the text
			padding: theme.spacing(1), // Add padding for better appearance
		},
	}), [theme.palette.common.white, theme.palette.text.primary, theme.spacing]);

	// Custom row background color
	const getTdProps = useCallback(() => ({
		style: {
			backgroundColor: theme.palette.common.white,
			color: theme.palette.text.primary,
			textAlign: "center",
			verticalAlign: "middle",
			borderBottom: `1px solid ${theme.palette.divider}`, // Add only bottom borders for horizontal lines
			borderLeft: "none", // Ensure no vertical borders
			borderRight: "none", // Ensure no vertical borders
		},
	}), [theme.palette.common.white, theme.palette.text.primary, theme.palette.divider]);

	const getTableProps = useCallback(() => ({
		style: {
			backgroundColor: theme.palette.common.white,
			border: `${theme.spacing(0.3)} solid ${theme.palette.primary.main}`,
			borderRadius: 2.5 * theme.shape.borderRadius,
		},
	}), [theme]);

	const getPaginationProps = useCallback(() => ({
		style: { margin: theme.spacing(2, 5), backgroundColor: "transparent", border: "none", boxShadow: "none", color: theme.palette.common.black },
	}), [theme]);

	const renderPageSizeOptions = useCallback(({ pageSize, onPageSizeChange, pageSizeOptions, rowsText }) => (
		<FormControl className={classes.formControl}>
			<Select
				autoWidth
				value={pageSize}
				inputProps={{ className: classes.input }}
				IconComponent={() => null}
				onChange={(e) => { setDefaultPageSize(Number(e.target.value)); onPageSizeChange(Number(e.target.value)); }}
			>
				{pageSizeOptions.map((option, i) => (
					<MenuItem key={i} value={option}>
						<Typography sx={{ color: theme.palette.text.primary }}>
							{" "}
							{/* Set text color explicitly */}
							{`${option} ${rowsText}`}
						</Typography>
					</MenuItem>
				))}
			</Select>
		</FormControl>
	), [classes.formControl, classes.input, setDefaultPageSize]);

	return (
		<ReactTable
			showPageSizeOptions={showPageSizeOptions}
			showPaginationBottom={showPageSizeOptions}
			data={data}
			noDataText={noDataText}
			columns={columns}
			defaultSorted={defaultSorted}
			defaultFilterMethod={defaultFilterMethod}
			defaultPageSize={customPageSize || defaultPageSize}
			FilterComponent={FilterComponent}
			minRows={5}
			className={clsx("-striped -highlight -noborder", className)}
			getTdProps={getTdProps}
			getTheadTrProps={getTheadTrProps}
			getThProps={getThProps}
			getTableProps={getTableProps}
			getPaginationProps={getPaginationProps}
			PreviousComponent={PreviousComponent}
			showPageJump={false}
			NextComponent={NextComponent}
			renderPageSizeOptions={renderPageSizeOptions}
			{...otherProps}
		/>
	);
};

Table.propTypes = {
	showPageSizeOptions: PropTypes.bool,
	data: PropTypes.array,
	columns: PropTypes.array.isRequired,
	noDataText: PropTypes.string,
	defaultSorted: PropTypes.array,
	className: PropTypes.string,
	customPageSize: PropTypes.number,
};
Table.defaultProps = { data: [], noDataText: "No data available!", defaultSorted: [{ id: "updatedAt", desc: true }] };
Table.whyDidYouRender = false;

export default memo(Table);
