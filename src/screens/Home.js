import { Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import { SecondaryBackgroundButton } from "../components/Buttons.js";

const Home = () => {
	const navigate = useNavigate();

	const labs = [
		{ title: "AgroLab", path: "../agrolab" },
		{ title: "HiveLab", path: "../hivelab" },
		{ title: "EcoVitaLL", path: "../ecovitall" },
		{ title: "EcoReadyMasuria", path: "../ecoreadymasuria" },
		{ title: "Seco Collab", path: "../seco_collab" },
	];

	return (
		<Grid container direction="column" alignItems="center" justifyContent="center" sx={{ textAlign: "center" }}>
			<Typography variant="h2" sx={{ color: "third.main", p: 1 }}>{"Welcome to the Ecoready Observatory"}</Typography>
			<Typography variant="h3" sx={{ color: "secondary.main", p: 2 }}>{"Explore one of our Living Labs"}</Typography>
			<Grid container justifyContent="center" spacing={2} sx={{ p: 1 }}>
				{labs.map((lab, index) => (
					<Grid key={index} item xs={12} sm={6} md={4} lg={3} xl={2} sx={{ p: 1 }}>
						<SecondaryBackgroundButton
							size="large"
							width="100%"
							title={lab.title}
							onClick={() => navigate(lab.path, { replace: true })}
						/>
					</Grid>
				))}
			</Grid>
		</Grid>
	);
};

export default memo(Home);
