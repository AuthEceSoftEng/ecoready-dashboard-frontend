import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import { PrimaryBackgroundButton } from "../components/Buttons.js";

const Examples = () => {
	const navigate = useNavigate();

	return (
		<Grid container direction="column" alignItems="center" justifyContent="center">
			<Grid container alignItems="center" justifyContent="space-around" width="70%" pt={5}>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Buttons"
						onClick={() => navigate("/buttons")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Card"
						onClick={() => navigate("/card")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Form"
						onClick={() => navigate("/form")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Tooltip"
						onClick={() => navigate("/tooltip")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Table"
						onClick={() => navigate("/table")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="File upload"
						onClick={() => navigate("/file-upload")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Broker"
						onClick={() => navigate("/broker")}
					/>
				</Grid>

				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Plot"
						onClick={() => navigate("/plot")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Accordion"
						onClick={() => navigate("/accordion")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Search"
						onClick={() => navigate("/search")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Toast"
						onClick={() => navigate("/toast")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Popup"
						onClick={() => navigate("/popup")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Dialog"
						onClick={() => navigate("/dialog")}
					/>
				</Grid>

				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Dropdown"
						onClick={() => navigate("/dropdown")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Date Picker"
						onClick={() => navigate("/datepicker")}
					/>
				</Grid>
				<Grid item xs={2} sx={{ p: 1 }}>
					<PrimaryBackgroundButton
						width="100%"
						title="Localization"
						onClick={() => navigate("/localization")}
					/>
				</Grid>
				<Grid item xs={10} />
			</Grid>
		</Grid>
	);
};

export default memo(Examples);
