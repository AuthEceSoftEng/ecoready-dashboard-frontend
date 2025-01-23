import { Grid, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import Card from "../components/Card.js";
import { labs, products } from "../utils/useful-constants.js";

const Home = () => {
	const navigate = useNavigate();
	return (
		<Grid container direction="row" alignItems="flex-start" justifyContent="center" sx={{ textAlign: "center" }}>
			<Grid item xs={12} md={6} padding={1}>
				<Typography
					variant="h4"
					component="h1"
					sx={{
						fontWeight: 700,
						marginBottom: "32px",
						marginTop: "16px",
						color: "primary.main",
						textTransform: "uppercase",
						letterSpacing: "0.1em",
						position: "relative",
						"&::after": {
							content: "\"\"",
							position: "absolute",
							bottom: "-8px",
							left: "50%",
							transform: "translateX(-50%)",
							width: "60px",
							height: "3px",
							backgroundColor: "primary.main",
							borderRadius: "2px",
						},
					}}
				>
					{"Meet the Labs"}
				</Typography>
				<Grid container spacing={2} sx={{ mt: 2 }}>
					{labs.map((lab, index) => (
						<Grid key={index} item xs={12} sm={6} md={4}>
							<Card
								transparent
								clickable
								title={lab.title}
								sx={{
									display: "flex",
									flexDirection: "column",
								}}
								onClick={() => navigate(lab.path, { replace: true })}
							>
								<Box sx={{
									width: "100%",
									mb: 1, // Reduced margin bottom
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									boxSizing: "border-box",
								}}
								>
									<img
										src={lab.image}
										alt={lab.title}
										style={{
											width: "100%",
											objectFit: "contain",
											borderRadius: "16px",
											boxSizing: "border-box",
											padding: "8px", // Add some padding inside the border box
										}}
									/>
								</Box>
								<Typography
									variant="body2"
									sx={{
										color: "text.secondary",
										fontSize: "0.875rem",
										mb: 1,
										padding: "0 8px",
									}}
								>
									{lab.description}
								</Typography>
							</Card>
						</Grid>
					))}
				</Grid>
			</Grid>

			{/* Right group of cards */}
			<Grid item xs={12} md={6} padding={1}>
				<Typography
					variant="h4"
					component="h1"
					sx={{
						fontWeight: 700,
						marginBottom: "32px",
						marginTop: "16px",
						color: "primary.main",
						textTransform: "uppercase",
						letterSpacing: "0.1em",
						position: "relative",
						"&::after": {
							content: "\"\"",
							position: "absolute",
							bottom: "-8px",
							left: "50%",
							transform: "translateX(-50%)",
							width: "60px",
							height: "3px",
							backgroundColor: "primary.main",
							borderRadius: "2px",
						},
					}}
				>
					{"Product Selection"}
				</Typography>
				<Grid container spacing={2} sx={{ mt: 2 }}>
					{products.map((lab, index) => (
						<Grid key={index} item xs={4}>
							<Card
								transparent
								title={lab.text}
							/>
						</Grid>
					))}
				</Grid>
			</Grid>

		</Grid>
	);
};

export default memo(Home);
