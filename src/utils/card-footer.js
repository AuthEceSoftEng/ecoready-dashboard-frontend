import { Grid, Typography } from "@mui/material";

export const cardFooter = ({ minutesAgo }) => (

	<Grid sx={{ width: "95%", borderTop: "2px solid lightgrey" }}>

		<Typography variant="body" component="p" sx={{ marginTop: "5px" }}>

			{`🕗 updated ${minutesAgo} minutes ago`}

		</Typography>

	</Grid>

);

