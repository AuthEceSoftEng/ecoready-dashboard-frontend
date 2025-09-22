import { Grid, CircularProgress, Typography } from "@mui/material";

import colors from "../_colors.scss";
import Dropdown from "../components/Dropdown.js";
import Form from "../components/Form.js";

import { timeUtils } from "./timer-manager.js";

export const cardFooter = ({ minutesAgo }) => (
	<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>
		<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>
			{"🕗 "}
			{timeUtils.formatMinutesAgo(minutesAgo)}
		</Typography>
	</Grid>
);

export const LoadingIndicator = ({ message = "Loading data...", minHeight = "200px" }) => (
	<Grid
		item
		xs={12}
		sx={{
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			minHeight,
		}}
	>
		<CircularProgress />
		<Typography variant="h6" sx={{ ml: 2 }}>
			{message}
		</Typography>
	</Grid>
);

export const StickyBand = ({ sticky = true, dropdownContent = [], formRef, formContent, toggleContent, togglePlacing }) => (
	<Grid
		container
		display="flex"
		direction="row"
		justifyContent="flex-end"
		alignItems="flex-end"
		mt={1}
		sx={{
			position: sticky ? "sticky" : "relative",
			top: -5,
			backgroundColor: sticky ? colors.grey : "inherit",
			zIndex: sticky ? 100 : "auto",
			minWidth: "100.1%",
			padding: "0.3rem",
			gap: "0.3rem",
			margin: 0,
		}}
	>
		{toggleContent && (
			<Grid item sx={{ display: "flex", justifyContent: togglePlacing ?? "flex-end", alignItems: "center", minWidth: "fit-content", flexShrink: 0 }} xs={6} sm={3} md={6}>
				{toggleContent}
			</Grid>
		)}
		{dropdownContent.map((dropdown, index) => (
			<Grid key={index} item sx={{ display: "flex", justifyContent: "flex-end", minWidth: "fit-content", flexShrink: 0 }} xs={6} sm={2} md={1}>
				<Dropdown
					id={dropdown.id}
					value={dropdown.value}
					placeholder={dropdown.label}
					items={dropdown.items}
					size={dropdown.size}
					width={dropdown.width || "170px"}
					height={dropdown.height || "40px"}
					background={dropdown.color ?? "primary"}
					subheader={dropdown.subheader}
					multiple={dropdown.multiple}
					onChange={dropdown.onChange}
				/>
			</Grid>
		))}
		{formContent && (
			<Grid item sx={{ display: "flex", justifyContent: "flex-start", minWidth: "fit-content", flexShrink: 0 }} xs={6} sm={2} md={formContent.customType === "date-range" ? 2 : 1}>
				<Form ref={formRef} content={formContent} />
			</Grid>
		)}
	</Grid>
);

export const DataWarning = ({
	message = "No Data Available for the Specified Time Period...",
	xs = 12,
	sm = 12,
	md = 12,
	minHeight = "200px",
	justify = "center",
	align = "center",
}) => (
	<Grid
		item
		{...{ xs, sm, md }}
		sx={{
			display: "flex",
			justifyContent: justify,
			alignItems: align,
			minHeight,
		}}
	>
		<Typography variant="h6" fontWeight="bold" sx={{ textAlign: "center" }}>{message}</Typography>
	</Grid>
);

export const wrapText = (text, maxLength = 50) => {
	if (!text || text.length <= maxLength) return text;

	// Split while preserving delimiters (/, -, and spaces)
	const parts = text.split(/(\s|\/|-)/);
	const lines = [];
	let currentLine = "";

	for (const part of parts) {
		if (part.trim() === " ") continue; // Skip empty parts

		const testLine = String(currentLine) + part;

		if (testLine.length <= maxLength) {
			currentLine = testLine;
		} else {
			if (currentLine) lines.push(currentLine);
			currentLine = part;
		}
	}

	if (currentLine) lines.push(currentLine);

	return lines.join("<br>");
};

export const truncateText = (text, maxLength = 15) => (text.length > maxLength ? `${text.slice(0, maxLength)}...` : text);
