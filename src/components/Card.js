import { Box, Typography, Grid, Divider } from "@mui/material";
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
    footerFontSize = "16px",
    width = "100%",
    height = "auto",
    padding = "10px",
}) => (
    <Box
        sx={{
            width: "100%",
            height,
            padding,
            backgroundColor: colors?.[backgroundColor] || backgroundColor,
            boxSizing: "border-box", // Ensure padding is included in the width
            overflow: "hidden", // Prevent content overflow
        }}
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
                boxSizing="border-box" // Ensure padding is included in the width
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
            padding="10px 20px"
            justifyContent="center"
            alignItems="center"
            boxSizing="border-box" // Ensure padding is included in the width
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
                boxSizing="border-box" // Ensure padding is included in the width
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
