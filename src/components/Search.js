import { Input as MUIInput, InputAdornment, Typography } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { useRef, memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles(() => ({
	search: {
		background: "rgba(211, 211, 211, 0.6)",
		borderRadius: "10px",
		position: "relative",
		padding: "5px 10px",
	},
}));

const Search = ({
	value: searchValue,
	width = "100%",
	onChange,
	results
}) => {
	const classes = useStyles();
	const inputRef = useRef(null);
	const navigate = useNavigate();
	const [value, setValue] = useState(searchValue);

	useEffect(() => {
		setValue(searchValue);
	}, [searchValue]);

	return (
    	<div style={{ position: "relative", width }}>
		<div style={{ position: "relative", width }} onClick={() => inputRef.current?.focus()}> 
		<MUIInput
			disableUnderline
			type="search"
			value={value}
			name="search"
			className={classes.search}
			sx={{ width }}
			inputRef={inputRef} // Attach the ref to the input field
			startAdornment={(
				<InputAdornment sx={{ position: "absolute", display: value ? "none" : "flex", marginLeft: "0px" }} position="end">
					<SearchIcon />
					<Typography ml={1}>{"Search..."}</Typography>
				</InputAdornment>
			)}
			onChange={onChange}
		/>
		</div>

		{/* SEARCH DROPDOWN */}
		{results.length > 0 && (
			<div
				style={{
					position: "absolute",
					top: "100%",
					left: 0,
					width: "100%",
					background: "white",
					boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
					borderRadius: "5px",
					zIndex: 1000,
					maxHeight: "300px",
					overflowY: "auto",
				}}
			>
				{results.map((result, index) => (
					<div
						key={index}
						onClick={() => {
							if (result.type === "product") {
								navigate("/products", { state: { selectedProduct: result.name } });
							} else if (result.type === "map") {
								navigate("/map", { state: { selectedProduct: result.name.replace(" Map", "") } });
							} else if (result.type === "lab") {
								navigate(result.link, { replace: true });
							}
						}}
						style={{
							padding: "10px",
							cursor: "pointer",
							borderBottom: "1px solid #ddd",
							color: "black",
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<span>{result.name}</span>
						<span style={{ fontStyle: "italic", color: "gray" }}>{result.type.toUpperCase()}</span>
					</div>
				))}
			</div>
		)}
	</div>
	);
};

export default memo(Search);
