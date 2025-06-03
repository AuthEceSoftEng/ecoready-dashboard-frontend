import { Grid } from "@mui/material";
import { memo } from "react";

import {
	PrimaryBackgroundButton,
	PrimaryBorderButton,
	SecondaryBackgroundButton,
	SecondaryBorderButton,
	HighlightBackgroundButton,
	HighlightBorderButton,
} from "../components/Buttons.js";

const ButtonsExample = () => (
	<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
		<Grid item>
			<PrimaryBackgroundButton disabled title="Disabled" />
		</Grid>
		<Grid item mt={2}>
			<PrimaryBorderButton titleColor="red" title="Change Color" />
		</Grid>
		<Grid item mt={2}>
			<SecondaryBackgroundButton size="small" title="Small Size" />
		</Grid>
		<Grid item mt={2}>
			<SecondaryBorderButton size="large" title="Large Size" />
		</Grid>
		<Grid item mt={2}>
			<HighlightBackgroundButton width="400px" title="Specify Width" />
		</Grid>
		<Grid item mt={2}>
			<HighlightBorderButton title="Click Me" onClick={() => console.log("CLICKED")} />
		</Grid>
	</Grid>
);

export default memo(ButtonsExample);
