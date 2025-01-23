import { Grid, Typography } from "@mui/material";
import { memo, useRef, useMemo } from "react";

import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import Form from "../components/Form.js";
import useInit from "../utils/screen-init.js";
import agroConfigs, { organization } from "../config/AgroConfig.js";
import colors from "../_colors.scss";
import { sumByKey, groupByKey, getMaxValuesByProperty, getSumValuesByProperty, getCustomDateTime, calculateDates } from "../utils/data-handling-functions.js";
import { monthNames } from "../utils/useful-constants.js";
import { cardFooter, LoadingIndicator, DataWarning } from "../utils/rendering-items.js";

const AIDEMEC = () => (
	<Grid container spacing={2} justifyContent="center" alignItems="center">
		<Grid item xs={12}>
			<DataWarning message="This screen is currently under construction" />
		</Grid>
	</Grid>
);

export default memo(AIDEMEC);
