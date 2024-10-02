import { Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import { SecondaryBackgroundButton } from "../components/Buttons.js";

const Home = () => {
	const navigate = useNavigate();

	return (
		<Grid container direction="column" alignItems="center" justifyContent="center" sx={{ textAlign: "center" }}>
			<Typography variant="h2" sx={{ color: "third.main", p: 1 }}>{"Welcome to the Ecoready Observatory"}</Typography>
			<Typography variant="h3" sx={{ color: "secondary.main", p: 2 }}>{"Explore one  of our Living Labs"}</Typography>
			<SecondaryBackgroundButton
				size="large"
				width="150px"
				title="AgroLab"
				onClick={() => navigate("../agroLab", { replace: true })}
			/>
		</Grid>
	);
};

export default memo(Home);
