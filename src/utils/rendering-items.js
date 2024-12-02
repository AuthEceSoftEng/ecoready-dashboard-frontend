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
