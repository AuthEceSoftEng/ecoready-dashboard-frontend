import { Grid } from "@mui/material";
import { memo, useState } from "react";

import { SecondaryBackgroundButton } from "../components/Buttons.js";
import Dialog from "../components/Dialog.js";
import { useSnackbar } from "../utils/index.js";

const DialogExample = () => {
	const { success, error } = useSnackbar();
	const [userSelected, setUserSelected] = useState(null);

	return (
		<>
			<Grid container display="flex" direction="column" justifyContent="center" alignItems="center">
				<Grid item mt={2}>
					<SecondaryBackgroundButton title="Delete User A" onClick={() => setUserSelected("A")} />
				</Grid>
				<Grid item mt={2}>
					<SecondaryBackgroundButton title="Delete User B" onClick={() => setUserSelected("B")} />
				</Grid>
			</Grid>
			<Dialog
				open={!!userSelected}
				title="Delete user?"
				text={`Are you sure you want to delete the user ${userSelected}?`}
				confirmButton="Delete"
				cancelButton="Cancel"
				onConfirm={() => {
					setUserSelected(null);
					success("User deleted");
				}}
				onClose={() => {
					setUserSelected(null);
					error("User deletion aborted");
				}}
			/>
		</>
	);
};

export default memo(DialogExample);
