import { Box, Typography, Grid } from "@mui/material";
import { memo } from "react";

import colors from "../_colors.scss";

const Card = ({
	children,
	title = "",
	titleExists = true,
	titleColor = "white.main",
	titleBackgroundColor = "primary",
	titleFontSize = "16px",
	footer = "",
	footerExists = true,
	footerColor = "greyDark.main",
	footerBackgroundColor = "white.main",
	backgroundColor = "white.main",
	transparent = false,
	opacity = 1,
	footerFontSize = "16px",
	width = "100%",
	height = "auto",
	padding = "10px",
	borderRadius = "16px",
	onClick = null,
	clickable = false,
	hoverEffect = true,
	elevation = 1,
}) => (
	<Box
		sx={{
			width,
			height,
			padding,
			backgroundColor: transparent ? "transparent" : colors?.[backgroundColor] || backgroundColor,
			opacity: transparent ? opacity : 1,
			boxSizing: "border-box",
			overflow: "hidden",
			borderRadius: `${Number.parseInt(borderRadius, 10) + Number.parseInt(padding, 10)}px`,
			cursor: clickable ? "pointer" : "default",
			transition: "all 0.2s ease-in-out",
			boxShadow: transparent ? elevation : null,
			"&:hover": hoverEffect && clickable ? {
				transform: "scale(1.02)",
				boxShadow: transparent ? elevation + 15 : null,
			} : {},
		}}
		onClick={clickable ? onClick : undefined}
	>
		{titleExists && (
			<Grid
				width="100%"
				color={colors?.[titleColor] || titleColor}
				backgroundColor={colors?.[titleBackgroundColor] || titleBackgroundColor}
				padding="10px 20px"
				display="flex"
				flexDirection="row"
				justifyContent="center"
				alignItems="center"
				boxSizing="border-box"
				borderRadius={borderRadius}
				sx={{ flexShrink: 0 }}
			>
				{typeof title === "string" ? (
					<Typography variant="body" component="h2" sx={{ fontWeight: "bold", fontSize: titleFontSize }}>
						{title}
					</Typography>
				) : (
					title
				)}
			</Grid>
		)}
		<Grid
			width="100%"
			padding="10px 5px"
			justifyContent="center"
			alignItems="center"
			boxSizing="border-box"
			flexGrow={1}
		>
			{children}
		</Grid>
		{footerExists && (
			<Grid
				width="100%"
				color={colors?.[footerColor] || footerColor}
				backgroundColor={colors?.[footerBackgroundColor] || footerBackgroundColor}
				display="flex"
				flexDirection="column"
				justifyContent="space-between"
				alignItems="center"
				boxSizing="border-box"
				sx={{ flexShrink: 0 }}
			>
				{typeof footer === "string" ? (
					<Typography variant="h6" component="h2" align="left" fontSize={footerFontSize}>
						{footer}
					</Typography>
				) : (
					footer
				)}
			</Grid>
		)}
	</Box>
);

export default memo(Card);
