import { Grid, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import Card from "../components/Card.js";
import { labs, products } from "../utils/useful-constants.js";

const imageStyles = {
	width: "100%",
	objectFit: "contain",
	borderRadius: "16px",
	boxSizing: "border-box",
	padding: "8px",
};

const SectionTitle = ({ children }) => (
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
		{children}
	</Typography>
);

const CardSection = ({ items, onCardClick, showLabsLabel }) => (
	<Grid container spacing={2} sx={{ mt: 2 }}>
		{items.map((item, index) => (
			<Grid key={index} item xs={12} sm={6} md={4}>
				<Card
					transparent
					clickable={!!onCardClick}
					title={item.title || item.text}
					sx={{ display: "flex", flexDirection: "column" }}
					onClick={() => onCardClick?.(item)}
				>
					<Box sx={{ width: "100%", mb: 1, display: "flex", justifyContent: "center", alignItems: "center", boxSizing: "border-box" }}>
						<img
							src={item.image}
							alt={item.title || item.text}
							style={imageStyles}
						/>
					</Box>
					{showLabsLabel && (
						<Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
							{"Relevant Living Labs:"}
						</Typography>
					)}
					<Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem", mb: 1, padding: "0 8px" }}>
						{item.description}
					</Typography>
				</Card>
			</Grid>
		))}
	</Grid>
);

const Home = () => {
	const navigate = useNavigate();
	const handleProductClick = (product) => {
		navigate("/products", { state: { selectedProduct: product.text } });
	};

	return (
		<Grid container direction="row" alignItems="flex-start" justifyContent="center" sx={{ textAlign: "center" }}>
			<Grid item xs={12} md={6} padding={1}>
				<SectionTitle>{"Meet the Labs"}</SectionTitle>
				<CardSection
					items={labs}
					onCardClick={(lab) => navigate(lab.path, { replace: true })}
				/>
			</Grid>
			<Grid item xs={12} md={6} padding={1}>
				<SectionTitle>{"Product Selection"}</SectionTitle>
				<CardSection
					showLabsLabel
					items={products}
					onCardClick={handleProductClick}
				/>
			</Grid>
		</Grid>
	);
};

export default memo(Home);
