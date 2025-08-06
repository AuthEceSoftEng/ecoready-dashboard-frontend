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
	},
}));

const Footer = ({ customMessage, customLink, showDefaultCopyright = true, sticky = false }) => {
	const classes = useStyles();

	const footerContent = (
		<AppBar
			id="footer"
			position="static"
			className={classes.grow}
		>
			<Toolbar className="header-container">
				{showDefaultCopyright && (
					<Box className={classes.box} component={Link} target="_blank" href="https://r4a.issel.ee.auth.gr" rel="noreferrer">
						<Image src={logo} alt="Logo" fit="contain" width="100%" height="100%" />
					</Box>
				)}
				<Box className={classes.grow} style={{ height: "100%" }} />
				<Box className={classes.grow} display="flex" style={{ height: "100%", justifyContent: "flex-end", alignItems: "center" }}>
					<div className={classes.messageContainer}>
						{customMessage && (
							<Typography fontSize="small" color="inherit">
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
