import { Grid } from "@mui/material";
import { memo } from "react";

import {
	SuccessBackgroundButton,
	ErrorBackgroundButton,
	InfoBackgroundButton,
} from "../components/Buttons.js";
import { useSnackbar } from "../utils/index.js";

const ToastsExample = () => {
	const { success, error, info } = useSnackbar();

	return (
		<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
			<Grid item mt={2}>
				<SuccessBackgroundButton title="Success Toast" onClick={() => success()} />
			</Grid>
			<Grid item mt={2}>
				<ErrorBackgroundButton title="Error Toast" onClick={() => error()} />
			</Grid>
			<Grid item mt={2}>
				<InfoBackgroundButton title="Info Toast" onClick={() => info()} />
			</Grid>
			<Grid item mt={2}>
				<SuccessBackgroundButton title="Success Toast with Message" onClick={() => success("Custom success message")} />
			</Grid>
			<Grid item mt={2}>
				<ErrorBackgroundButton title="Error Toast with Message" onClick={() => error("Custom error message")} />
			</Grid>
			<Grid item mt={2}>
				<InfoBackgroundButton title="Info Toast with Message" onClick={() => info("Custom info message")} />
			</Grid>
		</Grid>
	);
};

export default memo(ToastsExample);
