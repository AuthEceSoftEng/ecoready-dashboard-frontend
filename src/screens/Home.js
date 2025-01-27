import { Grid, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import Card from "../components/Card.js";
import { PrimaryBorderButton } from "../components/Buttons.js";
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

const CardSection = ({ items, onCardClick, showLabsLabel }) => {
	  const navigate = useNavigate();

	  return (
	    <Grid container spacing={2} sx={{ mt: 2, alignItems: "stretch" }}>
	      {items.map((item, index) => (
	        <Grid key={index} item xs={12} sm={6} md={6} sx={{ display: "flex" }}>
	          <Card
	            transparent
	            clickable={!!onCardClick}
	            title={item.title || item.text}
	            sx={{
	              display: "flex",
	              flexDirection: "column",
	              justifyContent: "space-between", // Ensure content spacing is even
	              flexGrow: 1, // Ensure cards take up equal height
	            }}
	            onClick={() => onCardClick?.(item)}
	          >
	            <Box
	              sx={{
	                width: "100%",
	                mb: 1,
	                display: "flex",
	                justifyContent: "center",
	                alignItems: "center",
	                boxSizing: "border-box",
	              }}
	            >
	              <img
	                src={item.image}
	                alt={item.title || item.text}
	                style={{ maxWidth: "100%", height: "auto" }}
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
	              {item.description}
	            </Typography>

	            <Box
	              sx={{
	                display: "flex",
	                flexDirection: "column", // Stack buttons vertically
	                alignItems: "center",
	                gap: "8px", // Space between buttons
	                mb: 1,
	              }}
	            >
	              <PrimaryBorderButton
	                id={`view-details-${index}`}
	                title="Go to Living Lab page"
	                width="220px"
	                height="27px"
	                onClick={() => navigate(item.path, { replace: true })}
	              />
	            </Box>
	          </Card>
	        </Grid>
	      ))}
	    </Grid>
	  );
	};


const ProductCardSection = ({ items, onCardClick, showLabsLabel }) => {
	  const navigate = useNavigate();
	  const getRelevantLabs = (product) => {
	    return labs.filter(
	      (lab) =>
	        lab.title &&
	        (product.relevantLLs?.includes(lab.title) ||
	          lab.products.some((p) => p === product.value))
	    );
	  };

	  return (
	    <Grid container spacing={2} sx={{ mt: 2 }}>
	      {items.map((item, index) => {
	        const relevantLabs = getRelevantLabs(item); // Get the relevant labs

	        return (
	          <Grid key={index} item xs={12} sm={6} md={6}>
	            <Card
	              transparent
	              clickable={!!onCardClick}
	              title={item.title || item.text}
	              sx={{ display: "flex", flexDirection: "column" }}
	              onClick={() => onCardClick?.(item)}
	            >
	              <Box
	                sx={{
	                  display: "flex",
	                  justifyContent: "space-between",
	                  alignItems: "center",
	                  flexWrap: "nowrap",
	                  gap: "16px",
	                  width: "100%",
	                }}
	              >
	                {/* Image Box */}
	                <Box
	                  sx={{
	                    flex: "1",
	                    display: "flex",
	                    justifyContent: "center",
	                    alignItems: "center",
	                    boxSizing: "border-box",
	                  }}
	                >
	                  <img
	                    src={`/product_images/${item.value}.png`}
	                    alt={item.title || item.text}
	                    style={{ maxWidth: "100%", height: "auto" }}
	                    onError={(e) => {
	                	  e.target.src = "/product_images/default.png"; // Fallback image path
	                	}}
	                  />
	                </Box>

	                {/* Labs Label, Buttons, and Logos */}
	                <Box
	                  sx={{
	                    display: "flex",
	                    flexDirection: "column", // Stack the elements vertically
	                    alignItems: "center",
	                    flex: "1",
	                    gap: "0px",
	                  }}
	                >
	                  {/* Buttons */}
	                  <Box
	                    sx={{
	                      display: "flex",
	                      flexDirection: "column", // Stack buttons vertically
	                      alignItems: "center",
	                      gap: "8px", // Space between buttons
	                      mb: 1,
	                    }}
	                  >
	                    <PrimaryBorderButton
	                      id={`view-details-${index}`}
	                      title="View stats"
	                      width="110px"
	                      height="27px"
	                      onClick={() => navigate("/products", { state: { selectedProduct: item.text } })}
	                    />
	                    <PrimaryBorderButton
	                      id={`view-on-map-${index}`}
	                      title="View map"
	                      width="110px"
		                  height="27px"
		                  onClick={() => navigate("/map", { state: { selectedProduct: item.text } })}
	                    />
	                  </Box>

	                  {/* Relevant LLs text and logos */}
	                  {showLabsLabel && (
	                    <Box
	                      sx={{
	                        display: "flex",
	                        alignItems: "center",
	                        gap: "8px", // Space between text and logos
	                      }}
	                    >
	                      <Typography
	                        variant="subtitle1"
	                        sx={{ fontWeight: "bold", textAlign: "center" }}
	                      >
	                        {"LLs:"}
	                      </Typography>
	                      <Box
	                        sx={{
	                          display: "flex",
	                          justifyContent: "flex-start",
	                          alignItems: "center",
	                          gap: "8px",
	                          flexWrap: "wrap",
	                        }}
	                      >
	                        {relevantLabs.length > 0 ? (
	                          relevantLabs.map((lab) => (
	                            <img
	                              key={lab.title}
	                              src={lab.logo}
	                              alt={lab.title}
	                              title={lab.title} // Tooltip with the lab name
	                              style={{
	                                width: "24px",
	                                height: "24px",
	                                objectFit: "contain",
	                                borderRadius: "50%",
	                              }}
	                            />
	                          ))
	                        ) : (
	                          <Typography
	                            variant="body2"
	                            sx={{
	                              color: "text.secondary",
	                              fontSize: "0.875rem",
	                              textAlign: "center",
	                            }}
	                          >
	                            -
	                          </Typography>
	                        )}
	                      </Box>
	                    </Box>
	                  )}
	                </Box>
	              </Box>
	            </Card>
	          </Grid>
	        );
	      })}
	    </Grid>
	  );
	};

const Home = () => {
	const navigate = useNavigate();
/*	const handleProductClick = (product) => {
		navigate("/products", { state: { selectedProduct: product.text } });
	};*/

	return (
		<Grid container direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ textAlign: "center" }}>
			<Grid item xs={12} md={6} padding={1}>
				<SectionTitle>{"Meet the Labs"}</SectionTitle>
				<CardSection
					items={labs}
//					onCardClick={(lab) => navigate(lab.path, { replace: true })}
				/>
			</Grid>
			<Grid item xs={12} md={5} padding={1}>
				<SectionTitle>{"Product Selection"}</SectionTitle>
				<ProductCardSection
					showLabsLabel
					items={products}
//					onCardClick={handleProductClick}
				/>
			</Grid>
		</Grid>
	);
};

export default memo(Home);
