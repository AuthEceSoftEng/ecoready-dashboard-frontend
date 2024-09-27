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
}));

const ButtonWithText = ({ text, icon, more, handler }) => (
	<span key={text}>
		{!more
		&& (
			<Button key={text} sx={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-start", padding: "8px 40px 8px 16px" }} onClick={(event) => handler(event)}>
				<Image src={icon} alt={text} fit="contain" width="25px" />
				<Typography align="center" color="white.main" fontSize="medium" ml={1} display="flex" alignItems="center" sx={{ textTransform: "capitalize" }}>
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
						<Image src={icon} alt={text} fit="contain" width="25px" />
						<Typography align="center" color="white.main" fontSize="medium" ml={1} display="flex" alignItems="center" sx={{ textTransform: "capitalize" }}>
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
			icon: inspectionIcon,
			text: "Users",
			handler: () => {
				handleServicesMenuClose();
				navigate("/users");
			},
		},
		{
			icon: inspectionIcon,
			text: "Buttons",
			handler: () => {
				handleServicesMenuClose();
				navigate("/buttons");
			},
		},
		{
			icon: inspectionIcon,
			text: "Form",
			handler: () => {
				handleServicesMenuClose();
				navigate("/form");
			},
		},
		{
			icon: inspectionIcon,
			text: "Tooltip",
			handler: () => {
				handleServicesMenuClose();
				navigate("/tooltip");
			},
		},
		{
			icon: inspectionIcon,
			text: "Table",
			handler: () => {
				handleServicesMenuClose();
				navigate("/table");
			},
		},
		{
			icon: inspectionIcon,
			text: "File Upload",
			handler: () => {
				handleServicesMenuClose();
				navigate("/file-upload");
			},
		},
		{
			icon: inspectionIcon,
			text: "Broker",
			handler: () => {
				handleServicesMenuClose();
				navigate("/broker");
			},
		},
		{
			icon: inspectionIcon,
			text: "Plot",
			handler: () => {
				handleServicesMenuClose();
				navigate("/plot");
			},
		},
		{
			icon: inspectionIcon,
			text: "Accordion",
			handler: () => {
				handleServicesMenuClose();
				navigate("/accordion");
			},
		},
		{
			icon: inspectionIcon,
			text: "Search",
			handler: () => {
				handleServicesMenuClose();
				navigate("/search");
			},
		},
		{
			icon: inspectionIcon,
			text: "Toast",
			handler: () => {
				handleServicesMenuClose();
				navigate("/toast");
			},
		},
		{
			icon: inspectionIcon,
			text: "Popup",
			handler: () => {
				handleServicesMenuClose();
				navigate("/popup");
			},
		},
		{
			icon: inspectionIcon,
			text: "Dialog",
			handler: () => {
				handleServicesMenuClose();
				navigate("/dialog");
			},
		},
		{
			icon: inspectionIcon,
			text: "Dropdown",
			handler: () => {
				handleServicesMenuClose();
				navigate("/dropdown");
			},
		},
		{
			icon: inspectionIcon,
			text: "Date Picker",
			handler: () => {
				handleServicesMenuClose();
				navigate("/datepicker");
			},
		},
		{
			icon: inspectionIcon,
			text: "Localization",
			handler: () => {
				handleServicesMenuClose();
				navigate("/localization");
			},
		},
		{
			icon: isselServicesIcon,
			text: "Issel Services",
			handler: (event) => {
				handleServicesMenuClose();
				handleServicesMenuOpen(event);
			},
			more: [
				{ title: "Users", handler: () => navigate("/issel-services/users") },
				{ title: "Services", handler: () => navigate("/issel-services/services") },
				{ title: "Hacking", handler: () => navigate("/issel-services/hacking") },
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
			{buttons.find((button) => button.text === "Issel Services").more.map((moreButton) => (
				<MenuItem key={moreButton.title} onClick={() => { handleServicesMenuClose(); moreButton.handler(); }}>
					<p style={{ marginLeft: "5px" }}>{moreButton.title}</p>
				</MenuItem>
			))}
		</Menu>
	);

	return (
		<div className={classes.sidebar} style={{ width: (isSmall) ? "50px" : "200px", padding: (isSmall) ? "20px 5px" : "20px 5px", textAlign: "center" }}>
			{!isSmall && buttons.map((button) => (
				<ButtonWithText
					key={button.text}
					icon={button.icon}
					text={button.text}
					handler={button.handler}
					more={button.more}
				/>
			))}
			{isSmall && buttons.map((button, ind) => (
				<ButtonSimple
					key={button.text}
					icon={button.icon}
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
