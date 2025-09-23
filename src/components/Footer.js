import { memo } from "react";
import { AppBar, Box, Link, Toolbar, Typography, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Image } from "mui-image";

import logo from "../assets/images/isselLogo.png";

const useStyles = makeStyles((theme) => ({
	grow: {
		flexGrow: 1,
		flexBasis: "auto",
		background: theme.palette.dark.main,
		zIndex: 1200,
		height: "60px",
	},
	stickyContainer: {
		minWidth: "85%",
		position: "sticky",
		bottom: 0,
		zIndex: 1300,
	},
	box: {
		height: "100%",
		width: "fit-content",
		padding: "10px 20px",
	},
	messageContainer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-end",
		gap: "4px",
		height: "100%",
		justifyContent: "center",
	},
	messageWithImages: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
		justifyContent: "center",
		width: "100%",
	},
	messageWithoutImages: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-start", // Align left when no images
		width: "100%",
	},
	customImageContainer: {
		height: "90px",
		width: "90px",
		flexShrink: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	imageLink: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "100%",
		transition: "opacity 0.2s ease",
		"&:hover": {
			opacity: 0.8,
		},
	},
	messageContentCentered: {
		textAlign: "center",
		flex: 1,
		padding: "0 8px",
	},
	messageContentLeft: {
		textAlign: "left",
		flex: 1,
		padding: "0 8px",
	},
}));

const Footer = ({
	customMessage,
	customLink,
	customImages,
	showDefaultCopyright = true,
	sticky = false,
}) => {
	const classes = useStyles();

	// Normalize images to always be an array
	const imagesToRender = customImages || [];
	const hasMultipleImages = imagesToRender.length >= 2;

	// Helper function to render an image (with or without link)
	const renderImage = (imageObj, index) => {
		const imageElement = (
			<Image
				src={imageObj.src}
				alt={imageObj.alt || `Logo ${index + 1}`}
				fit="contain"
				width="100%"
				height="100%"
			/>
		);

		if (imageObj.link) {
			return (
				<Link
					href={imageObj.link.url}
					target={imageObj.link.target || "_blank"}
					rel={imageObj.link.rel || "noopener noreferrer"}
					className={classes.imageLink}
				>
					{imageElement}
				</Link>
			);
		}

		return imageElement;
	};

	const footerContent = (
		<AppBar
			id="footer"
			position="static"
			className={classes.grow}
		>
			<Toolbar className="header-container" style={{ height: "100%" }}>
				{/* Left side logos */}
				<Box display="flex" alignItems="center" gap={2}>
					{showDefaultCopyright && (
						<Box className={classes.box} component={Link} target="_blank" href="https://r4a.issel.ee.auth.gr" rel="noreferrer">
							<Image src={logo} alt="Logo" fit="contain" width="100%" height="100%" />
						</Box>
					)}
				</Box>

				<Box className={classes.grow} style={{ height: "100%" }} />

				<Box className={classes.grow} display="flex" style={{ height: "100%", justifyContent: "flex-end", alignItems: "center" }}>
					<div className={classes.messageContainer}>
						{customMessage && (
							<div className={hasMultipleImages ? classes.messageWithImages : classes.messageWithoutImages}>
								{/* Left image - only render if there are multiple images */}
								{hasMultipleImages && imagesToRender[0] && (
									<Box className={classes.customImageContainer}>
										{renderImage(imagesToRender[0], 0)}
									</Box>
								)}

								{/* Message content */}
								<Typography
									fontSize="small"
									color="inherit"
									className={hasMultipleImages ? classes.messageContentCentered : classes.messageContentLeft}
								>
									{customMessage}
									{customLink && (
										<>
											{" "}
											<Link
												href={customLink.url}
												target="_blank"
												rel="noopener noreferrer"
												color="inherit"
												sx={{ textDecoration: "underline" }}
											>
												{customLink.text}
											</Link>
										</>
									)}
								</Typography>

								{/* Right image - only render if there are multiple images */}
								{hasMultipleImages && imagesToRender[1] && (
									<Box className={classes.customImageContainer}>
										{renderImage(imagesToRender[1], 1)}
									</Box>
								)}
							</div>
						)}
						{showDefaultCopyright && (
							<Typography fontSize="small">
								{`@${(new Date()).getFullYear()} ISSEL | All Rights Reserved`}
							</Typography>
						)}
					</div>
				</Box>
			</Toolbar>
		</AppBar>
	);

	if (sticky) {
		return (
			<Grid
				item
				xs={12}
				className={classes.stickyContainer}
			>
				{footerContent}
			</Grid>
		);
	}

	return (
		<Grid item xs={12}>
			{footerContent}
		</Grid>
	);
};

export default memo(Footer);
