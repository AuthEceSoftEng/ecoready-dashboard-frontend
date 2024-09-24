import { Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import { PrimaryBackgroundButton } from "../components/Buttons.js";

const Home = () => {
	const navigate = useNavigate();

	return (
		<Grid container direction="column" alignItems="center" justifyContent="center">
			<Typography variant="h3" sx={{ color: "secondary.main", p: 4 }}>{"Main page"}</Typography>
			<Typography variant="text" sx={{ color: "secondary.main", p: 4 }}>{"Make this your home page!"}</Typography>
			<PrimaryBackgroundButton
				width="300px"
				title="Check out the examples"
				onClick={() => navigate("../examples", { replace: true })}
			/>
		</Grid>
	);
};

export default memo(Home);
