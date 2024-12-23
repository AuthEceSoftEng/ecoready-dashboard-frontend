import { Grid, CircularProgress, Typography } from "@mui/material";

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

export const StickyBand = ({ dropdownContent = [], value = null, formRef, formContent }) => (
	<Grid
		container
		display="flex"
		direction="row"
		justifyContent="flex-end"
		alignItems="flex-end"
		mt={1}
		sx={{
			position: "sticky",
			top: 0,
			backgroundColor: "white",
			zIndex: 1000,
			minWidth: "100%", // Add minimum width
			gap: "0.5rem", // Add half spacing between items
		}}
	>
		{dropdownContent.map((dropdown, index) => (
			<Grid
				key={index}
				item
				sx={{ display: "flex",
					justifyContent: "flex-end",
					minWidth: "fit-content", // Prevent content compression
					flexShrink: 0 }}
				xs={6}
				sm={3}
				md={3}
			>
				<Dropdown
					id={dropdown.id}
					value={value}
					placeholder={dropdown.label}
					items={dropdown.items}
					size={dropdown.size}
					width={dropdown.width}
					height={dropdown.height}
					background={dropdown.color}
					onChange={dropdown.onChange}
				/>
			</Grid>
		))}
		<Grid
			item
			sx={{ display: "flex",
				justifyContent: "flex-end",
				minWidth: "fit-content", // Prevent content compression
				flexShrink: 0 }}
			xs={12}
			sm={3}
			md={2}
		>
			<Form ref={formRef} content={formContent} />
		</Grid>
	</Grid>
);

export const DataWarning = ({ message = "No Availabe Data for the Specified Time Period..." }) => (
	<Grid
		item
		xs={12}
		sx={{
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			minHeight: "200px",
		}}
	>
		<Typography variant="h6">{message}</Typography>
	</Grid>
);
