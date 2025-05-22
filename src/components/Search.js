import { Input as MUIInput, InputAdornment, Typography } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { useRef, memo, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
	results,
}) => {
	const classes = useStyles();
	const inputRef = useRef(null);
	const searchContainerRef = useRef(null); // Ref for the entire search component
	const navigate = useNavigate();
	const location = useLocation();
	const [value, setValue] = useState(searchValue);
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(-1);

	// Reset focused index when results change
	useEffect(() => {
		setFocusedIndex(-1);
	}, [results]);

	useEffect(() => {
		setValue(searchValue);
	}, [searchValue]);

	// Hide dropdown and blur input when navigation occurs
	useEffect(() => {
		setDropdownVisible(false); // Hide the dropdown
		inputRef.current?.blur(); // Ensure input loses focus
	}, [location]);

	// Handle clicks outside the search component
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
				setDropdownVisible(false);
				setValue(""); // Clear the input value
				// Create a synthetic event to pass to the onChange handler
				const syntheticEvent = {
					target: { value: "" },
					preventDefault() {},
					stopPropagation() {},
				};
				onChange(syntheticEvent); // Notify parent component
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onChange]); // Added onChange to dependencies

	// Handle navigation to the selected result
	const handleResultSelect = (result) => {
		// Clear the search input
		setValue("");
		setDropdownVisible(false);

		// Create a synthetic event to notify parent component
		const syntheticEvent = {
			target: { value: "" },
			preventDefault() {},
			stopPropagation() {},
		};
		onChange(syntheticEvent);

		switch (result.type) {
			case "product": {
				navigate("/products", { state: { selectedProduct: result.name } });
				break;
			}

			case "map": {
				navigate("/map", {
					state: {
						selectedProduct: result.name.replace(" Map", "").split(" (")[0],
						productValue: result.product?.value,
						specificProduct: result.specificProduct || null,
						parentProduct: result.specificProduct ? result.product?.text : null,
					},
				});
				break;
			}

			case "lab": {
				navigate(result.link, { replace: true });
				break;
			}

			default:// Do nothing
		}
	};

	// Handle keyboard navigation
	const handleKeyDown = (e) => {
		if (dropdownVisible && results.length > 0) {
			switch (e.key) {
				case "ArrowDown": {
					e.preventDefault();
					setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
					break;
				}

				case "ArrowUp": {
					e.preventDefault();
					setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
					break;
				}

				case "Enter": {
					e.preventDefault();
					if (focusedIndex >= 0) {
						handleResultSelect(results[focusedIndex]);
					}

					break;
				}

				case "Escape": {
					setDropdownVisible(false);
					setFocusedIndex(-1);
					break;
				}

				default: {
					break;
				}
			}
		}
	};

	return (
		<div
			ref={searchContainerRef} // Add this ref to connect the container
			style={{ position: "relative", width }}
			onClick={() => {
				inputRef.current?.focus(); // Focus the input
				if (value.trim()) {
					setDropdownVisible(true); // Open dropdown if there's text
				}
			}}
		>
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
				onChange={(e) => {
					onChange(e); // Call parent onChange
					setDropdownVisible(true); // Ensure the dropdown is visible
				}}
				onKeyDown={handleKeyDown}
			/>

			{/* SEARCH DROPDOWN */}
			{dropdownVisible && results.length > 0 && (
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
							style={{
								padding: "10px",
								cursor: "pointer",
								borderBottom: "1px solid #ddd",
								color: "black",
								display: "flex",
								justifyContent: "space-between",
								backgroundColor: index === focusedIndex ? "#a2ca37" : "white", // Highlight focused item
								transition: "background-color 0.2s ease",
							}}
							role="button"
							tabIndex="0"
							aria-label={`${result.name} ${result.type}`}
							onClick={() => {
								switch (result.type) {
									case "product": {
										navigate("/products", { state: { selectedProduct: result.name } });

										break;
									}

									case "map": {
										// Handle both regular map entries and specific product entries
										navigate("/map", {
											state: {
												selectedProduct: result.name.replace(" Map", "").split(" (")[0], // Get just the product name
												productValue: result.product?.value, // Pass the value
												specificProduct: result.specificProduct || null, // Pass the specific product if it exists
												// Pass parent if we have specific product
												parentProduct: result.specificProduct ? result.product?.text : null,
											},
										});
										break;
									}

									case "lab": {
										navigate(result.link, { replace: true });

										break;
									}

									default:// Do nothing
								}
							}}
							onMouseEnter={() => setFocusedIndex(index)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									switch (result.type) {
										case "product": {
											navigate("/products", { state: { selectedProduct: result.name } });
											break;
										}

										case "map": {
											navigate("/map", {
												state: {
													selectedProduct: result.name.replace(" Map", "").split(" (")[0],
													productValue: result.product?.value,
													specificProduct: result.specificProduct || null,
													parentProduct: result.specificProduct ? result.product?.text : null,
												},
											});
											break;
										}

										case "lab": {
											navigate(result.link, { replace: true });
											break;
										}

										default:
										// Do nothing
									}
								}
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
