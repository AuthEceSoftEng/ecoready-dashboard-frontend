import { Grid } from "@mui/material";
import { memo } from "react";

import DatePicker from "../components/DatePicker.js";

const DatePickerExample = () => (
	<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
		<Grid item mt={2}>
			<DatePicker type="desktop" label="Desktop Picker" value={new Date()} onChange={(value) => console.log(`Date changed to ${value}`)} />
		</Grid>
		<Grid item mt={2}>
			<DatePicker type="mobile" label="Mobile Picker" />
		</Grid>
		<Grid item mt={2}>
			<DatePicker type="time" label="Time Picker" />
		</Grid>
		<Grid item mt={2}>
			<DatePicker type="datetime" label="Date & Time Picker" />
		</Grid>
		<Grid item mt={2}>
			{/* Select only the year */}
			<DatePicker type="desktop" label="Year Picker" views={["year"]} />
		</Grid>
	</Grid>
);

export default memo(DatePickerExample);
