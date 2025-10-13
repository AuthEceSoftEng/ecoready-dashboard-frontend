import { Grid, CircularProgress, Typography } from "@mui/material";

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
		if (part === "") {
			// Skip empty parts
		} else {
			const testLine = String(currentLine) + part;

			if (testLine.length <= maxLength) {
				currentLine = testLine;
			} else {
				if (currentLine.trim()) lines.push(currentLine);
				currentLine = part;
			}
		}
	}

	if (currentLine) lines.push(currentLine);

	return lines.join("<br>");
};

export const truncateText = (text, maxLength = 15) => (text.length > maxLength ? `${text.slice(0, maxLength)}...` : text);

export const capitalizeWords = (str) => str.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
