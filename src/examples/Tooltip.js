import { Grid, Typography } from "@mui/material";
import { HelpCenterRounded } from "@mui/icons-material";
import { memo } from "react";

import Tooltip from "../components/Tooltip.js";

const TooltipExample = () => (
	<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
		<Grid item>
			<Tooltip placement="top-start" title="This is an example tooltip">
				<HelpCenterRounded fontSize="large" sx={{ color: "#ffffff" }} />
			</Tooltip>
		</Grid>
		<Grid item mt={2}>
			<Tooltip placement="top-start" title="This is an example tooltip in text">
				<Typography sx={{ color: "white" }}>
					{"This text has a tooltip"}
				</Typography>
			</Tooltip>
		</Grid>
	</Grid>
);

export default memo(TooltipExample);
