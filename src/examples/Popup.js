import { Grid, InputAdornment, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { AccountCircle } from "@mui/icons-material";
import { memo, useState } from "react";

import { SecondaryBackgroundButton } from "../components/Buttons.js";
import Popup from "../components/Popup.js";
import Form from "../components/Form.js";

const PopupExample = () => {
	const [popupOpen, setPopupOpen] = useState(false);
	const [popupFormOpen, setPopupFormOpen] = useState(false);

	// eslint-disable-next-line unicorn/consistent-function-scoping
	const submitHandler = (values) => {
		console.log(values);
	};

	const formContent = [
		{
			customType: "input",
			id: "email",
			type: "text",
			placeholder: "Email",
			inputProps: {
				endAdornment: (
					<InputAdornment position="start">
						<IconButton disabled>
							<AccountCircle />
						</IconButton>
					</InputAdornment>
				),
			},
		},
		{
			customType: "button",
			id: "submit",
			type: "submit",
			text: "Invite",
		},
	];

	return (
		<>
			<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
				<Grid item mt={2}>
					<SecondaryBackgroundButton title="Open Popup" onClick={() => setPopupOpen(true)} />
				</Grid>
				<Grid item mt={2}>
					<SecondaryBackgroundButton title="Open Popup with Form" onClick={() => setPopupFormOpen(true)} />
				</Grid>
			</Grid>
			<Popup
				width="400px"
				title="Example Popup"
				open={popupOpen}
				onClose={() => setPopupOpen(false)}
			>
				<Grid item width="100%" display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
					<Typography variant="h6" component="h2">
						{"Blah blah"}
					</Typography>
				</Grid>
			</Popup>
			<Popup
				width="400px"
				title="Example Popup with Form"
				titleBackgroundColor="third"
				backgroundColor="primary"
				open={popupFormOpen}
				onClose={() => setPopupFormOpen(false)}
			>
				<Form content={formContent} onSubmit={submitHandler} />
			</Popup>
		</>
	);
};

export default memo(PopupExample);
