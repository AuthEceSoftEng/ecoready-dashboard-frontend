import { Grid, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import Card from "../components/Card.js";
import { PrimaryBorderButton } from "../components/Buttons.js";
import { labs, products } from "../utils/useful-constants.js";

const excludedProducts = new Set(["Oilseeds", "Cereals", "Sheep/Goat Meat"]);
const mapProducts = new Set(products.filter((product) => !excludedProducts.has(product.text)).map((product) => product));

const imageStyles = {
	height: "100%",
	objectFit: "contain",
	borderRadius: "8px",
	boxSizing: "border-box",
	padding: "4px",
	minWidth: "40px",
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

// Unified ImageBox component
const ImageBox = ({ src, alt, onError }) => (
	<Box sx={{
		flex: "1",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		boxSizing: "border-box",
	}}
	>
		<img src={src} alt={alt} style={imageStyles} onError={onError} />
	</Box>
);

// Unified ActionButtons component
const ActionButtons = ({ item, index, type = "lab" }) => {
	const navigate = useNavigate();
	const isProductCard = type === "product";

	return (
		<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", mb: 1 }}>
			<PrimaryBorderButton
				id={`view-details-${index}`}
				title={isProductCard ? "View stats" : "Overview"}
				width={isProductCard ? "115px" : undefined}
				height="27px"
				onClick={() => navigate(
					isProductCard ? "/products" : item.path,
					isProductCard ? { state: { selectedProduct: item.text } } : { replace: true },
				)}
			/>
			{isProductCard && mapProducts.has(item) && (
				<PrimaryBorderButton
					id={`view-on-map-${index}`}
					title="View map"
					width="115px"
					height="27px"
					onClick={() => {
						const selectedProduct = item.subheader
							? item.prices.products[0].toLowerCase()
							: item.text;
						navigate("/map", { state: { selectedProduct } });
					}}
				/>
			)}
		</Box>
	);
};

// Unified CardGrid component
const CardGrid = ({ items, renderCard }) => (
	<Grid container spacing={2} sx={{ mt: 2, alignItems: "stretch" }}>
		{items.map((item, index) => (
			<Grid key={index} item xs={12} sm={12} md={12} lg={6} sx={{ display: "flex" }}>
				{renderCard(item, index)}
			</Grid>
		))}
	</Grid>
);

const getRelevantLabs = (product) => labs.filter(
	(lab) => lab.title && (product.relevantLLs?.includes(lab.title) || lab.products.includes(product.value)),
);

const LabsSection = () => (
	<CardGrid
		items={labs}
		renderCard={(item, index) => (
			<Card
				transparent
				clickable
				title={item.title || item.text}
				sx={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					flexGrow: 1,
				}}
			>
				<ImageBox
					src={item.image}
					alt={item.title || item.text}
				/>
				<Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem", mb: 1, padding: "0 8px" }}>
					{item.description}
				</Typography>
				<ActionButtons item={item} index={index} type="lab" />
			</Card>
		)}
	/>
);

const ProductsSection = ({ showLabsLabel = false }) => (
	<CardGrid
		items={products}
		renderCard={(item, index) => {
			const relevantLabs = getRelevantLabs(item);

			return (
				<Card
					transparent
					clickable
					title={item.title || item.text}
					sx={{ display: "flex", flexDirection: "column" }}
				>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "nowrap", gap: "16px", width: "100%" }}>
						<ImageBox
							src={item.image || `/product_images/${item.value}.png`}
							alt={item.title || item.text}
							onError={(e) => { e.target.src = "/product_images/default.png"; }}
						/>

						<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1", gap: "0px" }}>
							<ActionButtons item={item} index={index} type="product" />

							{showLabsLabel && (
								<Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
									<Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center" }}>
										{"LLs:"}
									</Typography>
									<Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
										{relevantLabs.length > 0 ? (
											relevantLabs.map((lab) => (
												<img
													key={lab.title}
													src={lab.logo}
													alt={lab.title}
													title={lab.title}
													style={{
														width: "24px",
														height: "24px",
														objectFit: "contain",
														borderRadius: "50%",
													}}
												/>
											))
										) : (
											<Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem", textAlign: "center" }}>
												{"-"}
											</Typography>
										)}
									</Box>
								</Box>
							)}
						</Box>
					</Box>
				</Card>
			);
		}}
	/>
);

const Home = () => (
	<Grid container direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ textAlign: "center" }}>
		<Grid item xs={12} md={6} padding={1}>
			<SectionTitle>{"Meet the Labs"}</SectionTitle>
			<LabsSection />
		</Grid>
		<Grid item xs={12} md={5} padding={1}>
			<SectionTitle>{"Product Selection"}</SectionTitle>
			<ProductsSection showLabsLabel />
		</Grid>
	</Grid>
);

export default memo(Home);
