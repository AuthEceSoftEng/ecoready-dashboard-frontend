import { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { Button, Grid, Menu, MenuItem, Typography } from "@mui/material";
import Image from "mui-image";
import { ExpandMore } from "@mui/icons-material";

// eslint-disable-next-line import/no-duplicates
import inspectionIcon from "../assets/icons/inspection.png";
// eslint-disable-next-line import/no-duplicates
import isselServicesIcon from "../assets/icons/inspection.png";

import Accordion from "./Accordion.js";

const useStyles = makeStyles((theme) => ({
	sidebar: {
		height: "100%",
		position: "absolute",
		backgroundColor: theme.palette.primary.main,
		color: "white",
		overflow: "auto",
	},
	toggleButton: {
		position: "absolute",
		top: "0",
		right: "0",
		zIndex: 1000,
		color: "white",
		padding: "4px", // Adjust padding to make the button smaller
		minWidth: "30px", // Set a smaller minimum width
		minHeight: "30px", // Set a smaller minimum height
	},
}));

const ButtonWithText = ({ text, icon, more, handler }) => (
	<span key={text}>
		{!more
		&& (
			<Button
				key={text}
				sx={{
			  width: "100%",
			  display: "flex",
			  flexDirection: "row",
			  justifyContent: "flex-start",
			  padding: "8px 40px 8px 16px",
				}}
				onClick={(event) => handler(event)}
			>
				{icon && <Image src={icon} alt={text} fit="contain" width="25px" />}
				<Typography
					align="center"
					color="white.main"
					fontSize="medium"
					ml={1}
					display="flex"
					alignItems="center"
					sx={{ textTransform: "capitalize" }}
				>
					{text}
					{more && <ExpandMore />}
				</Typography>
			</Button>
		)}
		{more
		&& (
			<Accordion
				key={text}
				title={(
					<Grid item sx={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-start" }}>
						{icon && <Image src={icon} alt={text} fit="contain" width="25px" />}
						<Typography
							align="center"
							color="white.main"
							fontSize="medium"
							ml={1}
							display="flex"
							alignItems="center"
							sx={{ textTransform: "capitalize" }}
						>
							{text}
						</Typography>
					</Grid>
				)}
				content={(
					<Grid container flexDirection="column" width="100%">
						{more.map((el) => (
							<Button key={el.title} color="white" onClick={el.handler}>
								<Typography sx={{ textTransform: "capitalize" }}>{el.title}</Typography>
							</Button>
						))}
					</Grid>
				)}
				alwaysExpanded={false}
				titleBackground="transparent"
				expandIconColor="white"
			/>
		)}
	</span>
);

const ButtonSimple = ({ text, icon, handler, ind }) => (
	<Button key={text} sx={{ minWidth: "30px!important", padding: "0px", marginTop: (ind === 0) ? "0px" : "10px" }} onClick={(event) => handler(event)}>
		<Image src={icon} alt={text} fit="contain" width="30px" />
	</Button>
);

const Sidebar = ({ isSmall: sidebarIsSmall }) => {
	const [isSmall, setIsSmall] = useState(false);
	const [anchorElServices, setAnchorElServices] = useState(null);
	const navigate = useNavigate();
	const classes = useStyles();

	const isMenuOpenServices = Boolean(anchorElServices);
	const handleServicesMenuOpen = (event) => setAnchorElServices(event.currentTarget);
	const handleServicesMenuClose = () => { setAnchorElServices(null); };

	useEffect(() => setIsSmall(sidebarIsSmall), [sidebarIsSmall]);

	const buttons = [
		{
			// icon: inspectionIcon,
			text: "Overview",
			handler: () => {
				handleServicesMenuClose();
				navigate("/home");
			},
		},
		// {
		// 	icon: inspectionIcon,
		// 	text: "Buttons",
		// 	handler: () => {
		// 		handleServicesMenuClose();
		// 		navigate("/buttons");
		// 	},

		{
			// icon: isselServicesIcon,
			text: "Living Labs",
			handler: (event) => {
				handleServicesMenuClose();
				handleServicesMenuOpen(event);
			},
			more: [
				{ title: "AgroLab", handler: () => navigate("/agrolab") },
				{ title: "HiveLab", handler: () => navigate("/hivelab") },
				// { title: "VertiLab", handler: () => navigate("/vertilab") },
			],
		},

	];

	const renderServicesMenu = (
		<Menu
			keepMounted
			anchorEl={anchorElServices}
			anchorOrigin={{ vertical: "top", horizontal: "right" }}
			transformOrigin={{ vertical: "top", horizontal: "right" }}
			open={isMenuOpenServices}
			onClose={handleServicesMenuClose}
		>
			{buttons.find((button) => button.text === "Living Labs").more.map((moreButton) => (
				<MenuItem key={moreButton.title} onClick={() => { handleServicesMenuClose(); moreButton.handler(); }}>
					<p style={{ marginLeft: "5px" }}>{moreButton.title}</p>
				</MenuItem>
			))}
		</Menu>
	);

	const toggleSidebar = () => {
		if (window.innerWidth >= 900) {
			setIsSmall(!isSmall);
		}
	};

	return (
		<div className={classes.sidebar} style={{ width: isSmall ? "50px" : "200px", padding: isSmall ? "20px 5px" : "20px 5px", textAlign: "center" }}>
			<Button
				className={classes.toggleButton}
				sx={{
					transform: isSmall ? "rotate(-90deg)" : "rotate(90deg)",
				}}
				onClick={toggleSidebar}
			>
				<ExpandMore fontSize="small" />
			</Button>
			{!isSmall && buttons.map((button) => (
				<ButtonWithText
					key={button.text}
					text={button.text}
					handler={button.handler}
					more={button.more}
				/>
			))}
			{isSmall && buttons.map((button, ind) => (
				<ButtonSimple
					key={button.text}
					text={button.text}
					handler={button.handler}
					more={button.more}
					ind={ind}
				/>
			))}
			{renderServicesMenu}
		</div>
	);
};

export default Sidebar;
